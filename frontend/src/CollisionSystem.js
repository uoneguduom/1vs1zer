import * as THREE from "three"

export default class CollisionSystem {
  constructor(player, map) {
    this.player = player
    this.map = map
    this._playerBox = new THREE.Box3()
  }

  resolve() {
    this._playerBox.setFromObject(this.player)

    for (const wallBox of this.map.wallBoundingBoxes) {
      if (!this._playerBox.intersectsBox(wallBox)) continue

      const overlapX = Math.min(this._playerBox.max.x, wallBox.max.x) - Math.max(this._playerBox.min.x, wallBox.min.x)
      const overlapY = Math.min(this._playerBox.max.y, wallBox.max.y) - Math.max(this._playerBox.min.y, wallBox.min.y)
      const overlapZ = Math.min(this._playerBox.max.z, wallBox.max.z) - Math.max(this._playerBox.min.z, wallBox.min.z)

      if (overlapY < overlapX && overlapY < overlapZ) {
        const playerCenterY = (this._playerBox.max.y + this._playerBox.min.y) / 2
        const wallCenterY = (wallBox.max.y + wallBox.min.y) / 2
        if (playerCenterY > wallCenterY) {
          this.player.position.y += overlapY
          if (this.player.velocityY < 0) {
            this.player.velocityY = 0
            this.player.isGrounded = true
          }
        } else {
          this.player.position.y -= overlapY
          if (this.player.velocityY > 0) this.player.velocityY = 0
        }
      } else if (overlapX < overlapZ) {
        const sign = this._playerBox.max.x + this._playerBox.min.x < wallBox.max.x + wallBox.min.x ? -1 : 1
        this.player.position.x += sign * overlapX
      } else {
        const sign = this._playerBox.max.z + this._playerBox.min.z < wallBox.max.z + wallBox.min.z ? -1 : 1
        this.player.position.z += sign * overlapZ
      }

      this._playerBox.setFromObject(this.player)
    }
  }
}
