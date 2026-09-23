// Win-panel pickup, ported from Laser-Escape's systems/glowFloorPanel.js and
// trimmed to this project's mechanics: no walls/ragdolls/run to reset here,
// so stepping onto the panel just banks its Wins once (same singleton-state,
// stepped-once-per-frame-from-GameLoop style as afk.js/hexPowerPad.js). The
// award re-arms only after the player leaves the zone.
import { player, resetPlayer } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { playSpeedGainPop } from './sfx.js'
import { showActionResult } from './actionResult.js'
import { formatShort } from '../data/format.js'
import { SPAWN } from '../data/hub.js'
import { syncYawToPlayer } from './cameraOrbit.js'
import {
  GLOW_FLOOR_PANEL_POSITIONS,
  GLOW_FLOOR_PANEL_WINS,
  GLOW_FLOOR_PANEL_RANGE,
} from '../data/glowFloorPanel.js'

export const glowFloorPanelState = {
  onIndex: null, // index of the panel the player is standing on this frame, or null
}

function findPanelUnderPlayer() {
  const p = player.position
  let bestIndex = null
  let bestDistSq = GLOW_FLOOR_PANEL_RANGE * GLOW_FLOOR_PANEL_RANGE
  for (let i = 0; i < GLOW_FLOOR_PANEL_POSITIONS.length; i++) {
    const pos = GLOW_FLOOR_PANEL_POSITIONS[i]
    // Horizontal only — the panel lies flat on the ground, so a jump over it
    // should still collect it.
    const dx = p.x - pos[0]
    const dz = p.z - pos[2]
    const distSq = dx * dx + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      bestIndex = i
    }
  }
  return bestIndex
}

export function step() {
  const index = findPanelUnderPlayer()

  // Fire once on entry: only when this frame's panel differs from the one we
  // were already on. Stepping off (index === null) re-arms it.
  if (index !== null && index !== glowFloorPanelState.onIndex) {
    const amount = GLOW_FLOOR_PANEL_WINS[index] ?? 0
    if (amount > 0) {
      useGameStore.getState().awardWins(amount)
      playSpeedGainPop()
      showActionResult(`+${formatShort(amount)} Wins`, true)
    }
    // Touching the panel sends the player back to the hub spawn — a
    // checkpoint/finish trigger, not a hazard, so this is an instant
    // teleport: no HP loss, no death flash, no respawn delay.
    resetPlayer(SPAWN)
    syncYawToPlayer()
  }

  glowFloorPanelState.onIndex = index
}
