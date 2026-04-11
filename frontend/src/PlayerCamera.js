import * as THREE from "three"

export default class PlayerCamera {
  constructor(renderer, player) {
    this.renderer = renderer
    this.player = player
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    this.camera.layers.disable(1)

    this.offset = new THREE.Vector3(0, 0.8, 0)
    this.pitch = 0
    this.sensitivity = 0.002

    this._setupPointerLock()
  }

  destroy() {
    this._lockAbort?.abort();
  }

  _setupPointerLock() {
    this._lockAbort = new AbortController();
    const signal = this._lockAbort.signal;

    this.renderer.domElement.addEventListener("click", () => {
      this.renderer.domElement.requestPointerLock()
    }, { signal })

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== this.renderer.domElement) return
      this.player.rotation.y -= e.movementX * this.sensitivity
      this.pitch -= e.movementY * this.sensitivity
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
    }, { signal })
  }

  update() {
    this.camera.position.copy(this.player.position).add(this.offset)

    this.camera.rotation.order = "YXZ"
    this.camera.rotation.y = this.player.rotation.y
    this.camera.rotation.x = this.pitch
  }
}
