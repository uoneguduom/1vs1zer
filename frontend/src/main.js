import * as THREE from "three";
import Game from "./Game";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const game = new Game(scene, renderer);

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  game.animate(delta, elapsed);

  renderer.render(scene, game.devCamera.camera);
}

renderer.setAnimationLoop(animate);
