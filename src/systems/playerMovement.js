import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'
import { health, die } from './playerHealth.js'
import { GROUND_Y, WATER_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from '../data/hub.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'

// Kinematic capsule, stepped once per frame: apply input -> gravity ->
// integrate -> clamp to the island floor (or a GroundBlocks box footprint),
// or drown at the water surface once outside all of that. No collider list
// beyond the main island + GROUND_BLOCKS' own AABBs — this project has
// nothing else to collide with but the ground and water.

// A block whose real footprint tapers along its depth axis instead of being
// one rectangle (see groundBlocks.js's Slope_Block `bands` entry) — same
// rotated-plane relationship as the flat-box case below, but inverted to
// find the local depth coordinate first, then looked up in `bands` for
// that band's own half-width (rather than one half-width for the whole
// block) before testing it against x.
function bandedBlockTopAt(block, x, z) {
  const [bx, by, bz] = block.position
  const rotationX = block.rotationX
  const topLocalZ = block.topLocalZ
  const cos = Math.cos(rotationX)
  const sin = Math.sin(rotationX)
  const ly = (topLocalZ * sin - (z - bz)) / cos
  for (const { y, halfWidth } of block.bands) {
    if (ly >= y[0] && ly <= y[1]) {
      if (Math.abs(x - bx) > halfWidth) return null
      return by + ly * sin + topLocalZ * cos
    }
  }
  return null
}

// Top surface height of whichever GROUND_BLOCKS box (x, z) falls within, or
// null if none. Solid boxes tested by their own half-extents; a block may
// carry an optional `rotationX` (see groundBlocks.js) tilting it about the
// world X axis into a ramp — the footprint/height math below is the general
// rotated-plane form, which reduces to the plain flat-box test when
// rotationX is 0 (cos=1, sin=0). A `bands` block (its footprint isn't a
// rectangle) is delegated to bandedBlockTopAt above instead.
function groundBlockTopAt(x, z) {
  for (const block of GROUND_BLOCKS) {
    if (block.bands) {
      const top = bandedBlockTopAt(block, x, z)
      if (top !== null) return top
      continue
    }
    const [bx, by, bz] = block.position
    const [width, thickness, depth] = block.size
    const rotationX = block.rotationX ?? 0
    const halfW = width / 2
    const halfH = thickness / 2
    const halfD = depth / 2
    const cos = Math.cos(rotationX)
    const sin = Math.sin(rotationX)
    // Depth coordinate (along the block's own tilted axis) under (x, z).
    const lz = (halfH * sin - (z - bz)) / cos
    if (Math.abs(x - bx) <= halfW && Math.abs(lz) <= halfD) {
      return by + lz * sin + halfH * cos
    }
  }
  return null
}
export const SPEED = 6 // m/s target ground speed (the avatar gait reads this)
const ACCEL = 45 // m/s^2 approach toward target velocity
const GRAVITY = -22 // m/s^2
const JUMP_SPEED = 7.5 // m/s

function approach(v, key, target, maxDelta) {
  const d = target - v[key]
  if (d > maxDelta) v[key] += maxDelta
  else if (d < -maxDelta) v[key] -= maxDelta
  else v[key] = target
}

export function step(dt) {
  if (dt <= 0) return
  // Frozen while the "You Died" prompt counts down to respawn.
  if (health.dead) return

  // Camera-relative ground basis.
  const yaw = getYaw()
  const fwdX = -Math.sin(yaw)
  const fwdZ = -Math.cos(yaw)
  const rightX = Math.cos(yaw)
  const rightZ = -Math.sin(yaw)

  const mv = inputState.move
  const wishX = fwdX * mv.z + rightX * mv.x
  const wishZ = fwdZ * mv.z + rightZ * mv.x

  approach(player.velocity, 'x', wishX * SPEED, ACCEL * dt)
  approach(player.velocity, 'z', wishZ * SPEED, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  player.velocity.y += GRAVITY * dt

  const p = player.position
  p.x += player.velocity.x * dt
  p.z += player.velocity.z * dt
  p.y += player.velocity.y * dt

  const onIsland = Math.abs(p.x - ISLAND_X) <= ISLAND_WIDTH / 2 && Math.abs(p.z - ISLAND_Z) <= ISLAND_DEPTH / 2
  const blockTop = onIsland ? null : groundBlockTopAt(p.x, p.z)

  if (onIsland) {
    if (p.y <= GROUND_Y) {
      p.y = GROUND_Y
      if (player.velocity.y < 0) player.velocity.y = 0
      player.grounded = true
    }
  } else if (blockTop !== null) {
    if (p.y <= blockTop) {
      p.y = blockTop
      if (player.velocity.y < 0) player.velocity.y = 0
      player.grounded = true
    }
  } else if (p.y <= WATER_Y) {
    // Walked off the island (and off any ground block) — drown at the water surface.
    p.y = WATER_Y
    player.velocity.y = 0
    player.grounded = true
    die()
  }

  // Face the direction of travel.
  if (Math.hypot(wishX, wishZ) > 0.01) {
    player.facing = Math.atan2(wishX, wishZ)
  }
}
