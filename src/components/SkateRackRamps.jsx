import { MATERIAL_PBR } from '../data/materials.js'
import { SKATE_RACK_RAMP, skateRackRampTransform, skateRackRampLegTransform } from '../data/skateRack.js'

// The two ramps flanking the bench (reference mock) — plain inclined panels
// (no side rails; a rail-lined chute reads as a slide, not a ramp), each
// propped up on a couple of support-leg stands since the panel would
// otherwise float above the ground for most of its run. Visual only, same as
// the rest of SkateRack.
const { width: RAMP_W, thick: RAMP_THICK, legSize: LEG_SIZE, legFractions: LEG_FRACTIONS } = SKATE_RACK_RAMP
const RAMP_COLOR = '#6b7480'
const LEG_COLOR = '#565e69'

function Ramp({ side }) {
  const { position, rotationX, length } = skateRackRampTransform(side)

  return (
    <>
      <mesh position={position} rotation-x={rotationX} castShadow receiveShadow>
        <boxGeometry args={[RAMP_W, RAMP_THICK, length]} />
        <meshStandardMaterial color={RAMP_COLOR} {...MATERIAL_PBR.SKATE_RACK_RISER} />
      </mesh>
      {LEG_FRACTIONS.map((fraction) => {
        const { x, z, height } = skateRackRampLegTransform(side, fraction)
        return (
          <mesh key={fraction} position={[x, height / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[LEG_SIZE, height, LEG_SIZE]} />
            <meshStandardMaterial color={LEG_COLOR} {...MATERIAL_PBR.SKATE_RACK_RISER} />
          </mesh>
        )
      })}
    </>
  )
}

export default function SkateRackRamps() {
  return (
    <>
      <Ramp side={-1} />
      <Ramp side={1} />
    </>
  )
}
