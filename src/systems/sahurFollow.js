// Sahur NPC behavior — chases the player while they're within a given
// GROUND_BLOCKS footprint, and walks back to its own spawn point the moment
// they leave, idling only once it actually arrives home.
// components/Sahur.jsx reads a given instance's `moving` flag off `sahur` to
// gate the walk animation (active for both the chase and the walk-home), and
// `following` is kept separate for anything that only cares about an active
// chase (e.g. systems/sahurCrush.js). Same "mutated in place, stepped once
// per frame from GameLoop.jsx, read by a presentation component without a
// React subscription" convention as systems/giantBallPhysics.js +
// components/GiantBall.jsx.
//
// createSahur() is a factory so more than one Sahur can patrol more than one
// ground block while sharing the exact same chase/return state machine —
// SAHUR_INSTANCES below has one for Ground.010 and one for Ground.057.
// Ground.057 sits yawed (rotationY -90deg, see data/groundBlocks.js), so the
// footprint test and the chase-area clamp both undo that yaw into the
// block's own local frame first, same transform as
// systems/playerMovement.js's groundBlockTopAt/resolveGroundBlocks — this
// reduces to the plain axis-aligned test Ground.010 (rotationY 0) always
// used.
import { player } from './playerState.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { SAHUR_MODEL, SAHUR_MODEL_057 } from '../data/sahurModel.js'

// Chase speed (m/s) is per-instance — model.speed, data/sahurModel.js — not
// a shared constant, so one Sahur can be tuned faster than another (e.g.
// Ground.057's 10 vs Ground.010's 5). Player's own speed comes from their
// equipped skate (store's moveSpeed) and can end up above or below either,
// so a chase isn't guaranteed to trail or overtake.
const ACCEL = 30 // m/s^2, matches the "approach" feel of playerMovement.js
const STOP_DISTANCE = 2 // metres — how close a chase closes in before halting
const HOME_BRAKE_DISTANCE = 0.3 // metres — walking-home's own (much shorter) braking zone, so it eases in rather than overshooting
const ARRIVE_DISTANCE = 0.1 // metres — close enough to home to snap and stop walking
const MARGIN = 1 // metres — never let a chase carry it off its own block's footprint

function approach(v, key, target, maxDelta) {
  const d = target - v[key]
  if (d > maxDelta) v[key] += maxDelta
  else if (d < -maxDelta) v[key] -= maxDelta
  else v[key] = target
}

function createSahur(groundName, model) {
  const block = GROUND_BLOCKS.find((b) => b.name === groundName)
  const [GX, , GZ] = block.position
  const [GWIDTH, , GDEPTH] = block.size
  const rotationY = block.rotationY ?? 0
  const cosY = Math.cos(rotationY)
  const sinY = Math.sin(rotationY)
  const HALF_WIDTH = GWIDTH / 2
  const HALF_DEPTH = GDEPTH / 2

  const HOME_X = model.position[0]
  const HOME_Z = model.position[2]
  const SPEED = model.speed

  const sahur = {
    position: { x: HOME_X, y: model.position[1], z: HOME_Z },
    velocity: { x: 0, z: 0 },
    facing: model.rotationY,
    following: false, // actively chasing the player right now
    moving: false, // walking at all (chasing OR walking home) — drives the walk clip
  }

  // World (dx, dz) offset from the block's own center <-> the block's local
  // (yaw-free) frame.
  function toLocal(dx, dz) {
    return [dx * cosY - dz * sinY, dx * sinY + dz * cosY]
  }
  function toWorld(lx, lz) {
    return [lx * cosY + lz * sinY, -lx * sinY + lz * cosY]
  }

  function playerOnBlock() {
    const p = player.position
    const [lx, lz] = toLocal(p.x - GX, p.z - GZ)
    return Math.abs(lx) <= HALF_WIDTH && Math.abs(lz) <= HALF_DEPTH
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

  function step(dt) {
    if (dt <= 0) return

    sahur.following = playerOnBlock()

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

    // Never let a chase carry it off this block's own footprint — clamp in
    // the block's local (yaw-undone) frame, then rotate back to world.
    const [lx, lz] = toLocal(sahur.position.x - GX, sahur.position.z - GZ)
    const clampedLx = Math.min(HALF_WIDTH - MARGIN, Math.max(-(HALF_WIDTH - MARGIN), lx))
    const clampedLz = Math.min(HALF_DEPTH - MARGIN, Math.max(-(HALF_DEPTH - MARGIN), lz))
    const [wx, wz] = toWorld(clampedLx, clampedLz)
    sahur.position.x = GX + wx
    sahur.position.z = GZ + wz
  }

  return { sahur, model, step }
}

export const SAHUR_INSTANCES = [
  createSahur('Ground.010', SAHUR_MODEL),
  createSahur('Ground.057', SAHUR_MODEL_057),
]

export function step(dt) {
  for (const instance of SAHUR_INSTANCES) instance.step(dt)
}
