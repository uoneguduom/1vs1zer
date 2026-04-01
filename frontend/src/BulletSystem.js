import * as THREE from "three"

const BULLET_SPEED = 25
const BULLET_MAX_DISTANCE = 60

const bulletGeo = new THREE.SphereGeometry(0.06, 6, 6)
const bulletMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00 })

export default class BulletSystem {
  constructor(scene, player, playerCamera, map) {
    this.scene = scene
    this.player = player
    this.playerCamera = playerCamera
    this.map = map
    this.bullets = []
    this._setupShoot()
  }

  _setupShoot() {
    document.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return
      if (document.pointerLockElement === null) return
      this._shoot()
    })
  }

  _shoot() {
    const mesh = new THREE.Mesh(bulletGeo, bulletMat)

    const eyeOffset = new THREE.Vector3(0, 0.8, 0)
    mesh.position.copy(this.player.position).add(eyeOffset)

    const dir = new THREE.Vector3(0, 0, -1)
    dir.applyEuler(new THREE.Euler(this.playerCamera.pitch, this.player.rotation.y, 0, "YXZ"))

    this.scene.add(mesh)
    this.bullets.push({ mesh, dir, distance: 0 })
  }

  animate(delta) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      const step = b.dir.clone().multiplyScalar(BULLET_SPEED * delta)
      b.mesh.position.add(step)
      b.distance += step.length()

      let remove = b.distance >= BULLET_MAX_DISTANCE

      if (!remove) {
        const bb = new THREE.Box3().setFromObject(b.mesh)
        for (const wallBB of this.map.wallBoundingBoxes) {
          if (bb.intersectsBox(wallBB)) {
            remove = true
            break
          }
        }
      }

      if (remove) {
        this.scene.remove(b.mesh)
        this.bullets.splice(i, 1)
      }
    }
  }
}
