import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MATERIAL_PBR } from '../data/materials.js'
import { SKATE_RACK_SHAPE, skateRackColX, skateRackRowTopY, skateRackRowZ } from '../data/skateRack.js'
import { FIRE_EFFECT_TIER_INDEX } from '../data/skateFireEffect.js'
import { SingleSkate } from './IceSkateShoes.jsx'
import SkateFireEffect from './SkateFireEffect.jsx'
import { useGameStore } from '../store/useGameStore.js'

// One pickup on the bench: a pad plus a single IceSkateShoes.jsx skate
// standing on it, boot upper tinted per-tier via itemColor (same building
// block the ground-decor pair near spawn uses, reused here instead of a
// second skate model), spinning in place about its own Y axis as a display
// flourish. An optional flat glow disc fakes the tier's own rare-item
// sparkle (unrelated to owned/equipped). Owned/equipped state comes from the
// store via `index` (see data/hexPowerPad.js/systems/hexPowerPad.js): the
// pad itself is the status readout — red = not bought, white = bought, green
// = equipped (must be bought first) — same "equipped" green Laser-Escape's
// hex power pads use, so no separate padColor is authored in data anymore.
const { padWidth: PAD_W, padDepth: PAD_D, padHeight: PAD_H, itemRadius: ITEM_R } = SKATE_RACK_SHAPE
const ITEM_SCALE = 0.425 // half of the previous 0.85, so it doesn't crowd the pad's edges
const SPIN_SPEED = 1.5 // radians/sec around local Y
const PAD_LOCKED_COLOR = '#e8484f' // red — not bought
const PAD_OWNED_COLOR = '#e9edf1' // white — bought, not equipped
const PAD_EQUIPPED_COLOR = '#5fe37a' // green — equipped

export default function SkateRackItem({ index, row, col, itemColor, glow }) {
  const owned = useGameStore((s) => s.ownedHexPads.has(index))
  const equipped = useGameStore((s) => s.equippedHexPad === index)
  const padColor = equipped ? PAD_EQUIPPED_COLOR : owned ? PAD_OWNED_COLOR : PAD_LOCKED_COLOR
  const x = skateRackColX(col)
  const z = skateRackRowZ(row)
  const topY = skateRackRowTopY(row)
  const padTopY = topY + PAD_H
  const spinRef = useRef(null)

  useFrame((_state, delta) => {
    const g = spinRef.current
    if (!g) return
    g.rotation.y += SPIN_SPEED * delta
  })

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, topY + PAD_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PAD_W, PAD_H, PAD_D]} />
        <meshStandardMaterial color={padColor} {...MATERIAL_PBR.SKATE_RACK_PAD} />
      </mesh>

      {glow && (
        <mesh position={[0, padTopY + 0.01, 0]} rotation-x={-Math.PI / 2} castShadow={false}>
          <circleGeometry args={[ITEM_R * 1.6, 32]} />
          <meshBasicMaterial color={glow} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      {equipped && (
        <mesh position={[0, padTopY + 0.012, 0]} rotation-x={-Math.PI / 2} castShadow={false}>
          <ringGeometry args={[ITEM_R * 1.3, ITEM_R * 1.55, 32]} />
          <meshBasicMaterial color={PAD_EQUIPPED_COLOR} toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      <group ref={spinRef} position={[0, padTopY, 0]} scale={ITEM_SCALE}>
        <SingleSkate bootColor={itemColor} />
      </group>

      {index === FIRE_EFFECT_TIER_INDEX && (
        <group position={[0, padTopY, 0]}>
          <SkateFireEffect />
        </group>
      )}
    </group>
  )
}
