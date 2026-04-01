import * as THREE from "three";
import { GRAVITY, PLAYER_STAND_HEIGHT, PLAYER_SPEED } from "./config";

const geometry = new THREE.BoxGeometry(0.5, PLAYER_STAND_HEIGHT, 0.5);
const material = new THREE.MeshStandardMaterial({ color: "rgb(255, 0, 4)" });

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
          if (this.isGrounded) {
            this.velocityY = 5;
            this.isGrounded = false;
          }
          break;
        }
        case "ShifLeft": {
          if (this.isGrounded) {
            this.velocityY = 5;
            this.isGrounded = false;
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
    this.isGrounded = false;
    this.moove(delta);
    this.gravity(delta);
  }

  moove(delta) {
    this.position.y += this.velocityY * delta;

    const dirX =
      Math.sin(this.rotation.y) * -this.velocityZ +
      Math.cos(this.rotation.y) * -this.velocityX;
    const dirZ =
      Math.cos(this.rotation.y) * -this.velocityZ +
      Math.sin(this.rotation.y) * this.velocityX;

    this.position.x += dirX * delta;
    this.position.z += dirZ * delta;
  }

  gravity(delta) {
    this.velocityY -= GRAVITY * delta;
    const groundY = PLAYER_STAND_HEIGHT / 2;
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocityY = 0;
      this.isGrounded = true;
    }
  }

  respawn() {
    console.log("respawn appelé, map:", this.map);
    if (!this.map) return;
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
