// Multiplayer presence. This project has no server to connect to, so this
// module never actually opens a socket — every export exists so components/
// hud/NetStatus.jsx and store/useGameStore.js need no changes the day real
// netcode lands. `status` stays 'idle' forever, and NetStatus renders
// nothing for that status, so this is silent by design (same "never blocks,
// never intrudes" stance a real implementation would need anyway).
export const netState = {
  status: 'idle',
  attempt: 0,
  playerCount: 0,
  everConnected: false,
  error: null,
}

// id -> live remote body. Always empty — nothing populates it without a
// server. components/RemotePlayers.jsx doesn't exist in this project, so
// nothing reads this either; kept for API parity.
export const remotePlayers = new Map()

const listeners = new Set()

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function init() {
  // No server to connect to.
}

export function teardown() {
  // Nothing to tear down.
}

export function retryNow() {
  // Nothing to retry.
}

export function reportLocal() {
  // No room to report position to.
}

export function step() {
  // No remote bodies to interpolate.
}

export function sendPlayerDamage() {
  // No PVP netcode.
}

// Local-only leaderboard: just our own row, read straight off the live
// store — the same shape a real implementation's self row would have.
export function getLeaderboard(stat, limit, getState) {
  const value = getState ? Number(getState()[stat]) || 0 : 0
  return [{ id: 'self', name: 'You', value, isSelf: true }].slice(0, limit)
}
