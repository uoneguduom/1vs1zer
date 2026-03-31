import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export default class DevCamera {
  constructor(renderer) {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.z = -30
    camera.position.y = 50
    controls.update()

    this.camera = camera
    this.controls = controls
  }
}