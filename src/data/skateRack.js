// "Ice Skates" shop display — a two-tier bench next to the treadmill row: a
// low front shelf of 5 pads and a taller back shelf of 5 more pads behind
// and above it, each pad holding a colored skate pickup and a floating
// "+N Speed" / "M Wins Required" caption. Matches the reference mock's
// actual layout (two 5-wide rows, not a single ascending staircase). Solid
// collision + the climbable ramps/deck live in
// systems/skateRackCollision.js — geometry/labels only here, same split as
// TreadmillProp/TreadmillLabel/Treadmills.jsx + treadmillCollision.js.
import { TREADMILL_POSITION, TREADMILL_ROTATION_Y } from './hub.js'

// Shifted from its original spot beside Treadmill1
// (TREADMILL_POSITION[0] - 8, TREADMILL_POSITION[2]), same facing.
export const SKATE_RACK_POSITION = [TREADMILL_POSITION[0] + 51.213, TREADMILL_POSITION[1], TREADMILL_POSITION[2] + 50]
// Rotated -90° (-Math.PI/2) about Y from the treadmill row's own facing.
export const SKATE_RACK_ROTATION_Y = TREADMILL_ROTATION_Y - Math.PI / 2

// Uniform scale on the whole prop (bench, ramps, sign, labels) — also read
// by systems/skateRackCollision.js so colliders match the drawn size.
export const SKATE_RACK_SCALE = 3.5

// Shared shape for the whole bench. Row 0 (front, nearest +Z — same "player
// approaches from +Z" convention as TreadmillProp's console facing +Z) sits
// flush on the ground, no riser under it; row 1 (back) is a riser box
// stacked immediately behind it, so its top sits above row 0's the way a
// stadium-seating step does. Row 1 is one wide box spanning all 5 columns,
// not 5 separate risers.
export const SKATE_RACK_SHAPE = {
  columns: 5,
  columnSpacing: 2, // center-to-center gap between pads within a row
  rowDepth: 1.6, // Z depth of each riser step
  frontRiserHeight: 0, // row 0 is ground level — no riser box
  backRiserHeight: 1.5, // back row's own base height (not an add-on)
  rowWidthPad: 2.0, // extra riser width beyond the outer columns, each side
  padWidth: 1.0, // pad footprint along X (side-to-side)
  padDepth: 1.0, // pad footprint along Z (front-to-back)
  padHeight: 0.08,
  itemRadius: 0.32, // radius of the equipped/rare glow disc under each item
}

// Progression shown on the rack, row-major (front row left-to-right, then
// back row left-to-right) matching the reference image. Which tier is owned
// and which is equipped is real game state now (store/useGameStore.js's
// ownedHexPads/equippedHexPad, driven by data/hexPowerPad.js's
// HEX_SPEED_PAD_TIERS below) — the pad's own color is derived from that
// state in SkateRackItem.jsx (red/white/green), not authored here. `glow`
// here is only the fixed rare-item sparkle on tiers 7 and 10, unrelated to
// equip state.
// itemColor here is a fixed bright/saturated palette (evenly spaced hues,
// high saturation+lightness) rather than the previous muted/tiered look —
// every pad reads as vivid regardless of row.
const RAW_TIERS = [
  // Row 0 — front, low shelf
  { speed: 1, winsRequired: 0, itemColor: '#ff3b30' },
  { speed: 2, winsRequired: 1, itemColor: '#ff9500' },
  { speed: 5, winsRequired: 15, itemColor: '#d1ff1a' },
  { speed: 25, winsRequired: 50, itemColor: '#4dff1a' },
  { speed: 50, winsRequired: 250, itemColor: '#1aff70' },
  // Row 1 — back, raised shelf
  { speed: 100, winsRequired: 1200, itemColor: '#1affff' },
  { speed: 250, winsRequired: 7500, itemColor: '#1a70ff', glow: '#6fa8ff' },
  { speed: 500, winsRequired: 25000, itemColor: '#701aff' },
  { speed: 1000, winsRequired: 125000, itemColor: '#d11aff' },
  { speed: 2000, winsRequired: 250000, itemColor: '#ff1a8c', glow: '#ff6fc4' },
]

export const SKATE_RACK_TIERS = RAW_TIERS.map((tier, i) => ({
  ...tier,
  index: i, // this tier's index into HEX_SPEED_PAD_TIERS/_POSITIONS and ownedHexPads/equippedHexPad
  name: `SkateRackTier${i + 1}`,
  row: Math.floor(i / SKATE_RACK_SHAPE.columns),
  col: i % SKATE_RACK_SHAPE.columns,
}))

// Layout helpers — shared by SkateRackRisers.jsx (the two step boxes),
// SkateRackItem.jsx (one pad+skate) and SkateRackSign.jsx, so all three stay
// derived from SKATE_RACK_SHAPE instead of copying the same arithmetic.
const { columns, columnSpacing, rowDepth, frontRiserHeight, backRiserHeight, rowWidthPad, padWidth } = SKATE_RACK_SHAPE

export function skateRackColX(col) {
  return (col - (columns - 1) / 2) * columnSpacing
}

export function skateRackRowTopY(row) {
  return row === 0 ? frontRiserHeight : backRiserHeight
}

// Center Z of the given row's riser box — row 0 spans [0, -rowDepth], row 1
// spans [-rowDepth, -2*rowDepth], each box's front face flush with the
// previous row's back face.
export function skateRackRowZ(row) {
  return -rowDepth * (row + 0.5)
}

export function skateRackRowWidth() {
  return (columns - 1) * columnSpacing + padWidth + 2 * rowWidthPad
}

// World-space (x, z) for a local (pre-rotation, pre-scale) (x, z) point in
// the rack's own frame. Shared by systems/skateRackCollision.js (collider
// placement) and skateRackPadWorldPosition below, so both stay derived from
// one transform instead of keeping separate copies that can drift apart (the
// bug SKATE_RACK_RAMP.xOffset/zOffset hit before skateRackCollision.js was
// updated to match).
export function skateRackLocalToWorld(lx, lz) {
  const cos = Math.cos(SKATE_RACK_ROTATION_Y)
  const sin = Math.sin(SKATE_RACK_ROTATION_Y)
  const sx = lx * SKATE_RACK_SCALE
  const sz = lz * SKATE_RACK_SCALE
  return [SKATE_RACK_POSITION[0] + sx * cos + sz * sin, SKATE_RACK_POSITION[2] - sx * sin + sz * cos]
}

// World-space [x, y, z] for one pickup's row — used by data/hexPowerPad.js to
// place each buy/equip proximity zone exactly at the deck the player stands
// on for that row (not the item's own small pad height), so walking up to a
// given skate targets that skate's own tier.
export function skateRackPadWorldPosition(row, col) {
  const [wx, wz] = skateRackLocalToWorld(skateRackColX(col), skateRackRowZ(row))
  const wy = SKATE_RACK_POSITION[1] + skateRackRowTopY(row) * SKATE_RACK_SCALE
  return [wx, wy, wz]
}

// Sign board dimensions, mounted behind/above the back row.
export const SKATE_RACK_SIGN = {
  width: 4.2,
  height: 1.5,
  thick: 0.12,
  clearance: 2.2, // gap between the back row's top and the sign's base
}

// The two side ramps in the reference mock — flat inclined panels flush
// against the bench's outer edges, running from ground level at the front up
// to the back row's own top height, one on each side (visual only, same as
// the rest of this prop — no ramp-climb collision; systems/rampCollision
// only fires off-island, and this rack sits in the hub). A bare panel this
// long would float above the ground for most of its run (row 0 no longer has
// a riser under it), so each one gets a couple of support legs/stands
// underneath, same idea as a real loading ramp's props.
export const SKATE_RACK_RAMP = {
  width: 1.1,
  thick: 0.15,
  legSize: 0.16, // square post footprint
  legFractions: [0.32, 0.72], // where along the ramp's length (0=ground end, 1=top end) each stand sits
  zOffset: 5.6 / SKATE_RACK_SCALE, // local +Z shift = 2 in-game meters, regardless of SKATE_RACK_SCALE
  xOffset: -1.1, // extra outward shift along X (mirrored per side) beyond the flush bench-edge position
}

// Shared rise/run/length/angle for one side's ramp — `side` is -1 (left) or
// 1 (right); only the resulting X offset depends on it.
function rampGeometry(side) {
  const run = rowDepth * 2
  const rise = backRiserHeight
  const length = Math.sqrt(run * run + rise * rise)
  const angle = Math.atan2(rise, run)
  const x = side * (skateRackRowWidth() / 2 + SKATE_RACK_RAMP.width / 2 + SKATE_RACK_RAMP.xOffset)
  return { run, rise, length, angle, x, zOffset: SKATE_RACK_RAMP.zOffset }
}

// World-space geometry for one side's ramp panel: a box tilted about local X
// so its top face runs from (0 height, Z=0) at the front up to
// (backRiserHeight, Z=-2*rowDepth) at the back, positioned flush against the
// riser stack's left/right face.
export function skateRackRampTransform(side) {
  const { rise, run, length, angle, x, zOffset } = rampGeometry(side)
  return { position: [x, rise / 2, -run / 2 + zOffset], rotationX: angle, length }
}

// World-space placement for one support leg under the ramp at `side`, at
// `fraction` along its length (0 = ground end, 1 = top end): a vertical post
// from the ground up to the ramp panel's underside at that point. The
// underside sits half the panel's thickness below its centerline, offset
// along the incline's own normal (not straight down), since the panel is
// tilted.
export function skateRackRampLegTransform(side, fraction) {
  const { rise, run, length, angle, x, zOffset } = rampGeometry(side)
  const centerY = fraction * rise
  const centerZ = -fraction * run + zOffset
  const halfThick = SKATE_RACK_RAMP.thick / 2
  const underY = centerY - halfThick * Math.cos(angle)
  const underZ = centerZ - halfThick * Math.sin(angle)
  return { x, z: underZ, height: Math.max(underY, 0.02) }
}
