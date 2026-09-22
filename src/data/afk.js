// AFK auto-fire tunables. This project has no in-world AFK targets yet
// (AFK_TARGET_CONFIG is empty), so systems/afk.js's proximity scan never
// finds one and the "Press E to AFK Here" prompt never shows — the system
// stays wired for when targets are added.
export const AFK_RANGE = 4.5

export const AFK_INTERACT_KEY = 'KeyE'

// Per-target AFK config, keyed by an in-world target's id. Empty until this
// project has targets to place.
export const AFK_TARGET_CONFIG = {}

// "xN" tier string (or a bare number) -> the multiplier actually applied to
// each AFK Action's Speed. "x0" and anything non-positive collapse to 1x.
export function afkSpeedMultiplier(speed) {
  const n = typeof speed === 'string' ? parseInt(speed.replace(/^x/i, ''), 10) : Number(speed)
  return Number.isFinite(n) && n > 0 ? n : 1
}
