import DevCamera from "./DevCamera";
import Light from "./Light";
import * as THREE from "three"
import Test from "./Test";

export default class Game {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer
    this.light = new Light(scene)
    this.devCamera = new DevCamera(renderer)
    this.test = new Test(scene)
  }

  animate(delta, elapsed) {
    this.test.animate(delta)
  }
}