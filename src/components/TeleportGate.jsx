import { DoubleSide } from 'three'
import { TELEPORT_GATES } from '../data/teleportGate.js'

// Unlit glow, not a bloom pass — see CLAUDE.md's lighting section. DoubleSide
// so the portal reads from whichever side the player approaches from.
const GATE_COLOR = '#2f8fff'

export default function TeleportGate() {
  return (
    <>
      {TELEPORT_GATES.map(({ name, position, rotationY, size }) => (
        <mesh key={name} position={position} rotation-y={rotationY}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial color={GATE_COLOR} side={DoubleSide} />
        </mesh>
      ))}
    </>
  )
}
