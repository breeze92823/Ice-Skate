// Solid collision for every treadmill in the row (data/treadmill.js's
// TREADMILLS) — the side rails block the player like any other solid prop,
// while the deck itself is climbable, like a real low step, instead of
// needing a jump to mount. Mirrors the box list drawn by
// components/TreadmillProp.jsx; thin/decorative parts (console arms,
// handlebar, display) are left out — too thin to matter for collision, same
// as this game's other props only collide on their structural boxes.
import { player } from './playerState.js'
import { TREADMILL_SHAPE, TREADMILLS } from '../data/treadmill.js'

// A ledge/stair riser up to this tall is auto-climbed while walking into it
// (like a real character controller's step offset) instead of blocking —
// bigger than the deck's own 0.32m lip so it's always climbable, but
// smaller than the side rails (0.48m) so those still block when approached
// directly from the ground instead of via the deck.
const STEP_OFFSET = 0.35

function treadmillLocalBoxes(shape) {
  const { deckWidth, deckDepth, beltHeight, railThick, railTopY } = shape
  return [
    { center: [0, beltHeight / 2, 0], size: [deckWidth, beltHeight, deckDepth] },
    { center: [-(deckWidth / 2 + railThick / 2), railTopY / 2, 0], size: [railThick, railTopY, deckDepth] },
    { center: [deckWidth / 2 + railThick / 2, railTopY / 2, 0], size: [railThick, railTopY, deckDepth] },
  ]
}

// Rotates a local (x, z) offset by the treadmill's own yaw into a world
// offset — same rotation three.js applies to the <group rotation-y>
// components/TreadmillProp.jsx renders its boxes inside, so a collider box
// lines up with the mesh it stands in for.
function localToWorld(position, rotationY, lx, lz) {
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  return [position[0] + lx * cos + lz * sin, position[2] - lx * sin + lz * cos]
}

// `scale` mirrors components/TreadmillProp.jsx's own <group scale> — it
// resizes a box's center offset and its own dimensions equally, the same
// way three.js's local scale (applied before rotation/translation) would,
// so an enlarged instance is still standable/collidable at its drawn size
// instead of only looking bigger.
function buildColliders(position, rotationY, scale, localBoxes) {
  return localBoxes.map((box) => {
    const cx = box.center[0] * scale
    const cy = box.center[1] * scale
    const cz = box.center[2] * scale
    const [wx, wz] = localToWorld(position, rotationY, cx, cz)
    const size = box.size.map((v) => v * scale)
    return { position: [wx, position[1] + cy, wz], size, rotationY }
  })
}

// Same shape for every instance — build the local box list once and reuse
// it per treadmill in the row, rather than recomputing it per instance.
const LOCAL_BOXES = treadmillLocalBoxes(TREADMILL_SHAPE)
const TREADMILL_COLLIDERS = TREADMILLS.flatMap((t) => buildColliders(t.position, t.rotationY, t.scale, LOCAL_BOXES))

// Highest climbable top under (x, z) — a box only counts if the player was
// already within STEP_OFFSET of its top a moment ago (prevY), same
// landed-on-it spirit as playerMovement.js's groundBlockTopAt, just with a
// tolerance instead of requiring prevY to already be at-or-above the top.
export function treadmillTopAt(x, z, prevY) {
  let top = null
  for (const box of TREADMILL_COLLIDERS) {
    const [bx, by, bz] = box.position
    const [width, height, depth] = box.size
    const boxTop = by + height / 2
    if (prevY < boxTop - STEP_OFFSET) continue
    const dx = x - bx
    const dz = z - bz
    const cos = Math.cos(box.rotationY)
    const sin = Math.sin(box.rotationY)
    const lx = dx * cos - dz * sin
    const lz = dx * sin + dz * cos
    if (Math.abs(lx) > width / 2 || Math.abs(lz) > depth / 2) continue
    if (top === null || boxTop > top) top = boxTop
  }
  return top
}

// Pushes the player capsule out of any treadmill box it's touching from a
// side too tall to auto-climb (see STEP_OFFSET) — same Minkowski-sum AABB
// push as playerMovement.js's resolveGroundBlocks/resolveSideWalls, run
// through the box's own yaw first the way treadmillTopAt does.
export function resolveTreadmills(p, prevY) {
  for (const box of TREADMILL_COLLIDERS) {
    const [bx, by, bz] = box.position
    const [width, height, depth] = box.size
    const halfH = height / 2
    const top = by + halfH
    const bottom = by - halfH
    if (prevY >= top - STEP_OFFSET) continue // climbable from here — treadmillTopAt handles it instead
    if (p.y >= top || p.y + player.dims.height <= bottom) continue
    const halfW = width / 2 + player.dims.radius
    const halfD = depth / 2 + player.dims.radius
    const dx = p.x - bx
    const dz = p.z - bz
    const cos = Math.cos(box.rotationY)
    const sin = Math.sin(box.rotationY)
    const lx = dx * cos - dz * sin
    const lz = dx * sin + dz * cos
    if (Math.abs(lx) >= halfW || Math.abs(lz) >= halfD) continue
    const penX = halfW - Math.abs(lx)
    const penZ = halfD - Math.abs(lz)
    let pushLx = 0
    let pushLz = 0
    if (penX < penZ) pushLx = Math.sign(lx || 1) * penX
    else pushLz = Math.sign(lz || 1) * penZ
    p.x += pushLx * cos + pushLz * sin
    p.z += -pushLx * sin + pushLz * cos
  }
}
