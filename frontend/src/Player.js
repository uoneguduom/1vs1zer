import * as THREE from "three";
import { GRAVITY, PLAYER_STAND_HEIGHT, PLAYER_SPEED } from "./config";

const geometry = new THREE.BoxGeometry(0.5, PLAYER_STAND_HEIGHT, 0.5);

export default class Player extends THREE.Object3D {
  constructor(scene, map, color = "#4caf50") {
    super();
    this.scene = scene;
    this.isDead = false;
    const material = new THREE.MeshStandardMaterial({ color });
    this.body = new THREE.Mesh(geometry, material);
    this.add(this.body);
    this.scene.add(this);
    this.color = color;
    this.hp = 100;
    this.map = map;
    this.position.y = PLAYER_STAND_HEIGHT / 2;
    this.velocityY = 0;
    this.velocityX = 0;
    this.velocityZ = 0;
    this.isGrounded = false;
    this.jumpsLeft = 2;
    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashVelX = 0;
    this.dashVelZ = 0;
    this.dashBarEl = document.getElementById("dash-bar");
    this.control();
  }

  control() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW": {
          this.velocityZ = PLAYER_SPEED;
          break;
        }
        case "KeyS": {
          this.velocityZ = -PLAYER_SPEED;
          break;
        }
        case "KeyD": {
          this.velocityX = -PLAYER_SPEED;
          break;
        }
        case "KeyA": {
          this.velocityX = PLAYER_SPEED;
          break;
        }
        case "Space": {
          if (this.jumpsLeft > 0) {
            this.velocityY = 5;
            this.isGrounded = false;
            this.jumpsLeft--;
          }
          break;
        }
        case "ShiftLeft":
        case "ShiftRight": {
          if (this.dashCooldown <= 0 && !this.isDashing && (this.velocityX !== 0 || this.velocityZ !== 0)) {
            const DASH_SPEED = 30;
            const DASH_DURATION = 0.15;
            const dirX =
              Math.sin(this.rotation.y) * -this.velocityZ +
              Math.cos(this.rotation.y) * -this.velocityX;
            const dirZ =
              Math.cos(this.rotation.y) * -this.velocityZ +
              Math.sin(this.rotation.y) * this.velocityX;
            const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
            this.dashVelX = (dirX / len) * DASH_SPEED;
            this.dashVelZ = (dirZ / len) * DASH_SPEED;
            this.isDashing = true;
            this.dashTimer = DASH_DURATION;
            this.dashCooldown = 3;
          }
          break;
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
        case "KeyS": {
          this.velocityZ = 0;
          break;
        }
        case "KeyD":
        case "KeyA": {
          this.velocityX = 0;
          break;
        }
      }
    });
  }

  animate(delta) {
    if (this.isDead) return;
    if (this.hp <= 0) {
      console.log("hp <= 0, appel respawn, map:", this.map);
      this.respawn();
      return;
    }
    if (this.isGrounded) this.jumpsLeft = 2;
    this.isGrounded = false;
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
      if (this.dashCooldown < 0) this.dashCooldown = 0;
    }
    if (this.dashBarEl) {
      const pct = Math.min(1, 1 - this.dashCooldown / 3);
      this.dashBarEl.style.width = (pct * 100) + "%";
      this.dashBarEl.style.background = pct >= 1 ? "cyan" : "rgba(0,200,255,0.5)";
    }
    if (this.isDashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.dashVelX = 0;
        this.dashVelZ = 0;
      }
    }
    this.gravity(delta);
  }

  mooveX(delta) {
    const vx = this.isDashing ? this.dashVelX :
      Math.sin(this.rotation.y) * -this.velocityZ +
      Math.cos(this.rotation.y) * -this.velocityX;
    this.position.x += vx * delta;
  }

  mooveZ(delta) {
    const vz = this.isDashing ? this.dashVelZ :
      Math.cos(this.rotation.y) * -this.velocityZ +
      Math.sin(this.rotation.y) * this.velocityX;
    this.position.z += vz * delta;
  }

  gravity(delta) {
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

  respawn() {
    console.log("respawn appelé, map:", this.map);
    if (!this.map) return;
    const dx = this.position.x;
    const dz = this.position.z;
    this.map.spawnDeathPile(dx, dz);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "death", x: dx, z: dz, killerId: this.lastHitBy ?? null }));
    }
    console.log("isDead = true");
    this.isDead = true;
    this.position.set(0, 50, 0);
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;
    setTimeout(() => {
      console.log("respawn timeout déclenché");
      const point = this.map.getRandomSpawnPoint();
      this.position.set(point.x, PLAYER_STAND_HEIGHT / 2, point.z);
      this.hp = 100;
      document.getElementById("hp").textContent = "❤ 100";
      this.isDead = false;
      this.body.visible = true;
    }, 5000);
  }
}
