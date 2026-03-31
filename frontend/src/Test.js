import * as THREE from "three"

const geometry = new THREE.BoxGeometry(3, 3, 3)
const material = new THREE.MeshStandardMaterial({color : "rgb(255, 0, 4)"})

export default class Test extends THREE.Object3D {
  constructor(scene) {
    super()
    this.scene = scene
    this.mesh = new THREE.Mesh(geometry, material)
    this.add(this.mesh)
    this.scene.add(this)
  }

  animate(delta) {
    this.rotation.y += delta
  }
}