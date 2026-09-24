// Solid collision + climbable surfaces for the SkateRack — the back riser
// blocks the player like any other solid prop, while the two side ramps are
// climbable (a continuous incline, not a single step) so walking up either
// one reaches the back row's deck, and that deck itself is climbable too
// once reached. Mirrors treadmillCollision.js's split (topAt for standing
// surfaces, resolve for solid pushback), plus a ramp-specific height sampler
// modeled on rampCollision.js's rampTopAt (no prevY landing test — a rising
// surface must report its new top every frame or walking up it falls
// through). Row 0 (front) is ground level already, so it needs neither.
import { player } from './playerState.js'
import {
  SKATE_RACK_POSITION,
  SKATE_RACK_ROTATION_Y,
  SKATE_RACK_SCALE,
  SKATE_RACK_SHAPE,
  SKATE_RACK_RAMP,
  skateRackRowWidth,
  skateRackRowZ,
  skateRackRowTopY,
  skateRackLocalToWorld,
} from '../data/skateRack.js'

// A ledge up to this tall is auto-climbed while walking into it (real-world
// units, independent of SKATE_RACK_SCALE — same reasoning as
// treadmillCollision.js's own STEP_OFFSET) instead of blocking. The back
// riser is far taller than this, so it only becomes standable via the ramps'
// own height sampler, not by walking straight into its side.
const STEP_OFFSET = 0.4

// The back row's riser box, in world space — same box SkateRackRisers.jsx
// draws for row 1 (row 0 has no riser; see SKATE_RACK_SHAPE.frontRiserHeight).
const RISER_LOCAL_HEIGHT = skateRackRowTopY(1)
const RISER_LOCAL_WIDTH = skateRackRowWidth()
const RISER_LOCAL_DEPTH = SKATE_RACK_SHAPE.rowDepth
const [RISER_WORLD_X, RISER_WORLD_Z] = skateRackLocalToWorld(0, skateRackRowZ(1))
const RISER_COLLIDER = {
  position: [RISER_WORLD_X, SKATE_RACK_POSITION[1] + (RISER_LOCAL_HEIGHT * SKATE_RACK_SCALE) / 2, RISER_WORLD_Z],
  size: [RISER_LOCAL_WIDTH * SKATE_RACK_SCALE, RISER_LOCAL_HEIGHT * SKATE_RACK_SCALE, RISER_LOCAL_DEPTH * SKATE_RACK_SCALE],
  rotationY: SKATE_RACK_ROTATION_Y,
}

// One ramp's local (pre-rotation, pre-scale) footprint/rise — same run/rise
// data/skateRack.js's skateRackRampTransform derives its tilted box from,
// just kept as plain numbers here since collision needs the footprint
// rectangle and a height formula, not a mesh transform.
const RAMP_RUN = SKATE_RACK_SHAPE.rowDepth * 2
const RAMP_RISE = SKATE_RACK_SHAPE.backRiserHeight
function rampLocalX(side) {
  return side * (skateRackRowWidth() / 2 + SKATE_RACK_RAMP.width / 2 + SKATE_RACK_RAMP.xOffset)
}
const RAMPS_LOCAL = [-1, 1].map((side) => ({ side, x: rampLocalX(side) }))

// Local (x, z) undone from the rack's own position/yaw/scale — inverse of
// localToWorld above.
function worldToLocal(x, z) {
  const dx = x - SKATE_RACK_POSITION[0]
  const dz = z - SKATE_RACK_POSITION[2]
  const cos = Math.cos(SKATE_RACK_ROTATION_Y)
  const sin = Math.sin(SKATE_RACK_ROTATION_Y)
  const lx = (dx * cos - dz * sin) / SKATE_RACK_SCALE
  const lz = (dx * sin + dz * cos) / SKATE_RACK_SCALE
  return [lx, lz]
}

// Height (world Y) of whichever ramp (x, z) falls over, or null if neither —
// shared by skateRackTopAt (to stand on it) and resolveSkateRack (to exempt
// it from the riser's solid push, below).
function rampTopAt(x, z) {
  const [localX, localZ] = worldToLocal(x, z)
  const z0 = localZ - SKATE_RACK_RAMP.zOffset
  if (z0 > 0 || z0 < -RAMP_RUN) return null
  for (const ramp of RAMPS_LOCAL) {
    if (Math.abs(localX - ramp.x) > SKATE_RACK_RAMP.width / 2) continue
    const fraction = -z0 / RAMP_RUN
    return SKATE_RACK_POSITION[1] + fraction * RAMP_RISE * SKATE_RACK_SCALE
  }
  return null
}

// Highest standable surface under (x, z): the back riser's own deck (once
// already at-or-near its top — same STEP_OFFSET tolerance as
// treadmillCollision.js's treadmillTopAt) or either side ramp's incline
// (sampled fresh every frame, no landing test, so walking up one tracks its
// rising surface instead of falling through it).
export function skateRackTopAt(x, z, prevY) {
  let top = null

  const riserTop = RISER_COLLIDER.position[1] + RISER_COLLIDER.size[1] / 2
  if (prevY >= riserTop - STEP_OFFSET) {
    const [rw, , rd] = RISER_COLLIDER.size
    const dx = x - RISER_COLLIDER.position[0]
    const dz = z - RISER_COLLIDER.position[2]
    const cos = Math.cos(SKATE_RACK_ROTATION_Y)
    const sin = Math.sin(SKATE_RACK_ROTATION_Y)
    const lx = dx * cos - dz * sin
    const lz = dx * sin + dz * cos
    if (Math.abs(lx) <= rw / 2 && Math.abs(lz) <= rd / 2) top = riserTop
  }

  const ramp = rampTopAt(x, z)
  if (ramp !== null && (top === null || ramp > top)) top = ramp

  return top
}

// Pushes the player capsule out of the back riser's sides — skipped once
// prevY is already within STEP_OFFSET of its top (climbing via a ramp or
// already standing on the deck), same spirit as
// treadmillCollision.js's resolveTreadmills / playerMovement.js's
// resolveGroundBlocks. Also skipped anywhere over either ramp's own
// footprint: the ramps sit flush against the riser, so once the riser's box
// is expanded by the player's radius (the same Minkowski-sum push every
// other collider here uses) it overlaps the ramp's inner edge — without this
// exemption, a player hugging that edge while still low on the climb gets
// shoved sideways off the ramp instead of allowed to keep climbing. Real
// ramps in this game aren't solid from the side either (see
// playerMovement.js's resolveGroundBlocks comment on `bands` blocks).
export function resolveSkateRack(p, prevY) {
  if (rampTopAt(p.x, p.z) !== null) return
  const [bx, by, bz] = RISER_COLLIDER.position
  const [width, height, depth] = RISER_COLLIDER.size
  const halfH = height / 2
  const top = by + halfH
  const bottom = by - halfH
  if (prevY >= top - STEP_OFFSET) return
  if (p.y >= top || p.y + player.dims.height <= bottom) return
  const halfW = width / 2 + player.dims.radius
  const halfD = depth / 2 + player.dims.radius
  const cos = Math.cos(SKATE_RACK_ROTATION_Y)
  const sin = Math.sin(SKATE_RACK_ROTATION_Y)
  const dx = p.x - bx
  const dz = p.z - bz
  const lx = dx * cos - dz * sin
  const lz = dx * sin + dz * cos
  if (Math.abs(lx) >= halfW || Math.abs(lz) >= halfD) return
  const penX = halfW - Math.abs(lx)
  const penZ = halfD - Math.abs(lz)
  let pushLx = 0
  let pushLz = 0
  if (penX < penZ) pushLx = Math.sign(lx || 1) * penX
  else pushLz = Math.sign(lz || 1) * penZ
  p.x += pushLx * cos + pushLz * sin
  p.z += -pushLx * sin + pushLz * cos
}
