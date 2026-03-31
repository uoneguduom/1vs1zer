import * as THREE from "three"
import { GRAVITY, PLAYER_STAND_HEIGHT } from "./config"

const geometry = new THREE.BoxGeometry(3, PLAYER_STAND_HEIGHT, 3)
const material = new THREE.MeshStandardMaterial({color : "rgb(255, 0, 4)"})

export default class Player extends THREE.Object3D {
  constructor(scene) {

    // Création du personnage
    super()
    this.scene = scene
    this.body = new THREE.Mesh(geometry, material)
    this.add(this.body)
    this.scene.add(this)
    this.position.y = 10

    this.velocityY = 0
    this.velocityX = 0
    this.velocityZ = 0
    this.control()
  }

  control() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW": {
          break;
        }
        case "KeyS": {
          break;
        }
        case "KeyD": {
          break;
        }
        case "KeyA": {
          break;
        }
        case "KeyS": {
          velocityY += 10
          break
        }
      }
    });
  }

  animate(delta) {
    this.gravity(delta)
    this.moove(delta)
  }
  
  moove(delta) {
    this.position.y += this.velocityY * delta
    this.position.x += this.velocityX
    this.position.z += this.velocityZ
  }

  gravity() {
    if (this.position.y >= PLAYER_STAND_HEIGHT / 2 ) {
      this.velocityY -= GRAVITY * delta
    }
  }
}