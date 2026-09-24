import { Billboard, Text } from '@react-three/drei'
import { useGameStore } from '../store/useGameStore.js'
import { formatShort } from '../data/format.js'

// Floating caption over each tier: "+N Speed" plus the tier's real buy/equip
// state — "M Wins Required" (not owned), "Owned" (owned, not equipped) or
// "Equipped" — read live from the store via `index` (this tier's index into
// ownedHexPads/equippedHexPad, see data/hexPowerPad.js) instead of a static
// prop, same reference mock layout otherwise. Same billboard-text approach
// as TreadmillLabel.jsx/GlowFloorPanelLabel.jsx.
const VALUE_HEIGHT = 0.85 // metres above the pad's top face, at the value line
const LINE_GAP = 0.32

export default function SkateRackLabel({ position, speed, winsRequired, index }) {
  const owned = useGameStore((s) => s.ownedHexPads.has(index))
  const equipped = useGameStore((s) => s.equippedHexPad === index)

  const statusText = equipped ? 'Equipped' : owned ? 'Owned' : `${formatShort(winsRequired)} Wins Required`
  const statusColor = equipped ? '#5fe37a' : owned ? '#ffffff' : '#ffd21e'

  return (
    <Billboard position={[position[0], position[1] + VALUE_HEIGHT, position[2]]}>
      <Text
        position={[0, LINE_GAP, 0]}
        fontSize={0.32}
        fontWeight="bold"
        letterSpacing={-0.02}
        color="#ffffff"
        outlineWidth={0.035}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {`+${formatShort(speed)} Speed`}
      </Text>
      <Text
        position={[0, -LINE_GAP, 0]}
        fontSize={0.2}
        fontWeight="bold"
        letterSpacing={-0.02}
        color={statusColor}
        outlineWidth={0.025}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {statusText}
      </Text>
    </Billboard>
  )
}
