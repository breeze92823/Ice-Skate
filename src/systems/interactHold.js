// Shared "hold E for HOLD_MS to confirm" gate for every proximity prompt
// that shows the keycap card (systems/afk.js's start-lock, systems/
// hexPowerPad.js's buy/equip, systems/merchant.js's aura) — one timer no
// matter which zone is near, since only one such prompt is ever visible at
// once. Stepped once per frame from systems/interact.js.
export const HOLD_MS = 2000

export const interactHoldState = {
  active: false, // a hold is in progress against some zone this frame
  progress: 0, // 0..1 toward HOLD_MS
}

let ownerKey = null
let startedAt = 0

function reset() {
  ownerKey = null
  startedAt = 0
  interactHoldState.active = false
  interactHoldState.progress = 0
}

// zoneKey identifies the interactable currently in range (e.g. `afk:${id}`,
// `hexPad:${index}`, 'merchant'), or null when nothing eligible is near this
// frame. keyDown is whether the interact key is physically held right now.
// Returns true on the exact frame a continuous hold against the SAME
// zoneKey reaches HOLD_MS. Releasing the key, or the zoneKey changing,
// resets the timer to zero.
export function step(zoneKey, keyDown) {
  if (!zoneKey || !keyDown) {
    reset()
    return false
  }
  if (ownerKey !== zoneKey) {
    ownerKey = zoneKey
    startedAt = performance.now()
  }
  interactHoldState.active = true
  const elapsed = performance.now() - startedAt
  interactHoldState.progress = Math.min(1, elapsed / HOLD_MS)
  if (elapsed >= HOLD_MS) {
    reset()
    return true
  }
  return false
}
