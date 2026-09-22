// Stage7's Hammer props: loop straight down 5m, hold, rise back up, hold.
// All 4 instances (data/hammer.js) share one synced offset — no per-instance
// phase stagger was asked for. Timing: fast ~0.4s slam down, hold 5s at the
// bottom, slower ~1.2s rise, hold 10s at the top, then repeat.
const DROP = 22 // metres, world Y
const DOWN_DURATION = 0.4 // fast slam
const HOLD_DOWN = 5
const UP_DURATION = 1.2 // slower rise
const HOLD_UP = 10
const CYCLE = DOWN_DURATION + HOLD_DOWN + UP_DURATION + HOLD_UP

function easeInQuad(t) {
  return t * t
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

// Mutated in place, read every frame by components/Hammer.jsx without a
// React subscription — same convention as the giantBall singleton in
// systems/giantBallPhysics.js.
export const hammerAnim = { offsetY: 0 }

let elapsed = 0

export function step(dt) {
  if (dt <= 0) return
  elapsed = (elapsed + dt) % CYCLE

  if (elapsed < DOWN_DURATION) {
    hammerAnim.offsetY = -DROP * easeInQuad(elapsed / DOWN_DURATION)
  } else if (elapsed < DOWN_DURATION + HOLD_DOWN) {
    hammerAnim.offsetY = -DROP
  } else if (elapsed < DOWN_DURATION + HOLD_DOWN + UP_DURATION) {
    const t = (elapsed - DOWN_DURATION - HOLD_DOWN) / UP_DURATION
    hammerAnim.offsetY = -DROP * (1 - easeOutQuad(t))
  } else {
    hammerAnim.offsetY = 0
  }
}
