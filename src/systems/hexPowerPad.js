// Hex speed pad buy/equip proximity. This project has no in-world pads
// (data/hexPowerPad.js's HEX_SPEED_PAD_POSITIONS is empty), so
// findNearestPadInRange() always returns null and the buy/equip prompt
// never shows. Kept wired so systems/interact.js and the store's
// ownedHexPads/equippedHexPad need no changes the day pads are placed.
import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { playSpeedGainPop } from './sfx.js'
import { showActionResult } from './actionResult.js'
import { formatShort } from '../data/format.js'
import { HEX_SPEED_PAD_POSITIONS, HEX_SPEED_PAD_TIERS, HEX_SPEED_PAD_RANGE } from '../data/hexPowerPad.js'

export const hexSpeedPadState = {
  nearIndex: null, // index of the nearest pad within HEX_SPEED_PAD_RANGE this frame, or null
}

function findNearestPadInRange() {
  const p = player.position
  let bestIndex = null
  let bestDistSq = HEX_SPEED_PAD_RANGE * HEX_SPEED_PAD_RANGE
  for (let i = 0; i < HEX_SPEED_PAD_POSITIONS.length; i++) {
    const pos = HEX_SPEED_PAD_POSITIONS[i]
    const dx = p.x - pos[0]
    const dy = p.y - pos[1]
    const dz = p.z - pos[2]
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      bestIndex = i
    }
  }
  return bestIndex
}

export function step() {
  hexSpeedPadState.nearIndex = findNearestPadInRange()
}

// Called by systems/interact.js once a hold against this pad's zone
// completes.
export function interactWithNearestPad() {
  const index = hexSpeedPadState.nearIndex
  if (index === null) return

  const state = useGameStore.getState()
  if (state.ownedHexPads.has(index)) {
    if (state.equippedHexPad !== index) {
      state.equipHexPad(index)
      playSpeedGainPop()
      showActionResult('Pad Equipped', true)
    }
  } else {
    const tier = HEX_SPEED_PAD_TIERS[index]
    if (!tier) return
    if (state.wins >= tier.winsRequired) {
      state.buyHexPad(index)
      playSpeedGainPop()
      showActionResult(`Pad Purchased! +${formatShort(tier.speedPerGain)} Speed`, true)
    } else {
      showActionResult(`Need ${formatShort(tier.winsRequired)} Wins to Buy`, false)
    }
  }
}
