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
    this.remotePlayers = {}
    this.ws = new WebSocket(`ws://${location.host}/ws`)
    this.remoteStates = {}

    this.ws.onmessage = (event) =>{
      const state = JSON.parse(event.data);
      if(state.type ==="init"){
        this.myId = state.id;
      }else {
        if (!this.remotePlayers[state.id]){
          this.remotePlayers[state.id] = new Test(this.scene, "rgb(0, 255, 0)");
        }
        this.remotePlayers[state.id].position.x = state.x
        this.remotePlayers[state.id].position.y = state.y
      }
    }
  }

  animate(delta, elapsed) {
    this.test.animate(delta)
    this._sendLocalState();
  }



  _sendLocalState(){
    if (this.ws.readyState === WebSocket.OPEN){
      this.ws.send(JSON.stringify({
        id: this.myId,
        x: this.test.position.x,
        y: this.test.position.y,
      }))
    }
  }


}
