import * as THREE from "three";

const BULLET_SPEED = 25;

const bulletGeo     = new THREE.SphereGeometry(0.06, 6, 6);
const bulletMat     = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00 });
const rocketGeo     = new THREE.CylinderGeometry(0.04, 0.06, 0.25, 8);
const rocketMat     = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.6 });
const remoteBulletMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff0000 });

export default class BulletSystem {
  constructor(scene, player, playerCamera, map) {
    this.scene        = scene;
    this.player       = player;
    this.playerCamera = playerCamera;
    this.map          = map;
    this.bullets      = [];
    this.remotePlayers = {};

    // Reused objects — avoid per-frame allocation
    this._bulletBox = new THREE.Box3();
    this._targetBox = new THREE.Box3();
    this._step      = new THREE.Vector3();

    // Callbacks — wired by Game
    this.onHitEnemy   = null; // (targetId, damage) => void
    this.onHitByEnemy = null; // () => void
    this.onSplash     = null; // (pos, radius, damage) => void
  }

  // ── Local bullet (owned by this player, does damage) ──────────────────────

  /**
   * @param {object} shot  { pos, dir, damage, range, splash, splashRadius }
   */
  spawnLocalBullet(shot) {
    this._spawnMesh(
      shot.pos.clone(),
      shot.dir.clone().normalize(),
      false,
      shot.damage      ?? 25,
      shot.range       ?? 60,
      shot.splash      ?? false,
      shot.splashRadius ?? 0
    );
  }

  // ── Remote bullet (visual only, enemy bullets damage local player) ─────────

  spawnBullet(pos, dir) {
    this._spawnMesh(
      new THREE.Vector3(pos.x, pos.y, pos.z),
      new THREE.Vector3(dir.x, dir.y, dir.z).normalize(),
      true,
      25,   // default remote damage (handled server-side via hit msg)
      60,
      false,
      0
    );
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _spawnMesh(pos, dir, isEnemy, damage, range, splash, splashRadius) {
    const isRocket = splash && splashRadius > 0 && !isEnemy;
    const geo  = isRocket ? rocketGeo  : bulletGeo;
    const mat  = isEnemy  ? remoteBulletMat : (isRocket ? rocketMat : bulletMat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);

    if (isRocket) {
      // Orient cylinder along direction of travel
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }

    this.scene.add(mesh);
    this.bullets.push({ mesh, dir, distance: 0, isEnemy, damage, range, splash, splashRadius });
  }

  // ── Animation loop ────────────────────────────────────────────────────────

  animate(delta) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      this._step.copy(b.dir).multiplyScalar(BULLET_SPEED * delta);
      b.mesh.position.add(this._step);
      b.distance += this._step.length();

      let remove    = b.distance >= b.range;
      let splashPos = null;

      if (!remove) {
        this._bulletBox.setFromObject(b.mesh);
        const bx = b.mesh.position.x;
        const bz = b.mesh.position.z;

        // Enemy bullet hits local player
        if (b.isEnemy && !this.player.isDead) {
          this._targetBox.setFromObject(this.player);
          if (this._bulletBox.intersectsBox(this._targetBox)) {
            remove = true;
            this.onHitByEnemy?.();
          }
        }

        // Local bullet hits remote players
        if (!b.isEnemy) {
          for (const id in this.remotePlayers) {
            this._targetBox.setFromObject(this.remotePlayers[id]);
            if (this._bulletBox.intersectsBox(this._targetBox)) {
              remove = true;
              if (b.splash) splashPos = b.mesh.position.clone();
              this.onHitEnemy?.(id, b.damage);
              break;
            }
          }
        }

        // All bullets hit walls — broad phase: skip walls far from bullet
        if (!remove) {
          for (const wallBB of this.map.wallBoundingBoxes) {
            if (wallBB.min.x > bx + 1 || wallBB.max.x < bx - 1 ||
                wallBB.min.z > bz + 1 || wallBB.max.z < bz - 1) continue;
            if (this._bulletBox.intersectsBox(wallBB)) {
              remove = true;
              if (!b.isEnemy && b.splash) splashPos = b.mesh.position.clone();
              break;
            }
          }
        }
      } else if (!b.isEnemy && b.splash) {
        splashPos = b.mesh.position.clone();
      }

      if (remove) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);

        if (splashPos) {
          this.onSplash?.(splashPos, b.splashRadius, b.damage);
        }
      }
    }
  }
}
