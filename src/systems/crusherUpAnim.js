import { CRUSHER_UP } from '../data/crusherUp.js'

// Stage10's CrusherUp: a floor-mounted spike that punches upward along +Y
// from its buried resting spot, holds closed (punched through the floor),
// retracts, holds open (hidden below the floor), repeat — same slam-fast/
// rise-slower cadence as CrusherWall (systems/crusherAnim.js), CrusherSide
// (systems/crusherSideAnim.js), and Hammer (systems/hammerAnim.js). No
// partner object in Blender to derive the travel distance from, so
// TRAVEL_Y is an explicit gameplay constant (user-confirmed: ~45 units,
// enough for the top face to breach the floor and jut a few units into the
// Stage10 corridor).
const TRAVEL_Y = 200

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

// Mutated in place, read every frame by components/CrusherUp.jsx and
// systems/crusherUpCrush.js without a React subscription — same convention
// as crusherAnim.offsetZ/crusherSideAnim.offsetX/hammerAnim.offsetY.
export const crusherUpAnim = { offsetY: 0 }

let elapsed = 0

export function step(dt) {
  if (dt <= 0) return
  elapsed = (elapsed + dt) % CYCLE

  if (elapsed < CLOSE_DURATION) {
    crusherUpAnim.offsetY = TRAVEL_Y * easeInQuad(elapsed / CLOSE_DURATION)
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED) {
    crusherUpAnim.offsetY = TRAVEL_Y
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED + OPEN_DURATION) {
    const t = (elapsed - CLOSE_DURATION - HOLD_CLOSED) / OPEN_DURATION
    crusherUpAnim.offsetY = TRAVEL_Y * (1 - easeOutQuad(t))
  } else {
    crusherUpAnim.offsetY = 0
  }
}

// CrusherUp slides toward +Y to punch closed.
export function currentY() {
  return CRUSHER_UP.position[1] + crusherUpAnim.offsetY
}
