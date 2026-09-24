import { SIDE_WALL_COLLIDERS } from '../data/wallColliders.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'

// Keeps the third-person orbit camera from clipping into level geometry: the
// camera rig (cameraOrbit.js) picks a desired distance from the player based
// on zoom/orbit input alone, with no idea what's between the player and that
// point, so a wall or ground block behind the player pushes the near side of
// its box straight through the lens. clampCameraDistance casts a segment
// from the follow target out along the camera's own direction and shortens
// it to stop CAMERA_SKIN short of the first static collider box it would
// otherwise pass through — same Minkowski-sum AABB idea playerMovement.js's
// wall/ground-block resolvers use for the player capsule, just as a
// segment-vs-box test (expanded outward by a flat skin margin) instead of a
// point-vs-box push (expanded by the capsule radius).

const CAMERA_SKIN = 0.3
// Distance never collapses below this fraction of the requested zoom, so a
// wall directly behind the player can't pull the camera all the way onto
// (or past) the player model.
const MIN_DISTANCE_FRACTION = 0.15

// Ground blocks with a rotationX (ramps) or a non-rectangular footprint
// (Slope_Block's `bands`) are skipped — those need the tilted-plane
// projection playerMovement.js's groundBlockTopAt uses, which the camera
// doesn't need to be pixel-accurate about. The plain solid boxes (every
// wall segment + every other ground block, including the yawed
// GroundBlock.006 pillars) cover every case that actually clips the camera.
const COLLIDERS = [
  ...SIDE_WALL_COLLIDERS,
  ...GROUND_BLOCKS.filter((block) => !block.bands && !block.customMesh && !block.rotationX),
]

// Clips one axis of a segment against the slab [-half, half] in that axis's
// local coordinate, tightening the segment's currently-allowed parametric
// range [tMin, tMax] (t=0 at the target, t=1 at the un-clamped desired
// camera position) or returning null once the slab rules the segment out
// entirely.
function clipAxis(o, dir, half, tMin, tMax) {
  if (Math.abs(dir) < 1e-9) {
    return Math.abs(o) <= half ? [tMin, tMax] : null
  }
  let t0 = (-half - o) / dir
  let t1 = (half - o) / dir
  if (t0 > t1) {
    const tmp = t0
    t0 = t1
    t1 = tmp
  }
  const newMin = Math.max(tMin, t0)
  const newMax = Math.min(tMax, t1)
  return newMin <= newMax ? [newMin, newMax] : null
}

// Segment (ox,oy,oz) -> (ox+dx,oy+dy,oz+dz), where (dx,dy,dz) already
// carries the full desired camera distance. Returns the t in [0, 1] where it
// first enters `box` (expanded by CAMERA_SKIN), or null if it never does.
// `box.rotationY` (GroundBlock.006's pillar cluster) is undone by rotating
// the segment into the box's own local frame first, same as
// playerMovement.js's groundBlockTopAt/resolveGroundBlocks.
function segmentEntersBox(ox, oy, oz, dx, dy, dz, box) {
  const [bx, by, bz] = box.position
  const [w, h, d] = box.size
  const rotationY = box.rotationY ?? 0
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  const relX = ox - bx
  const relZ = oz - bz
  const lox = relX * cos - relZ * sin
  const loz = relX * sin + relZ * cos
  const ldx = dx * cos - dz * sin
  const ldz = dx * sin + dz * cos

  let range = clipAxis(lox, ldx, w / 2 + CAMERA_SKIN, 0, 1)
  if (!range) return null
  range = clipAxis(oy - by, dy, h / 2 + CAMERA_SKIN, range[0], range[1])
  if (!range) return null
  range = clipAxis(loz, ldz, d / 2 + CAMERA_SKIN, range[0], range[1])
  if (!range) return null

  return Math.max(range[0], 0)
}

// Shortens `distance` (the orbit rig's desired camera distance along the
// unit direction (dx, dy, dz) from the follow target (tx, ty, tz)) to stop
// just short of the first static collider box the ray would otherwise pass
// through.
export function clampCameraDistance(tx, ty, tz, dx, dy, dz, distance) {
  let minT = 1
  for (const box of COLLIDERS) {
    const t = segmentEntersBox(tx, ty, tz, dx * distance, dy * distance, dz * distance, box)
    if (t !== null && t < minT) minT = t
  }
  return distance * Math.max(minT, MIN_DISTANCE_FRACTION)
}
