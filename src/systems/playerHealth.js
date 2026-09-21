// Local player's own PVP health. This project has no PVP zone
// (data/pvpZone.js's isInPvpZone always returns false), so nothing ever
// calls applyRemoteHealth with real damage — this singleton just stays at
// full health. Kept as a real module so components/hud/LevelBar.jsx's tiny
// HP sliver and the HUD's death prompt need no changes the day PVP lands.
import { PLAYER_MAX_HP } from '../data/playerHealth.js'

export const health = { hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP, dead: false, respawnAt: 0, hitFlashAt: 0 }

export function healthFraction() {
  return Math.max(0, health.hp) / health.maxHp
}

const healthNetListeners = new Set()

export function subscribeHealthNet(fn) {
  healthNetListeners.add(fn)
  return () => healthNetListeners.delete(fn)
}

// Adopt hp/dead from a future netcode layer. A no-op today — nothing calls
// this — kept so systems/net.js has a real seam to call into once it exists.
export function applyRemoteHealth(hp, dead) {
  if (dead && !health.dead) {
    health.hp = 0
    health.dead = true
    return
  }
  if (!health.dead) {
    const clamped = Math.max(0, Math.min(Number(hp) || 0, health.maxHp))
    if (clamped < health.hp) {
      health.hp = clamped
      health.hitFlashAt = performance.now()
    }
  }
}

export function step() {
  // No PVP zone yet — nothing to step.
}
