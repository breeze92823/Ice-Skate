// Ground.026's looping solid/fade-out/hidden/fade-in cycle (data/groundBlocks.js's
// `phasing: true` flag): solid and collidable for SOLID_DURATION, fades out
// over FADE_OUT_DURATION (not collidable the instant the fade starts, not
// just once fully transparent), stays fully invisible for HIDDEN_DURATION,
// then fades back in over FADE_IN_DURATION (still not collidable until it's
// fully opaque again) before looping back to solid.
const SOLID_DURATION = 10
const FADE_OUT_DURATION = 10
const HIDDEN_DURATION = 10
const FADE_IN_DURATION = 10
const CYCLE = SOLID_DURATION + FADE_OUT_DURATION + HIDDEN_DURATION + FADE_IN_DURATION

// Mutated in place, read every frame by components/GroundBlocks.jsx
// (material opacity + mesh visibility) and systems/playerMovement.js
// (collision skip) without a React subscription — same convention as the
// hammerAnim singleton.
export const groundPhase = { opacity: 1, collidable: true }

let elapsed = 0

export function step(dt) {
  if (dt <= 0) return
  elapsed = (elapsed + dt) % CYCLE

  const fadeOutStart = SOLID_DURATION
  const hiddenStart = fadeOutStart + FADE_OUT_DURATION
  const fadeInStart = hiddenStart + HIDDEN_DURATION

  if (elapsed < fadeOutStart) {
    groundPhase.opacity = 1
    groundPhase.collidable = true
  } else if (elapsed < hiddenStart) {
    const t = (elapsed - fadeOutStart) / FADE_OUT_DURATION
    groundPhase.opacity = 1 - t
    groundPhase.collidable = false
  } else if (elapsed < fadeInStart) {
    groundPhase.opacity = 0
    groundPhase.collidable = false
  } else {
    const t = (elapsed - fadeInStart) / FADE_IN_DURATION
    groundPhase.opacity = t
    groundPhase.collidable = false
  }
}
