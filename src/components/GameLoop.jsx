import { useThree, useFrame } from '@react-three/fiber'
import { tick } from '../systems/timeScale.js'
import { step } from '../systems/playerMovement.js'
import { step as stepGroundPhase } from '../systems/groundPhase.js'
import { step as stepGiantBall } from '../systems/giantBallPhysics.js'
import { step as stepGiantBallCrush } from '../systems/giantBallCrush.js'
import { step as stepSahurFollow } from '../systems/sahurFollow.js'
import { step as stepSahurCrush } from '../systems/sahurCrush.js'
import { update as updateCamera } from '../systems/cameraOrbit.js'
import { step as stepPlayerHealth } from '../systems/playerHealth.js'
import { step as stepAfk } from '../systems/afk.js'
import { step as stepHexPowerPad } from '../systems/hexPowerPad.js'
import { step as stepGlowFloorPanel } from '../systems/glowFloorPanel.js'
import { step as stepTreadmillAnim } from '../systems/treadmillAnim.js'
import { step as stepSpeedGain } from '../systems/speedGain.js'
import { step as stepHammer } from '../systems/hammerAnim.js'
import { step as stepHammerCrush } from '../systems/hammerCrush.js'
import { step as stepCrusherAnim } from '../systems/crusherAnim.js'
import { step as stepCrusherCrush } from '../systems/crusherCrush.js'
import { step as stepMerchant } from '../systems/merchant.js'
import { step as stepTeleportGate } from '../systems/teleportGate.js'
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
    // Advance Ground.026's solid/fade/hidden loop before player movement
    // reads groundPhase.collidable this frame, so the player's own
    // collision this tick matches whatever state was just set.
    stepGroundPhase(dt)
    step(dt)
    stepGiantBall(dt)
    stepGiantBallCrush()
    stepSahurFollow(dt)
    stepSahurCrush()
    updateCamera(camera, dt)
    // Project the player to the screen and age live popups before
    // stepSpeedGain/stepAction below can spawn new ones this frame.
    stepActionPopups(dt, camera)
    // Walking-based Speed gain — every WALK_GAIN_INTERVAL seconds of
    // unbroken movement input.
    stepSpeedGain(dt)
    stepAfk()
    stepHexPowerPad()
    stepGlowFloorPanel()
    stepTreadmillAnim(dt)
    stepHammer(dt)
    stepHammerCrush()
    stepCrusherAnim(dt)
    stepCrusherCrush()
    stepMerchant()
    // Stage-select HUD panel's own proximity flag — a plain click target,
    // not one of the hold-to-confirm zones stepInteract resolves below.
    stepTeleportGate()
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
