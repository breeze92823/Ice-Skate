// Cross-cutting Bloxity character load-status signals, shared between
// systems/avatarModel.js (which has no business importing a DOM/React
// overlay) and components/LoadingScreen.jsx (which needs to know the
// avatar's load status without importing GLTFLoader internals).
// Framework-free and mutated via setters, same shape as avatarState.js.

// The base rig retry loop (avatarModel.js) gives up after this many
// attempts rather than retrying forever, so a dead CDN surfaces as a
// concrete, retryable error instead of an endless spinner.
export const BASE_RIG_MAX_ATTEMPTS = 3

let ready = false
let attempt = 0
let failed = false
const listeners = new Set()

function emit() {
  const snapshot = { ready, attempt, failed }
  for (const fn of listeners) fn(snapshot)
}

// Live, not one-shot: flips false again any time a rebuild is in flight
// (new cosmetics, a retry), so LoadingScreen.jsx can reopen itself rather
// than only ever gating the very first load.
export function setAvatarReady(value) {
  if (ready === value) return
  ready = value
  if (value) {
    attempt = 0
    failed = false
  }
  emit()
}

// Bumped by avatarModel.js's retry loop on every failed attempt.
export function setAvatarAttempt(n) {
  if (attempt === n) return
  attempt = n
  emit()
}

export function setAvatarFailed(value) {
  if (failed === value) return
  failed = value
  emit()
}

export function subscribeAvatarStatus(fn) {
  listeners.add(fn)
  fn({ ready, attempt, failed })
  return () => listeners.delete(fn)
}

// Fired by LoadingScreen.jsx's Retry button once the loop has already given
// up — PlayerAvatar.jsx listens and kicks off a fresh rebuild (a whole new
// BASE_RIG_MAX_ATTEMPTS cycle), since by that point the retry loop itself
// has exited rather than sitting on a backoff wait to interrupt.
const retryListeners = new Set()

export function requestAvatarRetry() {
  attempt = 0
  failed = false
  emit()
  for (const fn of [...retryListeners]) fn()
}

export function subscribeAvatarRetry(fn) {
  retryListeners.add(fn)
  return () => retryListeners.delete(fn)
}
