import * as THREE from "three";
import { buildWeaponModel } from "./WeaponModels";

// ── Weapon definitions ─────────────────────────────────────────────────────

const WEAPONS = [
  {
    name: "deagle",
    auto: false,
    cooldown: 1.2,
    damage: 50,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.24, -0.20, -0.44], rot: [0, 0.28, 0], scale: 1.1,
  },
  {
    name: "minigun",
    auto: true,
    cooldown: 0.05,
    damage: 5,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.26, -0.18, -0.52], rot: [0, 0.20, 0], scale: 0.90,
  },
  {
    name: "akimbo",
    auto: false,
    cooldown: 0.3,
    damage: 15,
    range: 60,
    burst: 2,
    burstDelay: 0.04,
    pellets: 1,
    spread: 0.05,
    splash: false,
    splashRadius: 0,
    pos: [0, 0, 0], rot: [0, 0, 0], scale: 1.2, // handled by _loadModel
  },
  {
    name: "smg",
    auto: true,
    cooldown: 0.09,
    damage: 10,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.24, -0.20, -0.46], rot: [0, 0.25, 0], scale: 1.1,
  },
  {
    name: "shotgun",
    auto: false,
    cooldown: 1.0,
    damage: 40,
    range: 8,
    burst: 1,
    burstDelay: 0,
    pellets: 6,
    spread: 0.15,
    splash: false,
    splashRadius: 0,
    pos: [0.26, -0.18, -0.50], rot: [0, 0.22, 0], scale: 1.05,
  },
  {
    name: "p2000",
    auto: false,
    cooldown: 0,
    damage: 20,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.22, -0.20, -0.42], rot: [0, 0.28, 0], scale: 1.15,
  },
  {
    name: "ak",
    auto: true,
    cooldown: 0.17,
    damage: 25,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.26, -0.18, -0.50], rot: [0, 0.22, 0], scale: 1.0,
  },
  {
    name: "famas",
    auto: false,
    cooldown: 0.8,
    damage: 20,
    range: 60,
    burst: 3,
    burstDelay: 0.1,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    pos: [0.26, -0.18, -0.50], rot: [0, 0.22, 0], scale: 1.0,
  },
  {
    name: "rocket",
    auto: false,
    cooldown: 2.0,
    damage: 50,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: true,
    splashRadius: 3,
    pos: [0.28, -0.14, -0.52], rot: [0, 0.18, 0], scale: 0.95,
  },
  {
    name: "revolver",
    auto: false,
    cooldown: 0,
    damage: 100,
    range: 60,
    burst: 1,
    burstDelay: 0,
    pellets: 1,
    spread: 0,
    splash: false,
    splashRadius: 0,
    backward: true,
    pos: [0.24, -0.20, -0.44], rot: [0, 0.28, 0], scale: 1.05,
  },
];

const WEAPON_NAMES = WEAPONS.map(w => w.name);

// ── WeaponSystem ───────────────────────────────────────────────────────────

function makeScene() {
  const s = new THREE.Scene();
  s.add(new THREE.AmbientLight(0xffffff, 0.8));
  const d = new THREE.DirectionalLight(0xffffff, 1.2);
  d.position.set(1, 2, 1);
  s.add(d);
  return s;
}

export default class WeaponSystem {
  constructor() {
    // Right viewmodel scene (always used)
    this.viewScene  = makeScene();
    this.viewCamera = new THREE.PerspectiveCamera(75, 700 / 420, 0.01, 100);
    this.viewCamera.position.set(0, 0, 0);
    this.viewCamera.lookAt(0, 0, -1);

    // Left viewmodel scene (only for akimbo)
    this._viewSceneLeft  = null;

    // Pick a random weapon to start
    this._weaponIndex = Math.floor(Math.random() * WEAPONS.length);
    this._weaponDef   = WEAPONS[this._weaponIndex];

    // State
    this._cooldownLeft   = 0;
    this._burstQueue     = [];
    this._burstTimer     = 0;
    this._wasFiring      = false;

    this._modelGroup     = null;
    this._modelGroupLeft = null;
    this._loadModel();
  }

  // ── Public ────────────────────────────────────────────────────────────────

  get weaponName() { return this._weaponDef.name; }

  /** Returns array of {scene, side:'left'|'right'} for main.js to render */
  getViewports() {
    if (this._viewSceneLeft) {
      return [
        { scene: this._viewSceneLeft, side: "left"  },
        { scene: this.viewScene,      side: "right" },
      ];
    }
    return [{ scene: this.viewScene, side: "right" }];
  }

  // ── Model ─────────────────────────────────────────────────────────────────

  _loadModel() {
    // clean up previous
    if (this._modelGroup)     this.viewScene.remove(this._modelGroup);
    if (this._modelGroupLeft && this._viewSceneLeft)
      this._viewSceneLeft.remove(this._modelGroupLeft);
    this._viewSceneLeft  = null;
    this._modelGroupLeft = null;

    const def = this._weaponDef;

    if (def.name === "akimbo") {
      // Right pistol
      this._modelGroup = buildWeaponModel("akimbo");
      this._modelGroup.position.set(0.18, -0.22, -0.42);
      this._modelGroup.rotation.set(0, 0.28, 0);
      this._modelGroup.scale.setScalar(1.2);
      this.viewScene.add(this._modelGroup);

      // Left pistol (separate scene, mirrored)
      this._viewSceneLeft  = makeScene();
      this._modelGroupLeft = buildWeaponModel("akimbo_left");
      this._modelGroupLeft.position.set(-0.18, -0.22, -0.42);
      this._modelGroupLeft.rotation.set(0, -0.28, 0);
      this._modelGroupLeft.scale.setScalar(1.2);
      this._viewSceneLeft.add(this._modelGroupLeft);
    } else {
      this._modelGroup = buildWeaponModel(def.name);
      this._modelGroup.position.set(...def.pos);
      this._modelGroup.rotation.set(...def.rot);
      this._modelGroup.scale.setScalar(def.scale);
      this.viewScene.add(this._modelGroup);
    }
  }

  // ── Weapon change ─────────────────────────────────────────────────────────

  changeWeapon() {
    let next;
    do { next = Math.floor(Math.random() * WEAPONS.length); }
    while (next === this._weaponIndex && WEAPONS.length > 1);
    this._weaponIndex  = next;
    this._weaponDef    = WEAPONS[next];
    this._cooldownLeft = 0;
    this._burstQueue   = [];
    this._burstTimer   = 0;
    this._wasFiring    = false;
    this._loadModel();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Called every frame.
   * @param {number} delta  - seconds since last frame
   * @param {THREE.Vector3} playerPos
   * @param {THREE.Vector3} aimDir   - normalised look direction
   * @param {boolean} isMouseDown
   * @returns {Array} shots - array of {pos, dir, damage, range, splash, splashRadius}
   */
  update(delta, playerPos, aimDir, isMouseDown) {
    const def    = this._weaponDef;
    const shots  = [];

    // Tick cooldown
    if (this._cooldownLeft > 0) this._cooldownLeft -= delta;

    // ── Process burst queue ──────────────────────────────────────────────────
    if (this._burstQueue.length > 0) {
      this._burstTimer -= delta;
      while (this._burstTimer <= 0 && this._burstQueue.length > 0) {
        this._burstQueue.shift();
        shots.push(this._makeShotObject(def, playerPos, aimDir));
        if (this._burstQueue.length > 0) {
          this._burstTimer += def.burstDelay;
        } else {
          // burst complete — start inter-burst cooldown
          this._cooldownLeft = def.cooldown;
        }
      }
      // While burst is firing we do nothing else this frame
      this._wasFiring = isMouseDown;
      return shots;
    }

    // ── Trigger logic ────────────────────────────────────────────────────────
    const canShoot = this._cooldownLeft <= 0;
    let triggerPulled = false;

    if (def.auto) {
      triggerPulled = isMouseDown;
    } else {
      // semi-auto / burst: fire on leading edge only
      triggerPulled = isMouseDown && !this._wasFiring;
    }

    if (canShoot && triggerPulled) {
      if (def.burst > 1) {
        // Queue burst shots (first fires immediately, rest are deferred)
        // Fill queue with (burst-1) pending shots
        for (let i = 0; i < def.burst - 1; i++) this._burstQueue.push(i);
        this._burstTimer = def.burstDelay;
        shots.push(this._makeShotObject(def, playerPos, aimDir));
        // Cooldown set after burst completes (handled above)
      } else {
        shots.push(this._makeShotObject(def, playerPos, aimDir));
        // Apply cooldown (0 cooldown = only click speed limits it)
        this._cooldownLeft = def.cooldown;
      }
    }

    this._wasFiring = isMouseDown;
    return shots;
  }

  // ── Shot factory ──────────────────────────────────────────────────────────

  _makeShotObject(def, playerPos, aimDir) {
    const pos = playerPos.clone().add(new THREE.Vector3(0, 0.8, 0));

    if (def.pellets > 1) {
      // Return an array element per pellet wrapped in a single shot descriptor
      // Caller receives one entry but with pellets > 1 — BulletSystem handles it
      // Actually we return each pellet as a separate shot for simplicity
      return null; // handled below via _makeShots
    }

    let dir = aimDir.clone();

    // Revolver fires BACKWARD
    if (def.backward) dir.negate();

    // Akimbo spread: slight horizontal offset per bullet (burst of 2)
    if (def.name === "akimbo" && def.spread > 0) {
      const right = new THREE.Vector3(1, 0, 0);
      // alternating left/right — use a simple counter
      this._akimboSide = (this._akimboSide === undefined) ? 1 : -this._akimboSide;
      dir.addScaledVector(right, this._akimboSide * def.spread);
      dir.normalize();
    }

    return {
      pos,
      dir,
      damage:       def.damage,
      range:        def.range,
      splash:       def.splash,
      splashRadius: def.splashRadius,
    };
  }

  // Override update's shot creation for shotgun / multi-pellet weapons
  _expandShot(def, playerPos, aimDir) {
    const shots = [];
    const pos   = playerPos.clone().add(new THREE.Vector3(0, 0.8, 0));

    for (let i = 0; i < def.pellets; i++) {
      let dir = aimDir.clone();
      if (def.spread > 0) {
        dir.x += (Math.random() - 0.5) * 2 * def.spread;
        dir.y += (Math.random() - 0.5) * 2 * def.spread;
        dir.normalize();
      }
      shots.push({
        pos: pos.clone(),
        dir,
        damage:       def.damage,
        range:        def.range,
        splash:       def.splash,
        splashRadius: def.splashRadius,
      });
    }
    return shots;
  }
}

// Patch update to properly handle multi-pellet weapons
const _origUpdate = WeaponSystem.prototype.update;
WeaponSystem.prototype.update = function (delta, playerPos, aimDir, isMouseDown) {
  const def   = this._weaponDef;
  const shots = [];

  // Tick cooldown
  if (this._cooldownLeft > 0) this._cooldownLeft -= delta;

  // Process burst queue
  if (this._burstQueue.length > 0) {
    this._burstTimer -= delta;
    while (this._burstTimer <= 0 && this._burstQueue.length > 0) {
      this._burstQueue.shift();
      if (def.pellets > 1) {
        shots.push(...this._expandShot(def, playerPos, aimDir));
      } else {
        const s = this._makeShotObject(def, playerPos, aimDir);
        if (s) shots.push(s);
      }
      if (this._burstQueue.length > 0) {
        this._burstTimer += def.burstDelay;
      } else {
        this._cooldownLeft = def.cooldown;
      }
    }
    this._wasFiring = isMouseDown;
    return shots;
  }

  const canShoot     = this._cooldownLeft <= 0;
  let triggerPulled  = false;

  if (def.auto) {
    triggerPulled = isMouseDown;
  } else {
    triggerPulled = isMouseDown && !this._wasFiring;
  }

  if (canShoot && triggerPulled) {
    if (def.burst > 1) {
      for (let i = 0; i < def.burst - 1; i++) this._burstQueue.push(i);
      this._burstTimer = def.burstDelay;
      if (def.pellets > 1) {
        shots.push(...this._expandShot(def, playerPos, aimDir));
      } else {
        const s = this._makeShotObject(def, playerPos, aimDir);
        if (s) shots.push(s);
      }
    } else {
      if (def.pellets > 1) {
        shots.push(...this._expandShot(def, playerPos, aimDir));
      } else {
        const s = this._makeShotObject(def, playerPos, aimDir);
        if (s) shots.push(s);
      }
      this._cooldownLeft = def.cooldown;
    }
  }

  this._wasFiring = isMouseDown;
  return shots;
};
