import { CRUSHER_SIDE } from '../data/crusherSide.js'

// Stage8's CrusherSide: a single wall-mounted piston that punches inward
// along -X from its resting spot, holds closed, retracts, holds open,
// repeat — same slam-fast/rise-slower cadence as CrusherWall (systems/
// crusherAnim.js) and Hammer (systems/hammerAnim.js). Unlike CrusherWall,
// there's no partner object in Blender to derive the travel distance from,
// so TRAVEL_X is an explicit gameplay constant (user-confirmed "short
// punch" — far enough to jut into the Stage8 corridor's walkable Z-run
// without sweeping its full width).
const TRAVEL_X = 115

const CLOSE_DURATION = 0.4 // fast slam
const HOLD_CLOSED = 5
const OPEN_DURATION = 1.2 // slower retract
const HOLD_OPEN = 10
const CYCLE = CLOSE_DURATION + HOLD_CLOSED + OPEN_DURATION + HOLD_OPEN

function easeInQuad(t) {
  return t * t
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

// Mutated in place, read every frame by components/CrusherSide.jsx and
// systems/crusherSideCrush.js without a React subscription — same
// convention as crusherAnim.offsetZ/hammerAnim.offsetY.
export const crusherSideAnim = { offsetX: 0 }

let elapsed = 0

export function step(dt) {
  if (dt <= 0) return
  elapsed = (elapsed + dt) % CYCLE

  if (elapsed < CLOSE_DURATION) {
    crusherSideAnim.offsetX = TRAVEL_X * easeInQuad(elapsed / CLOSE_DURATION)
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED) {
    crusherSideAnim.offsetX = TRAVEL_X
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED + OPEN_DURATION) {
    const t = (elapsed - CLOSE_DURATION - HOLD_CLOSED) / OPEN_DURATION
    crusherSideAnim.offsetX = TRAVEL_X * (1 - easeOutQuad(t))
  } else {
    crusherSideAnim.offsetX = 0
  }
}

// CrusherSide slides toward -X to close.
export function currentX() {
  return CRUSHER_SIDE.position[0] - crusherSideAnim.offsetX
}
