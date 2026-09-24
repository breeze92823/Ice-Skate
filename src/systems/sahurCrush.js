import { SAHUR_INSTANCES } from './sahurFollow.js'
import { player } from './playerState.js'
import { health, die } from './playerHealth.js'
import { SAHUR_MODEL } from '../data/sahurModel.js'

// Touching any Sahur instance kills the player outright, whether it's
// mid-chase or walking home — same death/respawn flow as GiantBall's crush
// (systems/giantBallCrush.js) and Water's drowning (systems/playerHealth.js's
// die()), just a different cause. Capsule-vs-capsule: horizontal distance
// within the combined radii, and the two vertical spans (feet to head)
// overlap. RADIUS/HEIGHT come from SAHUR_MODEL rather than per-instance,
// since every instance shares the same rig scale (data/sahurModel.js's
// SAHUR_RIG).
const RADIUS = SAHUR_MODEL.baseRadius * SAHUR_MODEL.scale
const HEIGHT = SAHUR_MODEL.baseHeight * SAHUR_MODEL.scale

export function step() {
  if (health.dead) return

  for (const { sahur } of SAHUR_INSTANCES) {
    const dx = sahur.position.x - player.position.x
    const dz = sahur.position.z - player.position.z
    const horizontal = Math.hypot(dx, dz)

    const sahurBottom = sahur.position.y
    const sahurTop = sahur.position.y + HEIGHT
    const playerBottom = player.position.y
    const playerTop = player.position.y + player.dims.height

    if (horizontal <= RADIUS + player.dims.radius && sahurBottom <= playerTop && sahurTop >= playerBottom) {
      die()
      return
    }
  }
}
