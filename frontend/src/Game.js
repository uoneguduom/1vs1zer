import DevCamera from "./DevCamera";
import Light from "./Light";
import * as THREE from "three"
import Test from "./Test";
import Player from "./Player";

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
  }
}