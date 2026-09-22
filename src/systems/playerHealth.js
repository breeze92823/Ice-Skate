// Local player's own PVP health, plus the drowning death that
// systems/playerMovement.js triggers when the player falls off Ground.jsx's
// island into Water.jsx. This project has no PVP zone (data/pvpZone.js's
// isInPvpZone always returns false), so applyRemoteHealth never fires with
// real damage — kept as a real module so components/hud/LevelBar.jsx's tiny
// HP sliver and the HUD's death prompt need no changes the day PVP lands.
import { PLAYER_MAX_HP, RESPAWN_DELAY_MS } from '../data/playerHealth.js'
import { SPAWN } from '../data/hub.js'
import { resetPlayer } from './playerState.js'
import { syncYawToPlayer } from './cameraOrbit.js'

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

// Drowning: falling off the island into the water. Idempotent — a player
// already dead (or already respawning) ignores a second call from the same
// frame's ground check.
export function die() {
  if (health.dead) return
  health.hp = 0
  health.dead = true
  health.respawnAt = performance.now() + RESPAWN_DELAY_MS
}

export function step() {
  if (health.dead && performance.now() >= health.respawnAt) {
    health.hp = health.maxHp
    health.dead = false
    resetPlayer(SPAWN)
    syncYawToPlayer()
  }
}
