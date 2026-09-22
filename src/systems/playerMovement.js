import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'
import { health, die } from './playerHealth.js'
import { useGameStore } from '../store/useGameStore.js'
import { GROUND_Y, WATER_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from '../data/hub.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { SIDE_WALLS } from '../data/sideWalls.js'
import { walkSpeedForLevel } from '../data/progression.js'
import { groundPhase } from './groundPhase.js'
import { rampTopAt } from './rampCollision.js'

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
// world X axis into a ramp, and/or an optional `rotationY` yawing it about
// the world Y axis (GroundBlock.006's pillar cluster) — the point is first
// yaw-rotated into the block's own horizontal frame (a plain 2D rotation,
// since yaw doesn't affect height), then the existing rotationX projection
// runs on that local (x, z), reducing to the plain flat-box test when both
// are 0 (cos=1, sin=0). A `bands` block (its footprint isn't a rectangle) is
// delegated to bandedBlockTopAt above instead.
//
// `prevY` is the player's height at the START of this frame, before this
// frame's own gravity/movement integration — a block only counts as
// "landed on" if the player was already at or above its top surface a
// moment ago. Without this, falling off a block's edge and later drifting
// back under or beside it (very reachable now that several blocks are
// 19-45m tall, not the old 6-unit slabs) would re-enter its footprint while
// well below the top and get teleported straight up onto it. A block that
// fails this test is skipped here (falling through to any other block whose
// footprint also covers this (x, z), e.g. two blocks stacked at different
// heights) and left for resolveGroundBlocks to treat as solid on its other
// faces instead.
function groundBlockTopAt(x, z, prevY) {
  for (const block of GROUND_BLOCKS) {
    if (block.phasing && !groundPhase.collidable) continue
    if (block.bands) {
      const top = bandedBlockTopAt(block, x, z)
      if (top !== null) return top
      continue
    }
    const [bx, by, bz] = block.position
    const [width, thickness, depth] = block.size
    const rotationX = block.rotationX ?? 0
    const rotationY = block.rotationY ?? 0
    const halfW = width / 2
    const halfH = thickness / 2
    const halfD = depth / 2
    const dx = x - bx
    const dz = z - bz
    const cosY = Math.cos(rotationY)
    const sinY = Math.sin(rotationY)
    // (x, z) in the block's own horizontal frame, undoing its yaw.
    const lx = dx * cosY - dz * sinY
    const lzYaw = dx * sinY + dz * cosY
    const cos = Math.cos(rotationX)
    const sin = Math.sin(rotationX)
    // Depth coordinate (along the block's own tilted axis) under (x, z).
    const lz = (halfH * sin - lzYaw) / cos
    if (Math.abs(lx) <= halfW && Math.abs(lz) <= halfD) {
      const top = by + lz * sin + halfH * cos
      if (prevY >= top) return top
    }
  }
  return null
}

// Push the player capsule out of any GROUND_BLOCKS box it's touching from
// underneath or the side rather than landing on top of — same Minkowski-sum
// AABB push as resolveSideWalls below, but first undoes the block's own yaw
// (rotationY) the same way groundBlockTopAt does. A block the player was
// already at-or-above the top of a moment ago (see groundBlockTopAt's
// `prevY` comment above — same landing test) is skipped here and left to
// step()'s vertical clamp instead, so a normal jump-and-land isn't fought by
// a sideways push mid-landing. Ramp/`bands` blocks (Slope_Block) aren't
// solid from other sides in this game, so they're skipped, same as
// groundBlockTopAt's own bands branch. Assumes `rotationX` 0 (true for
// every block reaching here) — a tilted-AND-solid-sided block would need
// its top/bottom projected the way groundBlockTopAt does, not the plain
// by +/- halfH used here.
function resolveGroundBlocks(p, prevY) {
  for (const block of GROUND_BLOCKS) {
    if (block.phasing && !groundPhase.collidable) continue
    if (block.bands) continue
    const [bx, by, bz] = block.position
    const [width, thickness, depth] = block.size
    const rotationY = block.rotationY ?? 0
    const halfH = thickness / 2
    const top = by + halfH
    const bottom = by - halfH
    if (prevY >= top) continue
    if (p.y >= top || p.y + player.dims.height <= bottom) continue
    const halfW = width / 2 + player.dims.radius
    const halfD = depth / 2 + player.dims.radius
    const dx = p.x - bx
    const dz = p.z - bz
    const cosY = Math.cos(rotationY)
    const sinY = Math.sin(rotationY)
    const lx = dx * cosY - dz * sinY
    const lz = dx * sinY + dz * cosY
    if (Math.abs(lx) >= halfW || Math.abs(lz) >= halfD) continue
    const penX = halfW - Math.abs(lx)
    const penZ = halfD - Math.abs(lz)
    // Push out along whichever local axis has the smaller penetration, then
    // rotate that local push back into world space.
    let pushLx = 0
    let pushLz = 0
    if (penX < penZ) pushLx = Math.sign(lx || 1) * penX
    else pushLz = Math.sign(lz || 1) * penZ
    p.x += pushLx * cosY + pushLz * sinY
    p.z += -pushLx * sinY + pushLz * cosY
  }
}
// Push the player capsule out of any SideWalls box it's overlapping
// horizontally — the box expanded by the capsule's own radius (Minkowski
// sum), so the player is then just a point test against it — resolved along
// whichever axis has the smaller penetration. Walls are unrotated boxes, so
// this is a plain point-vs-AABB push rather than the rotated-plane math
// groundBlockTopAt needs for ramps.
function resolveSideWalls(p) {
  for (const wall of SIDE_WALLS) {
    const [wx, wy, wz] = wall.position
    const [width, height, depth] = wall.size
    if (p.y >= wy + height / 2 || p.y + player.dims.height <= wy - height / 2) continue
    const hx = width / 2 + player.dims.radius
    const hz = depth / 2 + player.dims.radius
    const dx = p.x - wx
    const dz = p.z - wz
    if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue
    const penX = hx - Math.abs(dx)
    const penZ = hz - Math.abs(dz)
    if (penX < penZ) p.x = wx + Math.sign(dx || 1) * hx
    else p.z = wz + Math.sign(dz || 1) * hz
  }
}

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

  // Ground speed scales with the store's Speed stat (data/progression.js's
  // walkSpeedForLevel) — the more Speed the player has walked their way to,
  // the faster they actually move. Written onto the player singleton so
  // PlayerAvatar.jsx's gait normalization reads the same live value.
  const moveSpeed = walkSpeedForLevel(useGameStore.getState().level)
  player.moveSpeed = moveSpeed

  approach(player.velocity, 'x', wishX * moveSpeed, ACCEL * dt)
  approach(player.velocity, 'z', wishZ * moveSpeed, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  player.velocity.y += GRAVITY * dt

  const p = player.position
  const prevY = p.y // before this frame's own integration — see groundBlockTopAt's landing test
  p.x += player.velocity.x * dt
  p.z += player.velocity.z * dt
  p.y += player.velocity.y * dt

  resolveSideWalls(p)
  resolveGroundBlocks(p, prevY)

  const onIsland = Math.abs(p.x - ISLAND_X) <= ISLAND_WIDTH / 2 && Math.abs(p.z - ISLAND_Z) <= ISLAND_DEPTH / 2
  const blockTop = onIsland ? null : groundBlockTopAt(p.x, p.z, prevY)
  const rampTop = onIsland ? null : rampTopAt(p.x, p.z)
  const floorTop = blockTop !== null && rampTop !== null ? Math.max(blockTop, rampTop) : (blockTop ?? rampTop)

  if (onIsland) {
    if (p.y <= GROUND_Y) {
      p.y = GROUND_Y
      if (player.velocity.y < 0) player.velocity.y = 0
      player.grounded = true
    }
  } else if (floorTop !== null) {
    if (p.y <= floorTop) {
      p.y = floorTop
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
