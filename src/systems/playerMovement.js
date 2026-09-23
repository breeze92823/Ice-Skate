import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'
import { health, die } from './playerHealth.js'
import { useGameStore } from '../store/useGameStore.js'
import { GROUND_Y, WATER_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from '../data/hub.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { SIDE_WALLS, SIDE_WALL_END_CAPS, SIDE_WALL_BULGES, SIDE_WALL_JOGS } from '../data/sideWalls.js'
import { HUB_WALLS, HUB_DOOR_FILL } from '../data/hubWalls.js'
import { STAGE2_SEGMENTS, STAGE2_JOGS } from '../data/stage2Walls.js'
import { STAGE3_SEGMENTS, STAGE3_RAMP_JOGS, STAGE3_DOOR_FILLS } from '../data/stage3Walls.js'
import { STAGE4_SEGMENTS, STAGE4_JOGS, STAGE4_DOOR_FILLS } from '../data/stage4Walls.js'
import { STAGE5_SEGMENTS, STAGE5_JOGS } from '../data/stage5Walls.js'
import { STAGE6_SEGMENTS, STAGE6_JOGS } from '../data/stage6Walls.js'
import { STAGE7_SEGMENTS, STAGE7_JOGS } from '../data/stage7Walls.js'
import { STAGE8_SEGMENTS, STAGE8_JOGS } from '../data/stage8Walls.js'
import { STAGE9_SEGMENTS, STAGE9_JOGS } from '../data/stage9Walls.js'
import { STAGE10_SEGMENTS, STAGE10_DOOR_FILLS } from '../data/stage10Walls.js'
import { STAGE11_SEGMENTS, STAGE11_JOGS, STAGE11_DOOR_FILLS } from '../data/stage11Walls.js'
import { STAGE12_SEGMENTS, STAGE12_JOGS } from '../data/stage12Walls.js'
import { WALK_SPEED_BASE } from '../data/progression.js'
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
// groundBlockTopAt needs for ramps. SIDE_WALL_END_CAPS/SIDE_WALL_BULGES are
// boundary walls too (the narrow run out to StageWall.002, and the alcove
// bulging around WinPad.002), just different depths than SIDE_WALLS.
// SIDE_WALL_JOGS are the elbow connectors bending each side between its
// normal line and its bulge (their long axis runs along X instead of Z,
// but they're still just unrotated boxes, so the same AABB push applies)
// — functional wall segments, not decorative pilasters like
// SIDE_WALL_BEAMS, so they belong here too. STAGE2_SEGMENTS/STAGE2_JOGS
// (data/stage2Walls.js) are the same kind of boundary wall for the
// Stage2 -> Stage3 corridor, just organized as flat lists instead of one
// export per shape category. STAGE3_SEGMENTS/STAGE3_RAMP_JOGS (data/
// stage3Walls.js) continue that for Stage3 -> Stage4, including the ramp
// lane itself — once that container's walls had to grow tall enough to
// clear Giant_Ball's spawn, hugging the ramp's own tilt with a rotated box
// stopped being worth it (see stage3Walls.js), so it's a plain flat box
// like everything else here and gets real collision too. STAGE3_DOOR_FILLS
// (the infill above StageWall.003/.004's own short glass panels, closing
// the gap up to this tall container's ceiling) is solid too, so it's
// included here rather than just rendered. STAGE4_SEGMENTS/STAGE4_JOGS/
// STAGE4_DOOR_FILLS (data/stage4Walls.js) continue that for Stage4 ->
// Stage5 — same pattern, just a wide perimeter room around the
// Ground.016-023 jump platforms instead of a snug lane there (there's no
// single lane to hug when the floor itself is several disconnected
// platforms with gaps between them). STAGE5_SEGMENTS/STAGE5_JOGS (data/
// stage5Walls.js) continue that for Stage5 -> Stage6 — no door fills there,
// StageWall.005 and StageWall.006 share the same panel height.
// STAGE6_SEGMENTS/STAGE6_JOGS (data/stage6Walls.js) continue that for
// Stage6 -> Stage7 — another wide perimeter room, this time around
// Ground.029/.032/.033/.034 (two side platforms well off the central
// path), same reasoning and no door fills for the same reason as Stage5.
// STAGE7_SEGMENTS/STAGE7_JOGS (data/stage7Walls.js) continue that for
// Stage7 -> Stage8 — a third wide perimeter room, this time around the
// Ground.036-045 rotated pillar cluster (its own rotationY only matters
// for GROUND_BLOCKS' own top-surface collision above; the guard walls
// here are still plain flat boxes, same as every other perimeter room).
// STAGE8_SEGMENTS (data/stage8Walls.js) is the first *turn* — StageWall.009
// sits off-axis and rotated, so the corridor bends 90 degrees; its 4
// pieces (an outer wall pair sweeping the long way around the bend, an
// inner pair cutting the corner short) are still plain flat unrotated
// boxes, just laid out to form an L instead of a straight run — no new
// collision math needed, same AABB push as everything else here.
// STAGE9_SEGMENTS/STAGE9_JOGS (data/stage9Walls.js) continue that for
// Stage9 -> Stage10 — no new turn there (StageWall.010 shares
// StageWall.009's z/rotation), so it's back to a plain straight run, just
// oriented along X instead of Z. STAGE10_SEGMENTS/STAGE10_DOOR_FILLS (data/
// stage10Walls.js) continue that for Stage10 -> Stage11 — StageWall.011
// sits ~93m higher than StageWall.010, and the climb between them isn't
// built yet, so this container is just tall (floor to StageWall.011's own
// top) its whole length rather than modeling any particular ascent.
// STAGE11_SEGMENTS/STAGE11_DOOR_FILLS (data/stage11Walls.js) continue that
// for Stage11 -> Stage12 — one constant-width perimeter room the whole
// length, sized to clear the curved Stage11 skate ramp (its own collision
// handled separately by rampCollision.js) and Ground.056. STAGE12_SEGMENTS
// (data/stage12Walls.js) continue that for Stage12 -> Stage13 — a wide
// plaza lane hugging Ground.057, narrowing mid-run to a normal WIDE lane
// hugging Ground.059. All concatenated once at module scope rather than
// per-frame to avoid an allocation inside this per-frame loop.
const SIDE_WALL_COLLIDERS = [
  ...HUB_WALLS,
  HUB_DOOR_FILL,
  ...SIDE_WALLS,
  ...SIDE_WALL_END_CAPS,
  ...SIDE_WALL_BULGES,
  ...SIDE_WALL_JOGS,
  ...STAGE2_SEGMENTS,
  ...STAGE2_JOGS,
  ...STAGE3_SEGMENTS,
  ...STAGE3_RAMP_JOGS,
  ...STAGE3_DOOR_FILLS,
  ...STAGE4_SEGMENTS,
  ...STAGE4_JOGS,
  ...STAGE4_DOOR_FILLS,
  ...STAGE5_SEGMENTS,
  ...STAGE5_JOGS,
  ...STAGE6_SEGMENTS,
  ...STAGE6_JOGS,
  ...STAGE7_SEGMENTS,
  ...STAGE7_JOGS,
  ...STAGE8_SEGMENTS,
  ...STAGE8_JOGS,
  ...STAGE9_SEGMENTS,
  ...STAGE9_JOGS,
  ...STAGE10_SEGMENTS,
  ...STAGE10_DOOR_FILLS,
  ...STAGE11_SEGMENTS,
  ...STAGE11_JOGS,
  ...STAGE11_DOOR_FILLS,
  ...STAGE12_SEGMENTS,
  ...STAGE12_JOGS,
]

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

  // Fixed ground speed plus whichever skate is equipped (store's
  // moveSpeedBonus, set by equipHexPad) — independent of the Speed
  // stat/level shown in the UI. Written onto the player singleton so
  // PlayerAvatar.jsx's gait normalization reads the same live value.
  const moveSpeed = WALK_SPEED_BASE + useGameStore.getState().moveSpeedBonus
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
  // The treadmill and SkateRack both sit on the main island, where
  // blockTop/rampTop below are skipped entirely (that check exists for the
  // off-island stage corridor, not the flat hub) — so these run
  // unconditionally, on-island or not.
  resolveTreadmills(p, prevY)
  resolveSkateRack(p, prevY)

  const onIsland = Math.abs(p.x - ISLAND_X) <= ISLAND_WIDTH / 2 && Math.abs(p.z - ISLAND_Z) <= ISLAND_DEPTH / 2
  const blockTop = onIsland ? null : groundBlockTopAt(p.x, p.z, prevY)
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
