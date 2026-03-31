import * as THREE from "three"

const geometry = new THREE.BoxGeometry(3, 3, 3)

export default class Test extends THREE.Object3D {
  constructor(scene, color = "rgb(255,0,4)") {
    super()
    this.scene = scene
    const material = new THREE.MeshStandardMaterial({color})
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2
    this.position.y = 0
    this.add(this.mesh)
    this.scene.add(this)
  }

  animate(delta) {

  }
}