import * as THREE from "three";

export default class Map {
  constructor(scene) {
    this.scene = scene;
    this.map = new THREE.Group();
    this.scene.add(this.map);
    this.createMap();
  }
  map = [];
}
