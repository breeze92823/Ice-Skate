import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'
import { health, die } from './playerHealth.js'
import { useGameStore } from '../store/useGameStore.js'
import { GROUND_Y, WATER_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from '../data/hub.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { SIDE_WALL_COLLIDERS } from '../data/wallColliders.js'
import { groundPhase } from './groundPhase.js'
import { rampTopAt } from './rampCollision.js'
import { treadmillTopAt, resolveTreadmills } from './treadmillCollision.js'
import { skateRackTopAt, resolveSkateRack } from './skateRackCollision.js'

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
      if (Math.abs(x - bx) > halfWidth + player.dims.radius) return null
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
function groundBlockTopAt(x, z, prevY, travelPad = 0) {
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
    // Padded by the player's own radius (same Minkowski sum resolveGroundBlocks
    // uses for its side push below) so a capsule centered in a seam narrower
    // than one radius from either neighbor's edge still reads that neighbor's
    // top as solid ground, instead of finding a gap under its exact center
    // point and dropping through — most likely to bite at high speed, where a
    // frame's movement can land the sample point deep in a seam that would
    // otherwise only ever graze one frame at a time. `travelPad` (this frame's
    // own horizontal travel distance, moveSpeed*dt — see step()'s call below)
    // extends that same padding by however far the player actually slid this
    // frame: a hairline seam between two abutting blocks (Ground.001-.009's
    // Blender-placed slabs are never perfectly edge-to-edge) is then bridged
    // once ground speed is high enough to cross it within a single frame,
    // same as a real skater's momentum carrying them over a crack too narrow
    // to catch a foot in — while a slow walk, or a seam wide enough that even
    // this frame's travel doesn't span it, still finds the true gap and falls.
    const halfW = width / 2 + player.dims.radius + travelPad
    const halfH = thickness / 2
    const halfD = depth / 2 + player.dims.radius + travelPad
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
// Push the player capsule out of any SIDE_WALL_COLLIDERS box (data/
// wallColliders.js — every boundary-wall shape category/stage corridor's
// guard walls, concatenated once there) it's overlapping horizontally — the
// box expanded by the capsule's own radius (Minkowski sum), so the player is
// then just a point test against it — resolved along whichever axis has the
// smaller penetration. Walls are unrotated boxes, so this is a plain
// point-vs-AABB push rather than the rotated-plane math groundBlockTopAt
// needs for ramps.
function resolveSideWalls(p) {
  for (const wall of SIDE_WALL_COLLIDERS) {
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

// Max horizontal distance covered per collision substep (see the loop in
// step() below). resolveSideWalls/resolveGroundBlocks only catch a wall by
// testing the player's position AFTER each move — at high moveSpeed, a
// single full-frame move can land past a thin panel's far face without ever
// sampling a point inside it, tunneling straight through (this bit at
// moveSpeed ~50+, where one frame's move approaches the thinnest door-fill/
// jog panels' own depth, e.g. stage3Walls.js's DOOR_FILL_DEPTH ~0.83). Kept
// well under that thinnest panel depth (with margin, since the player's own
// radius padding in those resolvers isn't guaranteed the same on every
// collider) so no substep's move can skip cleanly over one regardless of
// moveSpeed.
const MAX_HORIZONTAL_STEP = 0.3

// Clamps the (dx, dz) delta as one 2D vector rather than clamping each axis
// independently — an axis-by-axis clamp (each capped at maxDelta) doesn't
// produce a delta that points at the target when the two axes need very
// different-sized corrections (e.g. right after a turn), so the velocity
// visibly curves toward the target instead of accelerating straight at it.
// That mismatch grows with target speed, hence only showing up at high
// moveSpeed.
function approach2D(v, targetX, targetZ, maxDelta) {
  const dx = targetX - v.x
  const dz = targetZ - v.z
  const dist = Math.hypot(dx, dz)
  if (dist <= maxDelta || dist === 0) {
    v.x = targetX
    v.z = targetZ
  } else {
    const scale = maxDelta / dist
    v.x += dx * scale
    v.z += dz * scale
  }
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

  // Ground speed set directly by whichever skate is equipped (store's
  // moveSpeed, set by equipHexPad) — independent of the Speed stat/level
  // shown in the UI. Written onto the player singleton so PlayerAvatar.jsx's
  // gait normalization reads the same live value.
  const moveSpeed = useGameStore.getState().moveSpeed
  player.moveSpeed = moveSpeed

  approach2D(player.velocity, wishX * moveSpeed, wishZ * moveSpeed, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  player.velocity.y += GRAVITY * dt

  const p = player.position
  const prevY = p.y // before this frame's own integration — see groundBlockTopAt's landing test
  p.y += player.velocity.y * dt

  // Horizontal move + wall resolution is substepped rather than applied as
  // one big jump — see MAX_HORIZONTAL_STEP above for why a single full-frame
  // move can tunnel through a thin panel at high moveSpeed. Each substep
  // moves the player a bounded distance and immediately re-resolves walls/
  // ground-block sides before the next substep, so no substep's move can
  // clear a thin collider without a sample landing inside it first.
  const dxTotal = player.velocity.x * dt
  const dzTotal = player.velocity.z * dt
  const horizDist = Math.hypot(dxTotal, dzTotal)
  const steps = horizDist > MAX_HORIZONTAL_STEP ? Math.ceil(horizDist / MAX_HORIZONTAL_STEP) : 1
  const stepX = dxTotal / steps
  const stepZ = dzTotal / steps
  for (let i = 0; i < steps; i++) {
    p.x += stepX
    p.z += stepZ
    resolveSideWalls(p)
    resolveGroundBlocks(p, prevY)
  }
  // The treadmill and SkateRack both sit on the main island, where
  // blockTop/rampTop below are skipped entirely (that check exists for the
  // off-island stage corridor, not the flat hub) — so these run
  // unconditionally, on-island or not.
  resolveTreadmills(p, prevY)
  resolveSkateRack(p, prevY)

  const onIsland = Math.abs(p.x - ISLAND_X) <= ISLAND_WIDTH / 2 && Math.abs(p.z - ISLAND_Z) <= ISLAND_DEPTH / 2
  const blockTop = onIsland ? null : groundBlockTopAt(p.x, p.z, prevY, horizDist)
  const rampTop = onIsland ? null : rampTopAt(p.x, p.z)
  const treadmillTop = treadmillTopAt(p.x, p.z, prevY)
  const skateRackTop = skateRackTopAt(p.x, p.z, prevY)
  let floorTop = blockTop !== null && rampTop !== null ? Math.max(blockTop, rampTop) : (blockTop ?? rampTop)
  if (treadmillTop !== null) floorTop = floorTop !== null ? Math.max(floorTop, treadmillTop) : treadmillTop
  if (skateRackTop !== null) floorTop = floorTop !== null ? Math.max(floorTop, skateRackTop) : skateRackTop

  if (onIsland) {
    const surface = floorTop !== null ? Math.max(GROUND_Y, floorTop) : GROUND_Y
    if (p.y <= surface) {
      p.y = surface
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
