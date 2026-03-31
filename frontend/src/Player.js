import * as THREE from "three"
import { GRAVITY } from "./config"

const geometry = new THREE.BoxGeometry(3, 5, 3)
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
  }

  animate(delta) {
    this.gravity()
    this.moove()
  }
  
  moove() {
    this.position.y += this.velocityY
    this.position.x += this.velocityX
    this.position.z += this.velocityZ
  }

  gravity() {
    
  }
}