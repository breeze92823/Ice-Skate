// GROUND_BLOCKS panels flagged `ladder: true` (see groundBlocks.js —
// currently just Ground.054, the Stage11 gap between its lower platform and
// the plateau above) climb like a real ladder instead of blocking sideways
// like every other ground block: stand in the panel's footprint and hold
// forward (W/ArrowUp) to rise straight up its face, capped at its own top
// edge, where the normal ground-block collision in playerMovement.js (the
// plateau it's flush against) takes over.
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { player } from './playerState.js'

const LADDERS = GROUND_BLOCKS.filter((b) => b.ladder)

// True if the capsule's feet are within the ladder panel's own footprint
// (padded by the player radius, same Minkowski-sum convention every other
// resolver in playerMovement.js uses) and somewhere along its vertical span.
function touchingLadder(block, x, y, z) {
  const [bx, by, bz] = block.position
  const [width, thickness, depth] = block.size
  const halfW = width / 2 + player.dims.radius
  const halfD = depth / 2 + player.dims.radius
  const halfH = thickness / 2
  if (Math.abs(x - bx) > halfW || Math.abs(z - bz) > halfD) return false
  return y >= by - halfH && y <= by + halfH
}

// Climbs `p` up whichever ladder panel it's touching, if `wantsClimb`
// (forward held), at `speed` — the same ground moveSpeed walking uses (see
// playerMovement.js's call site), so climbing feels like the same pace of
// travel rather than a separate fixed rate. Returns true when it did, so
// step() can skip its usual gravity/fall-through handling for this frame.
export function stepLadder(p, dt, wantsClimb, speed) {
  if (!wantsClimb) return false
  for (const block of LADDERS) {
    if (!touchingLadder(block, p.x, p.y, p.z)) continue
    const [, by] = block.position
    const [, thickness] = block.size
    const top = by + thickness / 2
    p.y = Math.min(p.y + speed * dt, top)
    return true
  }
  return false
}
