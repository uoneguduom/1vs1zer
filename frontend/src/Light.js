import * as THREE from "three"

export default class Light {
  constructor(scene) {
    this.scene = scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight)
    this.light = new THREE.DirectionalLight(0xffffff, 5);
    this.light.position.set(1, 2, 10);
    this.scene.add(this.light);
  }
}