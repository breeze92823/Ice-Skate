import { MATERIAL_PBR } from '../data/materials.js'
import { SKATE_RACK_SHAPE, skateRackRowTopY, skateRackRowZ, skateRackRowWidth } from '../data/skateRack.js'

// The bench itself: row 0 is ground level (no box — SkateRackItem.jsx's pads
// just sit on the floor), row 1 is a riser box spanning the full row width
// behind it. SkateRackItem.jsx places the pads/skates on top of whichever
// surface applies.
const RISER_COLOR = '#6b7480'
const ROW_WIDTH = skateRackRowWidth()
const { rowDepth: ROW_DEPTH } = SKATE_RACK_SHAPE

export default function SkateRackRisers() {
  return (
    <>
      {[0, 1].map((row) => {
        const topY = skateRackRowTopY(row)
        if (topY <= 0) return null
        return (
          <mesh key={row} position={[0, topY / 2, skateRackRowZ(row)]} castShadow receiveShadow>
            <boxGeometry args={[ROW_WIDTH, topY, ROW_DEPTH]} />
            <meshStandardMaterial color={RISER_COLOR} {...MATERIAL_PBR.SKATE_RACK_RISER} />
          </mesh>
        )
      })}
    </>
  )
}
