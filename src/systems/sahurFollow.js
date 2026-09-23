// Sahur NPC behavior — chases the player while they're within Ground.010's
// footprint (see data/sahurModel.js), and walks back to its own spawn point
// the moment they leave, idling only once it actually arrives home.
// components/Sahur.jsx reads `moving` off this same singleton to gate the
// walk animation (active for both the chase and the walk-home), and
// `following` is kept separate for anything that only cares about an active
// chase (e.g. systems/sahurCrush.js). Same "mutated in place, stepped once
// per frame from GameLoop.jsx, read by a presentation component without a
// React subscription" convention as systems/giantBallPhysics.js +
// components/GiantBall.jsx.
import { player } from './playerState.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { SAHUR_MODEL } from '../data/sahurModel.js'

const GROUND = GROUND_BLOCKS.find((b) => b.name === 'Ground.010')
const [GX, , GZ] = GROUND.position
const [GWIDTH, , GDEPTH] = GROUND.size
const HALF_WIDTH = GWIDTH / 2
const HALF_DEPTH = GDEPTH / 2

const HOME_X = SAHUR_MODEL.position[0]
const HOME_Z = SAHUR_MODEL.position[2]

const SPEED = 5 // m/s — a touch under the player's own fixed 6 (data/progression.js's WALK_SPEED_BASE), so a chase always trails the player rather than overtaking
const ACCEL = 30 // m/s^2, matches the "approach" feel of playerMovement.js
const STOP_DISTANCE = 2 // metres — how close a chase closes in before halting
const HOME_BRAKE_DISTANCE = 0.3 // metres — walking-home's own (much shorter) braking zone, so it eases in rather than overshooting
const ARRIVE_DISTANCE = 0.1 // metres — close enough to home to snap and stop walking

export const sahur = {
  position: { x: HOME_X, y: SAHUR_MODEL.position[1], z: HOME_Z },
  velocity: { x: 0, z: 0 },
  facing: SAHUR_MODEL.rotationY,
  following: false, // actively chasing the player right now
  moving: false, // walking at all (chasing OR walking home) — drives the walk clip
}

function approach(v, key, target, maxDelta) {
  const d = target - v[key]
  if (d > maxDelta) v[key] += maxDelta
  else if (d < -maxDelta) v[key] -= maxDelta
  else v[key] = target
}

function playerOnGround010() {
  const p = player.position
  return Math.abs(p.x - GX) <= HALF_WIDTH && Math.abs(p.z - GZ) <= HALF_DEPTH
}

function stepTowards(targetX, targetZ, stopDistance, dt) {
  const dx = targetX - sahur.position.x
  const dz = targetZ - sahur.position.z
  const dist = Math.hypot(dx, dz)

  if (dist <= stopDistance) {
    approach(sahur.velocity, 'x', 0, ACCEL * dt)
    approach(sahur.velocity, 'z', 0, ACCEL * dt)
    return dist
  }

  approach(sahur.velocity, 'x', (dx / dist) * SPEED, ACCEL * dt)
  approach(sahur.velocity, 'z', (dz / dist) * SPEED, ACCEL * dt)
  sahur.facing = Math.atan2(dx, dz)
  return dist
}

export function step(dt) {
  if (dt <= 0) return

  sahur.following = playerOnGround010()

  if (sahur.following) {
    stepTowards(player.position.x, player.position.z, STOP_DISTANCE, dt)
    sahur.moving = true
  } else if (sahur.position.x !== HOME_X || sahur.position.z !== HOME_Z) {
    const dist = stepTowards(HOME_X, HOME_Z, HOME_BRAKE_DISTANCE, dt)
    if (dist <= ARRIVE_DISTANCE) {
      sahur.position.x = HOME_X
      sahur.position.z = HOME_Z
      sahur.velocity.x = 0
      sahur.velocity.z = 0
      sahur.moving = false
    } else {
      sahur.moving = true
    }
  } else {
    sahur.velocity.x = 0
    sahur.velocity.z = 0
    sahur.moving = false
  }

  sahur.position.x += sahur.velocity.x * dt
  sahur.position.z += sahur.velocity.z * dt

  // Never let a chase carry it off Ground.010's own footprint (walking home
  // heads to HOME_X/HOME_Z, already well inside it, so this never binds
  // there).
  const margin = 1
  sahur.position.x = Math.min(GX + HALF_WIDTH - margin, Math.max(GX - HALF_WIDTH + margin, sahur.position.x))
  sahur.position.z = Math.min(GZ + HALF_DEPTH - margin, Math.max(GZ - HALF_DEPTH + margin, sahur.position.z))
}
