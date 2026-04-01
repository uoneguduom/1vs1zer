import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export default class DevCamera {
  constructor(renderer) {
    this.renderer = renderer
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = -10
    this.camera.position.y = 10
    this.controls.update()
  }
}