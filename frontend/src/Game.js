import * as THREE from "three";
import Light from "./Light";
import Player from "./Player";
import Map from "./Map";
import PlayerCamera from "./PlayerCamera";
import CollisionSystem from "./CollisionSystem";
import BulletSystem from "./BulletSystem";
import NetworkManager from "./NetworkManager";
import HUD from "./HUD";
import WeaponSystem from "./WeaponSystem";

function randomCapColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 30);
  const l = 45 + Math.floor(Math.random() * 20);
  return `hsl(${h},${s}%,${l}%)`;
}

export default class Game {
  constructor(scene, renderer) {
    this.scene    = scene;
    this.renderer = renderer;
    this.running  = false;
    this.myId     = null;
    this.myPseudo = null;
    this.myCapColor = randomCapColor();
    this.kills    = 0;
    this.remotePlayers = {};
    this.remoteCapColors = {};

    // Mouse state (tracked here, used by WeaponSystem)
    this._isMouseDown = false;

    // Perf: throttle network sends + reuse objects
    this._sendTimer = 0;
    this._aimDir    = new THREE.Vector3();
    this._aimEuler  = new THREE.Euler();

    this.hud = new HUD();
    this.net = new NetworkManager(`ws://${window.location.hostname}:3000/ws`);

    // Leaderboard data: { [id]: { pseudo, kills, color } }
    this._lbData = {};

    this._setupNetwork();
    this._setupMouseState();
  }

  _updateLeaderboard() {
    this.hud.updateLeaderboard(Object.values(this._lbData));
  }

  // ── Mouse state ───────────────────────────────────────────────────────────

  _setupMouseState() {
    document.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (document.pointerLockElement !== null) this._isMouseDown = true;
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button !== 0) return;
      this._isMouseDown = false;
    });
  }

  // ── Network ───────────────────────────────────────────────────────────────

  _setupNetwork() {
    this.net.on("init", ({ id }) => {
      this.myId = id;
      if (this.player) this.player.myId = id;
      // Register local player in leaderboard
      this._lbData[id] = { pseudo: this.myPseudo ?? "moi", kills: 0, color: this.myCapColor };
      this._updateLeaderboard();
    });

    this.net.on("game_start", ({ startedAt, duration }) => {
      this.hud.startTimer(startedAt, duration);
    });

    this.net.on("game_end", ({ scores }) => {
      this.onGameEnd?.(scores);
    });

    this.net.on("player_left", ({ id }) => {
      this._removeRemotePlayer(id);
      delete this._lbData[id];
      this._updateLeaderboard();
    });

    this.net.on("hit", ({ targetId, shooterId, damage }) => {
      if (targetId !== this.myId) return;
      this.player.lastHitBy = shooterId;
      const dmg = damage ?? 25;
      this.player.hp -= dmg;
      this.hud.setHp(this.player.hp);
      this.hud.showDamage(dmg);
    });

    this.net.on("death", ({ x, z, killerId }) => {
      if (this.map) this.map.spawnDeathPile(x, z);
      if (killerId === this.myId) {
        this.kills++;
        this.hud.setKills(this.kills);
      }
      if (killerId && this._lbData[killerId]) {
        this._lbData[killerId].kills++;
        this._updateLeaderboard();
      }
    });

    this.net.on("shoot", ({ x, y, z, dx, dy, dz }) => {
      this.bulletSystem?.spawnBullet({ x, y, z }, { x: dx, y: dy, z: dz });
    });

    this.net.on("explosion", ({ x, y, z, radius, damage }) => {
      // Remove blocks in radius
      this.map?.removeBlocksInRadius(x, y, z, radius);
      // Damage local player if in radius
      if (this.player && !this.player.isDead) {
        const dist = this.player.position.distanceTo(new THREE.Vector3(x, y, z));
        if (dist <= radius) {
          const dmg = Math.round(damage * (1 - dist / radius));
          this.player.hp -= dmg;
          this.hud.setHp(this.player.hp);
          this.hud.showDamage(dmg);
        }
      }
    });

    // Position of a remote player
    this.net.on("position", (state) => {
      if (state.id === this.myId) return;
      const rp = this._getOrCreateRemotePlayer(state.id, state.pseudo, state.capColor);
      if (!rp._targetPos) rp.position.set(state.x, state.y, state.z);
      rp._targetPos = new THREE.Vector3(state.x, state.y, state.z);
      // Register in leaderboard if first time seen
      if (!this._lbData[state.id]) {
        this._lbData[state.id] = { pseudo: state.pseudo ?? state.id.slice(0, 8), kills: 0, color: state.capColor ?? "#ffffff" };
        this._updateLeaderboard();
      }
    });
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────

  join(pseudo) {
    this.myPseudo = pseudo;
    this._buildWorld();
    this.kills = 0;
    this.hud.reset();
    this.running = true;
    // myId peut déjà être connu (init reçu avant le clic) → mettre à jour l'entrée lb
    if (this.myId) {
      this._lbData[this.myId] = { pseudo, kills: 0, color: this.myCapColor };
      this._updateLeaderboard();
    }
    this.net.whenReady(() => this.net.send({ type: "join", pseudo }));
  }

  // ── Build world ───────────────────────────────────────────────────────────

  _buildWorld() {
    this.map   = new Map(this.scene);
    this.light = new Light(this.scene);

    this.player = new Player(this.scene, this.map, this.myCapColor, this.myCapColor);
    this.player.body.traverse(c => { if (c.isMesh) c.layers.set(1); });
    this.player.myId = this.myId;

    this.player.onDashCharge = (pct) => this.hud.setDashCharge(pct);
    this.player.onDeath = (x, z, killerId) => {
      this.map.spawnDeathPile(x, z);
      this.net.send({ type: "death", x, z, killerId: killerId ?? null });
      // On ne reçoit pas notre propre broadcast → mise à jour locale du leaderboard
      if (killerId && this._lbData[killerId]) {
        this._lbData[killerId].kills++;
        this._updateLeaderboard();
      }
      // Change weapon on death
      if (this.weaponSystem) {
        this.weaponSystem.changeWeapon();
        this.hud.setWeapon(this.weaponSystem.weaponName);
      }
      this._respawnTimeout = setTimeout(() => {
        if (!this.player) return; // game already reset
        const point = this.map.getRandomSpawnPoint();
        this.player.respawn(point);
        this.hud.setHp(100);
      }, 5000);
    };

    this.playerCamera = new PlayerCamera(this.renderer, this.player);
    this.collisions   = new CollisionSystem(this.player, this.map);

    // Weapon system
    this.weaponSystem = new WeaponSystem();
    this.hud.setWeapon(this.weaponSystem.weaponName);

    // Bullet system
    this.bulletSystem = new BulletSystem(this.scene, this.player, this.playerCamera, this.map);
    this.bulletSystem.remotePlayers = this.remotePlayers;

    this.bulletSystem.onHitEnemy = (targetId, damage) => {
      this.hud.showHitmarker();
      this.net.send({ type: "hit", targetId, shooterId: this.myId, damage });
    };

    this.bulletSystem.onSplash = (pos, radius, damage) => {
      // Damage local player if in blast radius
      if (!this.player.isDead) {
        const dist = this.player.position.distanceTo(pos);
        if (dist <= radius) {
          const dmg = Math.round(damage * (1 - dist / radius));
          this.player.hp -= dmg;
          this.hud.setHp(this.player.hp);
          this.hud.showDamage(dmg);
        }
      }
      // Remove nearby blocks
      this.map.removeBlocksInRadius(pos.x, pos.y, pos.z, radius);
      // Notify remote clients
      this.net.send({
        type: "explosion",
        x: pos.x, y: pos.y, z: pos.z,
        radius,
        damage,
      });
    };
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetGame() {
    this.running = false;

    // Cancel pending respawn
    clearTimeout(this._respawnTimeout);

    // Remove all bullet meshes from scene before nulling bulletSystem
    if (this.bulletSystem) {
      for (const b of this.bulletSystem.bullets) this.scene.remove(b.mesh);
      this.bulletSystem = null;
    }

    for (const id of Object.keys(this.remotePlayers)) this._removeRemotePlayer(id);

    if (this.light) {
      this.scene.remove(this.light.ambientLight);
      this.light = null;
    }

    if (this.map)    { this.scene.remove(this.map.map); this.map = null; }

    if (this.player) {
      this.player.destroy();
      this.scene.remove(this.player);
      this.player = null;
    }

    if (this.playerCamera) {
      this.playerCamera.destroy();
      this.playerCamera = null;
    }

    this.collisions    = null;
    this.weaponSystem  = null;
    this.kills         = 0;
    this._lbData       = {};
    this._sendTimer    = 0;
    this.hud.stopTimer();
  }

  // ── Remote players ────────────────────────────────────────────────────────

  _getOrCreateRemotePlayer(id, pseudo, capColor) {
    if (!this.remotePlayers[id]) {
      const cc = capColor ?? this.remoteCapColors[id] ?? randomCapColor();
      this.remoteCapColors[id] = cc;
      this.remotePlayers[id] = new Player(this.scene, null, cc, cc);
      this.hud.createLabel(id, pseudo);
    }
    return this.remotePlayers[id];
  }

  _removeRemotePlayer(id) {
    if (this.remotePlayers[id]) {
      this.scene.remove(this.remotePlayers[id]);
      delete this.remotePlayers[id];
    }
    this.hud.removeLabel(id);
  }

  _updateLabels() {
    for (const id in this.remotePlayers) {
      const pos = this.remotePlayers[id].position.clone();
      pos.y += 1.2;
      pos.project(this.playerCamera.camera);
      const visible = pos.z <= 1;
      this.hud.updateLabel(
        id,
        (pos.x * 0.5 + 0.5) * window.innerWidth,
        (-pos.y * 0.5 + 0.5) * window.innerHeight,
        visible
      );
    }
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  animate(delta) {
    if (!this.running || !this.player) return;

    this.player.animate(delta);
    if (!this.player.isDead) {
      this.player.mooveX(delta);
      this.collisions.resolve();
      this.player.mooveZ(delta);
      this.collisions.resolve();
    }

    this.playerCamera.update();

    // Weapon system — compute aim direction from camera (reuse objects)
    if (this.weaponSystem && !this.player.isDead) {
      this._aimEuler.set(this.playerCamera.pitch, this.player.rotation.y, 0, "YXZ");
      this._aimDir.set(0, 0, -1).applyEuler(this._aimEuler);
      const shots = this.weaponSystem.update(
        delta,
        this.player.position,
        this._aimDir,
        this._isMouseDown
      );
      for (const shot of shots) {
        this.bulletSystem.spawnLocalBullet(shot);
        this.net.send({
          type: "shoot",
          x: shot.pos.x, y: shot.pos.y, z: shot.pos.z,
          dx: shot.dir.x, dy: shot.dir.y, dz: shot.dir.z,
        });
      }
    }

    for (const rp of Object.values(this.remotePlayers)) {
      if (rp._targetPos) rp.position.lerp(rp._targetPos, delta * 15);
    }

    this.bulletSystem.animate(delta);
    this._sendLocalState(delta);
    this._updateLabels();
  }

  _sendLocalState(delta) {
    this._sendTimer += delta;
    if (this._sendTimer < 0.05) return; // 20 Hz max
    this._sendTimer = 0;
    if (!this.myId || !this.player) return;
    this.net.send({
      type:     "position",
      id:       this.myId,
      pseudo:   this.myPseudo,
      capColor: this.myCapColor,
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z,
    });
  }
}
