import DevCamera from "./DevCamera";
import Light from "./Light";
import Player from "./Player";
import Map from "./Map";
import PlayerCamera from "./PlayerCamera";
import CollisionSystem from "./CollisionSystem";

export default class Game {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer
    this.light = new Light(scene)
    this.player = new Player(scene)
    this.devCamera = new DevCamera(renderer)
    this.playerCamera = new PlayerCamera(renderer, this.player)
    this.map = new Map(scene)
    this.remotePlayers = {}
    this.collisions = new CollisionSystem(this.player, this.map)
    this.ws = new WebSocket("ws://localhost:3000/ws");
    this.ws.onmessage = (event) => {
      const state = JSON.parse(event.data);
      if (state.type === "init") {
        this.myId = state.id;
      } else {
        if (!this.remotePlayers[state.id]) {
          this.remotePlayers[state.id] = new Player(
            this.scene,
            "rgb(255, 0, 0)",
          );
        }
        this.remotePlayers[state.id].position.x = state.x;
        this.remotePlayers[state.id].position.y = state.y;
        this.remotePlayers[state.id].position.z = state.z;
      }
    };
  }

  _sendLocalState() {
    if (!this.myId) return;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          id: this.myId,
          x: this.player.position.x,
          y: this.player.position.y,
          z:this.player.position.z,
        }),
      );
    }
  }
  
  animate(delta, elapsed) {
    this.player.animate(delta)
    this.collisions.resolve()
    this.playerCamera.update()
    this._sendLocalState()
  }
}
