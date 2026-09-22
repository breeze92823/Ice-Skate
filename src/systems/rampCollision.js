import { RAMPS, RAMP_PROFILE, RAMP_HALF_WIDTH } from '../data/ramp.js'

// Piecewise-linear sample of the ramp mesh's own top-surface curve (see
// data/ramp.js) at a local X coordinate, or null outside its run.
// RAMP_PROFILE is ordered by ascending local X.
function profileTopZ(localX) {
  const pts = RAMP_PROFILE
  if (localX < pts[0].x || localX > pts[pts.length - 1].x) return null
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (localX <= b.x) {
      const t = (localX - a.x) / (b.x - a.x)
      return a.z + (b.z - a.z) * t
    }
  }
  return null
}

// Top surface height of whichever RAMPS instance (x, z) falls within, or
// null if none. Each ramp is a curved incline (see data/ramp.js), not a
// flat/tilted box, so this doesn't reuse playerMovement.js's
// groundBlockTopAt/bandedBlockTopAt math (both assume a slope tilted about
// the world X axis; these ramps climb along their own local X axis
// instead, which becomes world X, Z, or anything between depending on
// `rotationY`). (x, z) is mapped into the ramp's own local, unscaled frame
// by undoing position, yaw, then scale — the inverse of the forward
// transform three.js applies to render each instance (see data/ramp.js's
// header comment for the forward formula this inverts) — then sampled
// against RAMP_PROFILE.
//
// No `prevY`-based landing test here (unlike groundBlockTopAt) — same
// reasoning as Slope_Block's bandedBlockTopAt: a continuously rising
// surface must report its new top every frame so walking up it doesn't
// fall through, so this is deliberately exempt from that check. Ramps
// aren't solid from other sides in this game either (no companion
// resolveGroundBlocks-style push), same precedent as Slope_Block.
export function rampTopAt(x, z) {
  for (const ramp of RAMPS) {
    const [px, py, pz] = ramp.position
    const [sx, sy, sz] = ramp.scale
    const dx = x - px
    const dz = z - pz
    const cos = Math.cos(ramp.rotationY)
    const sin = Math.sin(ramp.rotationY)
    // Undo the yaw (inverse of three.js's Y-rotation forward map).
    const localX = (dx * cos - dz * sin) / sx
    const localYWidth = -(dx * sin + dz * cos) / sz
    if (Math.abs(localYWidth) > RAMP_HALF_WIDTH) continue
    const topZ = profileTopZ(localX)
    if (topZ === null) continue
    return py + topZ * sy
  }
  return null
}
