import * as THREE from "three";
import { GRAVITY, PLAYER_STAND_HEIGHT, PLAYER_SPEED } from "./config";

export default class Player extends THREE.Object3D {
  constructor(scene, map, color = "#4caf50", capColor = null) {
    super();
    this.scene = scene;
    this.map = map;
    this.isDead = false;
    this.hp = 100;
    this.lastHitBy = null;

    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;
    this.isGrounded = false;
    this.jumpsLeft = 2;

    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashVelX = 0;
    this.dashVelZ = 0;

    // Callbacks — branchés par Game
    this.onDeath = null;        // (x, z) => void
    this.onDashCharge = null;   // (pct) => void

    const mat     = new THREE.MeshStandardMaterial({ color });
    const capMat  = new THREE.MeshStandardMaterial({ color: capColor ?? 0xff0000 });
    const brimMat = capMat;

    // Corps (cylindre)
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 16), mat);
    bodyMesh.position.y = 0.35;

    // Tête (sphère)
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat);
    headMesh.position.y = 0.92;

    // Calotte de la casquette
    const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 16), capMat);
    capMesh.position.y = 1.1;

    // Visière
    const brimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16, 1, false, 0, Math.PI), brimMat);
    brimMesh.position.set(0.14, 1.04, 0);

    this.body = new THREE.Group();
    this.body.add(bodyMesh, headMesh, capMesh, brimMesh);
    this.add(this.body);
    this.scene.add(this);
    this.position.y = PLAYER_STAND_HEIGHT / 2;

    this._setupControls();
  }

  destroy() {
    this._controlsAbort?.abort();
  }

  _setupControls() {
    this._controlsAbort = new AbortController();
    const signal = this._controlsAbort.signal;
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW": this.velocityZ =  PLAYER_SPEED; break;
        case "KeyS": this.velocityZ = -PLAYER_SPEED; break;
        case "KeyD": this.velocityX = -PLAYER_SPEED; break;
        case "KeyA": this.velocityX =  PLAYER_SPEED; break;
        case "Space": {
          if (this.isDead) {
            this.velocityY = PLAYER_SPEED;
          } else if (this.jumpsLeft > 0) {
            this.velocityY = 5;
            this.isGrounded = false;
            this.jumpsLeft--;
          }
          break;
        }
        case "ControlLeft":
        case "ControlRight": {
          if (this.isDead) this.velocityY = -PLAYER_SPEED;
          break;
        }
        case "ShiftLeft":
        case "ShiftRight": {
          if (this.dashCooldown <= 0 && !this.isDashing && (this.velocityX !== 0 || this.velocityZ !== 0)) {
            const DASH_SPEED = 30;
            const dirX = Math.sin(this.rotation.y) * -this.velocityZ + Math.cos(this.rotation.y) * -this.velocityX;
            const dirZ = Math.cos(this.rotation.y) * -this.velocityZ + Math.sin(this.rotation.y) *  this.velocityX;
            const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
            this.dashVelX = (dirX / len) * DASH_SPEED;
            this.dashVelZ = (dirZ / len) * DASH_SPEED;
            this.isDashing = true;
            this.dashTimer = 0.15;
            this.dashCooldown = 3;
          }
          break;
        }
      }
    }, { signal });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
        case "KeyS": this.velocityZ = 0; break;
        case "KeyD":
        case "KeyA": this.velocityX = 0; break;
        case "Space":
        case "ControlLeft":
        case "ControlRight": {
          if (this.isDead) this.velocityY = 0;
          break;
        }
      }
    }, { signal });
  }

  animate(delta) {
    if (this.isDead) {
      this.position.x += (Math.sin(this.rotation.y) * -this.velocityZ + Math.cos(this.rotation.y) * -this.velocityX) * delta;
      this.position.z += (Math.cos(this.rotation.y) * -this.velocityZ + Math.sin(this.rotation.y) *  this.velocityX) * delta;
      this.position.y += this.velocityY * delta;
      return;
    }

    if (this.hp <= 0) {
      this._die();
      return;
    }

    if (this.isGrounded) this.jumpsLeft = 2;
    this.isGrounded = false;

    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - delta);
      this.onDashCharge?.(1 - this.dashCooldown / 3);
    } else {
      this.onDashCharge?.(1);
    }

    if (this.isDashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.dashVelX = 0;
        this.dashVelZ = 0;
      }
    }

    this._gravity(delta);
  }

  mooveX(delta) {
    const vx = this.isDashing
      ? this.dashVelX
      : Math.sin(this.rotation.y) * -this.velocityZ + Math.cos(this.rotation.y) * -this.velocityX;
    this.position.x += vx * delta;
  }

  mooveZ(delta) {
    const vz = this.isDashing
      ? this.dashVelZ
      : Math.cos(this.rotation.y) * -this.velocityZ + Math.sin(this.rotation.y) * this.velocityX;
    this.position.z += vz * delta;
  }

  _gravity(delta) {
    this.position.y += this.velocityY * delta;
    this.velocityY -= GRAVITY * delta;
    const groundY = PLAYER_STAND_HEIGHT / 2;
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocityY = 0;
      this.isGrounded = true;
      this.jumpsLeft = 2;
    }
  }

  _die() {
    this.isDead = true;
    this.body.traverse(c => { if (c.isMesh) c.visible = false; });
    const x = this.position.x;
    const z = this.position.z;
    this.position.set(x, 15, z);
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;
    this.onDeath?.(x, z, this.lastHitBy);
  }

  respawn(spawnPoint) {
    this.position.set(spawnPoint.x, PLAYER_STAND_HEIGHT / 2, spawnPoint.z);
    this.hp = 100;
    this.lastHitBy = null;
    this.isDead = false;
    this.body.traverse(c => { if (c.isMesh) c.visible = true; });
  }
}
