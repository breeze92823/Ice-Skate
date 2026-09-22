import { MATERIAL_PBR } from '../data/materials.js'
import { WATER_Y } from '../data/hub.js'

// The original ground plane, now the water surface beneath/around
// Ground.jsx's smaller elevated island. Walking off the island and falling
// to this height drowns the player (see systems/playerMovement.js).
const WATER_WIDTH = 140
const WATER_DEPTH = 160

export default function Water() {
  return (
    <mesh position-y={WATER_Y} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[WATER_WIDTH, WATER_DEPTH]} />
      <meshStandardMaterial color="#1f6fb2" {...MATERIAL_PBR.WATER} />
    </mesh>
  )
}
