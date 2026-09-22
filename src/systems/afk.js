// AFK auto-fire proximity. This project has no in-world AFK targets
// (data/afk.js's AFK_TARGET_CONFIG is empty), so findNearestTargetInRange()
// always returns null and the HUD's "Press E to AFK Here" prompt never
// shows. Kept wired — startAfk/stopAfk and the shared afkState shape — so
// systems/interact.js and components/hud/Hud.jsx need no changes the day
// targets are placed in the world.
import { inputState, isHeld } from './input.js'
import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { playSpeedGainPop } from './sfx.js'
import { AFK_RANGE, AFK_TARGET_CONFIG, afkSpeedMultiplier } from '../data/afk.js'

export const afkState = {
  active: false, // true while locked onto targetId and auto-firing
  targetId: null, // AFK_TARGET_CONFIG id currently locked onto, valid only while active
  multiplier: 1, // speed multiplier for the locked target, valid only while active
  nearTargetId: null, // nearest configured target within AFK_RANGE this frame, or null
  nearAllowed: false, // player's rebirth meets nearTargetId's rebirthRequired AND (no winsRequired or already owned)
  nearRebirthRequired: 0, // nearTargetId's rebirthRequired, for the HUD prompt
  nearNeedsPurchase: false, // nearTargetId has a winsRequired not yet in the store's ownedTargets
  purchaseRequestedId: null, // set the frame a completed hold lands on a nearNeedsPurchase target
}

// No in-world targets to look up positions for yet.
const TARGET_BY_ID = new Map()

function findNearestTargetInRange() {
  const p = player.position
  let bestId = null
  let bestDistSq = AFK_RANGE * AFK_RANGE
  for (const id in AFK_TARGET_CONFIG) {
    const t = TARGET_BY_ID.get(id)
    if (!t) continue
    const dx = p.x - t.position[0]
    const dy = p.y - t.position[1]
    const dz = p.z - t.position[2]
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      bestId = id
    }
  }
  return bestId
}

export function stopAfk() {
  afkState.active = false
  afkState.targetId = null
  afkState.multiplier = 1
}

export function startAfk(id) {
  afkState.active = true
  afkState.targetId = id
  afkState.multiplier = afkSpeedMultiplier(AFK_TARGET_CONFIG[id].speed)
  playSpeedGainPop()
}

export function step() {
  const nearId = findNearestTargetInRange()
  const { rebirth, ownedTargets } = useGameStore.getState()
  afkState.nearTargetId = nearId
  afkState.nearRebirthRequired = nearId ? AFK_TARGET_CONFIG[nearId].rebirthRequired : 0
  afkState.nearNeedsPurchase =
    nearId !== null && !!AFK_TARGET_CONFIG[nearId].winsRequired && !ownedTargets.has(nearId)
  afkState.nearAllowed =
    nearId !== null && rebirth >= afkState.nearRebirthRequired && !afkState.nearNeedsPurchase

  if (afkState.active && inputState.interact) {
    inputState.interact = false
    stopAfk()
  }

  if (afkState.active) {
    const moving = inputState.move.x !== 0 || inputState.move.z !== 0
    const cfg = AFK_TARGET_CONFIG[afkState.targetId]
    if (moving || isHeld('Space') || !cfg || rebirth < cfg.rebirthRequired) {
      stopAfk()
    } else {
      const t = TARGET_BY_ID.get(afkState.targetId)
      const dx = t.position[0] - player.position.x
      const dz = t.position[2] - player.position.z
      if (Math.hypot(dx, dz) > 0.01) player.facing = Math.atan2(dx, dz)
    }
  }
}
