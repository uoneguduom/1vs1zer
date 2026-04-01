import DevCamera from "./DevCamera";
import Light from "./Light";
import Player from "./Player";
import Map from "./Map";
import PlayerCamera from "./PlayerCamera";
import CollisionSystem from "./CollisionSystem";
import BulletSystem from "./BulletSystem";

export default class Game {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer
    this.light = new Light(scene)
    this.player = new Player(scene)
    this.devCamera = new DevCamera(renderer)
    this.playerCamera = new PlayerCamera(renderer, this.player)
    this.map = new Map(scene)
    this.collisions = new CollisionSystem(this.player, this.map)
    this.bulletSystem = new BulletSystem(scene, this.player, this.playerCamera, this.map)
  }

  animate(delta) {
    this.player.animate(delta)
    this.collisions.resolve()
    this.playerCamera.update()
    this.bulletSystem.animate(delta)
  }
}
