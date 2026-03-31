import * as THREE from "three";

const wallGeo = new THREE.BoxGeometry(1, 2, 1);
const wallMat = new THREE.MeshStandardMaterial({ color: 0x00ffaa });

const HalfwallGeo = new THREE.BoxGeometry(1, 1, 1);
const pathMat = new THREE.MeshStandardMaterial({ color: 0x444444 });

export default class Map {
  constructor(scene) {
    this.scene = scene;
    this.map = new THREE.Group();
    this.scene.add(this.map);
    this.wallBoundingBoxes = [];
    this.createMap();
  }
  createMap() {
    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    const offset = (map.length - 1) / 2;

    map.forEach((row, z) => {
      row.forEach((cell, x) => {
        const posX = x - offset;
        const posZ = z - offset;

        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(posX, 1, posZ);
          this.map.add(wall);
        } else if (cell === 2) {
          const halfWall = new THREE.Mesh(HalfwallGeo, wallMat);
          halfWall.position.set(posX, 0.5, posZ);
          this.map.add(halfWall);
        } else {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 1),
            pathMat,
          );
          tile.position.set(posX, 0, posZ);
          this.map.add(tile);
        }
      });
    });
  }

  buildWallBoundingBoxes() {
    this.wallBoundingBoxes = [];
    this.map.traverse((child) => {
      if (!child.isMesh || !child.userData.isWall) return;
      this.wallBoundingBoxes.push(new THREE.Box3().setFromObject(child));
    });

    return this.wallBoundingBoxes;
  }
}
