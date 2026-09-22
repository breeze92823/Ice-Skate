// Teleport-gate proximity + the actual stage jump. Unlike afk/hexPad/
// merchant's "hold E to confirm" actions, picking a stage is a plain click
// on the HUD list (components/hud/TeleportPanel.jsx) that appears the moment
// the player is near the gate — there's nothing to accidentally trigger that
// a confirm-hold needs to guard against, so this skips systems/interact.js
// and systems/interactHold.js entirely.
import { player, resetPlayer } from './playerState.js'
import { TELEPORT_GATES, TELEPORT_GATE_RANGE } from '../data/teleportGate.js'

export const teleportGateState = {
  near: false, // within TELEPORT_GATE_RANGE (horizontal) of the gate this frame
}

export function step() {
  const gate = TELEPORT_GATES[0]
  if (!gate) {
    teleportGateState.near = false
    return
  }
  const p = player.position
  const dx = p.x - gate.position[0]
  const dz = p.z - gate.position[2]
  teleportGateState.near = dx * dx + dz * dz <= TELEPORT_GATE_RANGE * TELEPORT_GATE_RANGE
}

// components/GameLoop.jsx's cameraOrbit.update() detects any same-frame
// player jump bigger than its own TELEPORT_DISTANCE and snaps the camera
// behind the new facing instead of swooping into it, so a stage teleport
// gets that for free — nothing extra to do here for the camera.
export function teleportToStage(stage) {
  if (!stage) return
  resetPlayer(stage.spawn)
}
