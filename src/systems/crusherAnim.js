import { CRUSHER_WALLS, CRUSHER_WALL_SIZE } from '../data/crusherWall.js'

// Stage9's CrusherWall pair: slide toward each other along Z to fully close
// the gap between their facing edges (meeting exactly at the platform's
// center), hold closed, retract, hold open, repeat — a horizontal version
// of Hammer's vertical drop/rise loop (systems/hammerAnim.js), same
// slam-fast/rise-slower cadence.
const [, , DEPTH] = CRUSHER_WALL_SIZE
export const CENTER_Z = (CRUSHER_WALLS[0].position[2] + CRUSHER_WALLS[1].position[2]) / 2
const GAP = Math.abs(CRUSHER_WALLS[0].position[2] - CRUSHER_WALLS[1].position[2]) - DEPTH
const SLIDE = GAP / 2 // distance each wall travels toward CENTER_Z to fully close the gap

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

// Mutated in place, read every frame by components/CrusherWalls.jsx and
// systems/crusherCrush.js without a React subscription — same convention as
// hammerAnim.offsetY.
export const crusherAnim = { offsetZ: 0 }

let elapsed = 0

export function step(dt) {
  if (dt <= 0) return
  elapsed = (elapsed + dt) % CYCLE

  if (elapsed < CLOSE_DURATION) {
    crusherAnim.offsetZ = SLIDE * easeInQuad(elapsed / CLOSE_DURATION)
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED) {
    crusherAnim.offsetZ = SLIDE
  } else if (elapsed < CLOSE_DURATION + HOLD_CLOSED + OPEN_DURATION) {
    const t = (elapsed - CLOSE_DURATION - HOLD_CLOSED) / OPEN_DURATION
    crusherAnim.offsetZ = SLIDE * (1 - easeOutQuad(t))
  } else {
    crusherAnim.offsetZ = 0
  }
}

// A wall resting on the +Z side of CENTER_Z slides toward -Z to close, and
// vice versa — this sign flip is shared by the renderer and the crush test
// so they always agree on where each wall currently sits.
export function currentZ(position) {
  return position[2] + Math.sign(CENTER_Z - position[2]) * crusherAnim.offsetZ
}
