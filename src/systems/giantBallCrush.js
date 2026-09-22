import { GIANT_BALL } from '../data/giantBall.js'
import { giantBall } from './giantBallPhysics.js'
import { player } from './playerState.js'
import { health, die } from './playerHealth.js'

// Crushed under Giant_Ball: horizontally within the ball's footprint (its
// radius plus the player's own capsule radius) and the ball's underside has
// dropped to/below the player's own height range (feet to head) — same
// death/respawn flow as Water.jsx's drowning (systems/playerHealth.js's
// die()), just a different cause.
export function step() {
  if (health.dead) return

  const dx = giantBall.position.x - player.position.x
  const dz = giantBall.position.z - player.position.z
  const horizontal = Math.hypot(dx, dz)
  const ballBottom = giantBall.position.y - GIANT_BALL.radius
  const playerTop = player.position.y + player.dims.height

  if (horizontal <= GIANT_BALL.radius + player.dims.radius && ballBottom <= playerTop) {
    die()
  }
}
