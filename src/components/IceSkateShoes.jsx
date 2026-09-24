import { MATERIAL_PBR } from '../data/materials.js'
import {
  ICE_SKATE_POSITION,
  ICE_SKATE_ROTATION_Y,
  ICE_SKATE_PAIR_GAP,
  ICE_SKATE_SHAPE,
  ICE_SKATE_COLORS,
} from '../data/iceSkate.js'

// A pair of ice skates sitting on the hub ground near spawn — plain
// decorative prop, built from a handful of boxes (blade, sole, toe box,
// ankle cuff, lace strip) per this project's Bloxity-block convention. No
// collision, just set dressing.
const {
  bladeWidth,
  bladeHeight,
  bladeLength,
  bladeY,
  soleWidth,
  soleHeight,
  soleLength,
  toeWidth,
  toeHeight,
  toeLength,
  toeZOffset,
  cuffWidth,
  cuffHeight,
  cuffLength,
  cuffZOffset,
  laceWidth,
  laceHeight,
  laceLength,
  laceZOffset,
  laceClearance,
} = ICE_SKATE_SHAPE

const soleY = bladeY + bladeHeight / 2 + soleHeight / 2
const toeY = soleY + soleHeight / 2 + toeHeight / 2
const cuffY = soleY + soleHeight / 2 + cuffHeight / 2
const laceY = toeY + toeHeight / 2 + laceHeight / 2 + laceClearance

// Exported so other props needing a single skate (not the ground-decor pair
// below) can reuse the same build — e.g. SkateRackItem.jsx's pickups, which
// tint the boot upper per-tier instead of the fixed ICE_SKATE_COLORS.boot.
export function SingleSkate({ x = 0, bootColor = ICE_SKATE_COLORS.boot }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, bladeY, 0]} castShadow receiveShadow>
        <boxGeometry args={[bladeWidth, bladeHeight, bladeLength]} />
        <meshStandardMaterial color={ICE_SKATE_COLORS.blade} {...MATERIAL_PBR.ICE_SKATE_BLADE} />
      </mesh>

      <mesh position={[0, soleY, 0]} castShadow receiveShadow>
        <boxGeometry args={[soleWidth, soleHeight, soleLength]} />
        <meshStandardMaterial color={ICE_SKATE_COLORS.sole} {...MATERIAL_PBR.ICE_SKATE_SOLE} />
      </mesh>

      <mesh position={[0, toeY, toeZOffset]} castShadow receiveShadow>
        <boxGeometry args={[toeWidth, toeHeight, toeLength]} />
        <meshStandardMaterial color={bootColor} {...MATERIAL_PBR.ICE_SKATE_BOOT} />
      </mesh>

      <mesh position={[0, cuffY, cuffZOffset]} castShadow receiveShadow>
        <boxGeometry args={[cuffWidth, cuffHeight, cuffLength]} />
        <meshStandardMaterial color={bootColor} {...MATERIAL_PBR.ICE_SKATE_BOOT} />
      </mesh>

      <mesh position={[0, laceY, laceZOffset]} castShadow receiveShadow>
        <boxGeometry args={[laceWidth, laceHeight, laceLength]} />
        <meshStandardMaterial color={ICE_SKATE_COLORS.lace} {...MATERIAL_PBR.ICE_SKATE_LACE} />
      </mesh>
    </group>
  )
}

export default function IceSkateShoes() {
  return (
    <group position={ICE_SKATE_POSITION} rotation-y={ICE_SKATE_ROTATION_Y}>
      <SingleSkate x={-ICE_SKATE_PAIR_GAP / 2} />
      <SingleSkate x={ICE_SKATE_PAIR_GAP / 2} />
    </group>
  )
}
