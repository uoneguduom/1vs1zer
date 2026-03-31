import DevCamera from "./DevCamera";
import Light from "./Light";
import * as THREE from "three";
import Test from "./Test";
import Player from "./Player";
import Map from "./Map";

export default class Game {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer
    this.light = new Light(scene)
    this.devCamera = new DevCamera(renderer)
    this.player = new Player(scene)
    this.test = new Test(scene)
  }

  animate(delta, elapsed) {
    this.player.animate(delta)
    this.renderer = renderer;
    this.light = new Light(scene);
    this.devCamera = new DevCamera(renderer);
    // this.test = new Test(scene);
    this.map = new Map(scene);
  }

  animate(delta, elapsed) {
    // this.test.animate(delta);
  }
}
