import * as THREE from "three"

const geometry = new THREE.PlaneGeometry(50, 50)
const material = new THREE.MeshStandardMaterial({color : "rgb(255, 247, 0)"})

export default class Test extends THREE.Object3D {
  constructor(scene) {
    super()
    this.scene = scene
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2
    this.position.y = 0
    this.add(this.mesh)
    this.scene.add(this)
  }

  animate(delta) {

  }
}