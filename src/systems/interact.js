// Orchestrates every "Press E to ..." start action (systems/afk.js's
// lock-on, systems/hexPowerPad.js's buy/equip, systems/merchant.js's aura)
// behind the shared 2-second hold gate (systems/interactHold.js) instead of
// firing instantly on keydown — so the HUD's InteractPrompt can show a fill
// ring the player watches complete before anything happens. Stepped once
// per frame from GameLoop, right after afk/hexPad/merchant's own step()
// (which only compute proximity) and before inputState.interact's
// end-of-frame reset.
import { isInteractKeyDown } from './input.js'
import { afkState, startAfk } from './afk.js'
import { hexSpeedPadState, interactWithNearestPad } from './hexPowerPad.js'
import { merchantState } from './merchant.js'
import { step as stepHold } from './interactHold.js'
import { playSpeedGainPop } from './sfx.js'
import { showActionResult } from './actionResult.js'

export function step() {
  if (afkState.active) {
    stepHold(null, false) // no hold-confirmable prompt while auto-firing
    return
  }

  let zoneKey = null
  if (afkState.nearTargetId !== null) zoneKey = `afk:${afkState.nearTargetId}`
  else if (hexSpeedPadState.nearIndex !== null) zoneKey = `hexPad:${hexSpeedPadState.nearIndex}`
  else if (merchantState.near) zoneKey = 'merchant'

  const confirmed = stepHold(zoneKey, isInteractKeyDown())
  if (!confirmed) return

  if (zoneKey.startsWith('afk:')) {
    if (afkState.nearAllowed) {
      startAfk(afkState.nearTargetId)
    } else if (afkState.nearNeedsPurchase) {
      afkState.purchaseRequestedId = afkState.nearTargetId
      playSpeedGainPop()
    } else {
      showActionResult(`Rebirth ${afkState.nearRebirthRequired} required`, false)
    }
  } else if (zoneKey.startsWith('hexPad:')) {
    interactWithNearestPad()
  } else if (zoneKey === 'merchant') {
    merchantState.openAuraRequested = true
    playSpeedGainPop()
  }
}
