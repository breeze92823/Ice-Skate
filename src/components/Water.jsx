import { MATERIAL_PBR } from '../data/materials.js'
import { WATER_Y } from '../data/hub.js'

// The original ground plane, now the water surface beneath/around
// Ground.jsx's smaller elevated island. Walking off the island — or off any
// stage's GroundBlocks, all the way out to Stage13 — and falling to this
// height drowns the player (see systems/playerMovement.js). Sized/offset to
// span every stage's footprint (not just the hub island) so there's always
// a visible water surface below wherever a player can fall, rather than
// void: bounds taken from data/groundBlocks.js's GROUND_BLOCKS, whose
// world-space extent runs roughly x=[-873, 70], z=[-75, 1047] (Stage13's
// Ground.058/.059 are the westmost blocks, Stage11's Ground.057 the
// northmost) — padded out to round numbers with margin on every side.
const WATER_WIDTH = 1000 // x
const WATER_DEPTH = 1200 // z
const WATER_X = -400
const WATER_Z = 500

export default function Water() {
  return (
    <mesh position={[WATER_X, WATER_Y, WATER_Z]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[WATER_WIDTH, WATER_DEPTH]} />
      <meshStandardMaterial color="#1f6fb2" {...MATERIAL_PBR.WATER} />
    </mesh>
  )
}
