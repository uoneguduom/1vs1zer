import * as THREE from "three"

export default class Light {
  constructor(scene) {
    this.scene = scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(this.ambientLight)

  }
}