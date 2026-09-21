import { useThree, useFrame } from '@react-three/fiber'
import { tick } from '../systems/timeScale.js'
import { step } from '../systems/playerMovement.js'
import { update as updateCamera } from '../systems/cameraOrbit.js'
import { step as stepPlayerHealth } from '../systems/playerHealth.js'
import { step as stepAfk } from '../systems/afk.js'
import { step as stepHexPowerPad } from '../systems/hexPowerPad.js'
import { step as stepMerchant } from '../systems/merchant.js'
import { step as stepInteract } from '../systems/interact.js'
import { step as stepActionPopups } from '../systems/actionPopups.js'
import { inputState } from '../systems/input.js'
import { step as stepNet, reportLocal } from '../systems/net.js'
import { notifyFirstFrame } from '../systems/bloxity.js'

// The single simulation tick. Rendered before the view components so its
// useFrame subscribes first and runs first each frame.
export default function GameLoop() {
  const camera = useThree((s) => s.camera)

  useFrame(() => {
    const dt = tick()
    stepPlayerHealth()
    step(dt)
    updateCamera(camera, dt)
    // Project the player to the screen and age live popups before stepAction
    // below can spawn new ones this frame.
    stepActionPopups(dt, camera)
    stepAfk()
    stepHexPowerPad()
    stepMerchant()
    // Resolves which (if any) of the three proximity zones above is the
    // shared hold-to-confirm gate's current target, and fires that zone's
    // action once the player has held E against it.
    stepInteract()
    // afk.js's own "E again to stop" toggle is the only thing left reading
    // inputState.interact directly, and already clears it when it fires —
    // reset here so a press that toggled nothing never lingers into a
    // later frame.
    inputState.interact = false
    // Multiplayer presence: a no-op while there's no server (systems/net.js).
    stepNet(dt)
    reportLocal()
    // The scene is interactive as soon as a frame is on screen, with or
    // without a signed-in avatar; dismiss the portal loading screen here.
    // No-ops after the first call.
    notifyFirstFrame()
  })

  return null
}
