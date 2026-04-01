import * as THREE from "three";

const BULLET_SPEED = 25;
const BULLET_MAX_DISTANCE = 60;

const bulletGeo = new THREE.SphereGeometry(0.06, 6, 6);
const bulletMat = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  emissive: 0xffaa00,
});

export default class BulletSystem {
  constructor(scene, player, playerCamera, map, ws) {
    this.scene = scene;
    this.player = player;
    this.playerCamera = playerCamera;
    this.map = map;
    this.ws = ws;
    this.bullets = [];
    this.hpDisplay = document.getElementById("hp");
    this.hitmarker = document.getElementById("hitmarker");
    this.damageIndicator = document.getElementById("damage-indicator");
    this._setupShoot();
  }

  _setupShoot() {
    document.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (document.pointerLockElement === null) return;
      if (this.player.isDead) return;
      this._shoot();
    });
  }

  _shoot() {
    const eyeOffset = new THREE.Vector3(0, 0.8, 0);
    const pos = this.player.position.clone().add(eyeOffset);

    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(
      new THREE.Euler(
        this.playerCamera.pitch,
        this.player.rotation.y,
        0,
        "YXZ",
      ),
    );

    this._spawnMesh(pos, dir, false);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "shoot",
          x: pos.x,
          y: pos.y,
          z: pos.z,
          dx: dir.x,
          dy: dir.y,
          dz: dir.z,
        }),
      );
    }
  }

  spawnBullet(pos, dir) {
    this._spawnMesh(
      new THREE.Vector3(pos.x, pos.y, pos.z),
      new THREE.Vector3(dir.x, dir.y, dir.z),
      true,
    );
  }

  _spawnMesh(pos, dir, isEnemy = false) {
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.bullets.push({ mesh, dir, distance: 0, isEnemy });
  }

  animate(delta) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const step = b.dir.clone().multiplyScalar(BULLET_SPEED * delta);
      b.mesh.position.add(step);
      b.distance += step.length();

      let remove = b.distance >= BULLET_MAX_DISTANCE;

      if (!remove) {
        const bb = new THREE.Box3().setFromObject(b.mesh);
        const playerBB = new THREE.Box3().setFromObject(this.player);
        if (b.isEnemy && !this.player.isDead && bb.intersectsBox(playerBB)) {
          remove = true;
          this.player.hp -= 25;
          this.hpDisplay.textContent = "❤ " + this.player.hp;
          this.damageIndicator.textContent = "-25";
          this.damageIndicator.style.transition = "none";
          this.damageIndicator.style.opacity = "1";
          requestAnimationFrame(() => {
            this.damageIndicator.style.transition = "opacity 2s ease-out";
            this.damageIndicator.style.opacity = "0";
          });
        }

        if (!b.isEnemy && this.remotePlayers) {
          for (const id in this.remotePlayers) {
            const rp = this.remotePlayers[id];
            const rpBB = new THREE.Box3().setFromObject(rp);
            if (bb.intersectsBox(rpBB)) {
              remove = true;
              this.hitmarker.style.opacity = "1";
              setTimeout(() => (this.hitmarker.style.opacity = "0"), 100);
              break;
            }
          }
        }

        for (const wallBB of this.map.wallBoundingBoxes) {
          if (bb.intersectsBox(wallBB)) {
            remove = true;
            break;
          }
        }
      }

      if (remove) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }
  }
}
