import { player } from './playerState.js'
import { health, die } from './playerHealth.js'
import { HAMMERS, HAMMER_RADIUS, HAMMER_BOTTOM_Y, HAMMER_TOP_Y } from '../data/hammer.js'
import { hammerAnim } from './hammerAnim.js'

// Touching any of the 4 Hammer props (base or pole, wherever the shared
// drop/rise/hold cycle currently has them — see hammerAnim.js) kills the
// player outright — same death/respawn flow as GiantBall's crush
// (systems/giantBallCrush.js) and Sahur's (systems/sahurCrush.js), just a
// different cause. Cylinder-vs-capsule: horizontal distance within the
// combined radii, and the two vertical spans (feet to head) overlap.
export function step() {
  if (health.dead) return

  const dy = hammerAnim.offsetY
  const playerBottom = player.position.y
  const playerTop = player.position.y + player.dims.height

  for (const { position } of HAMMERS) {
    const dx = position[0] - player.position.x
    const dz = position[2] - player.position.z
    const horizontal = Math.hypot(dx, dz)
    if (horizontal > HAMMER_RADIUS + player.dims.radius) continue

    const hammerBottom = position[1] + HAMMER_BOTTOM_Y + dy
    const hammerTop = position[1] + HAMMER_TOP_Y + dy
    if (hammerBottom <= playerTop && hammerTop >= playerBottom) {
      die()
      return
    }
  }
}
