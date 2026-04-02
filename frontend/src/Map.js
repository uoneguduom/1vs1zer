import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load("/Kylian.jpg");
wallTexture.colorSpace = THREE.SRGBColorSpace;
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;

const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture });
const floorMat = new THREE.MeshStandardMaterial({ color: "rgb(47, 71, 94)" });

export default class Map {
  constructor(scene) {
    this.scene = scene;
    this.map = new THREE.Group();
    this.scene.add(this.map);
    this.wallBoundingBoxes = [];
    this.spawnPoints = [];
    this.createMap();
  }

  createMap() {
    const map = [
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0 ],
      [ 0, 3, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 3, 0 ],
      [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0 ],
      [ 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 2, 0, 0, 0, 0, 0, 2, 4, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 2, 0, 0, 0, 0, 0, 2, 4, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0 ],
      [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0 ],
      [ 0, 3, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 3, 0 ],
      [ 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    ];

    const rows = map.length;         // 21
    const cols = map[0].length;      // 31
    const offsetZ = (rows - 1) / 2;  // 10
    const offsetX = (cols - 1) / 2;  // 15

    // Sol unique couvrant toute la map
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(cols, rows), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    this.map.add(floor);

    // Cubes empilés selon la valeur de la matrice
    map.forEach((row, z) => {
      row.forEach((cell, x) => {
        const posX = x - offsetX;
        const posZ = z - offsetZ;

        if (cell === 0) {
          this.spawnPoints.push({ x: posX, z: posZ });
          return;
        }

        for (let i = 0; i < cell; i++) {
          const cube = new THREE.Mesh(cubeGeo, wallMat);
          cube.position.set(posX, 0.5 + i, posZ);
          cube.userData.isWall = true;
          this.map.add(cube);
        }
      });
    });

    this.addBoundaryWalls();
    this.buildWallBoundingBoxes();
  }

  addBoundaryWalls() {
    const invisibleMat = new THREE.MeshStandardMaterial({ visible: false });
    // Map : X de -15 à +15, Z de -10 à +10
    const boundaries = [
      { w: 32, h: 20, d: 2, x:  0,    y: 1, z: -11 }, // nord
      { w: 32, h: 20, d: 2, x:  0,    y: 1, z:  11 }, // sud
      { w: 2, h: 20, d: 22, x: -16,   y: 1, z:  0  }, // ouest
      { w: 2, h: 20, d: 22, x:  16,   y: 1, z:  0  }, // est
    ];

    for (const { w, h, d, x, y, z } of boundaries) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), invisibleMat);
      mesh.position.set(x, y, z);
      mesh.userData.isWall = true;
      this.map.add(mesh);
    }
  }

  _getTopY(cx, cz) {
    let top = 0;
    this.map.traverse((child) => {
      if (!child.isMesh || !child.userData.isWall) return;
      if (Math.abs(child.position.x - cx) < 0.1 && Math.abs(child.position.z - cz) < 0.1) {
        top = Math.max(top, child.position.y + 0.5);
      }
    });
    return top;
  }

  spawnDeathPile(x, z) {
    const offsets = [
      [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1],
    ];
    for (const [dx, dz] of offsets) {
      const cx = Math.min(15, Math.max(-15, Math.round(x) + dx));
      const cz = Math.min(10, Math.max(-10, Math.round(z) + dz));
      const baseY = this._getTopY(cx, cz);
      const height = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < height; i++) {
        const cube = new THREE.Mesh(cubeGeo, wallMat);
        cube.position.set(cx, baseY + 0.5 + i, cz);
        cube.userData.isWall = true;
        this.map.add(cube);
        this.wallBoundingBoxes.push(new THREE.Box3().setFromObject(cube));
      }
    }
  }

  getRandomSpawnPoint() {
    const i = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[i];
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
