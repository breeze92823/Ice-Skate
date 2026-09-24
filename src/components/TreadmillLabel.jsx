import { Billboard, Text } from '@react-three/drei'
import { useGameStore } from '../store/useGameStore.js'

// Same in-world signage approach as GlowFloorPanelLabel.jsx: big bold
// outlined text, billboarded so it reads from any approach. No floating
// icon here (that's specific to the glow panel's Wins pickup) — just the
// speed-multiplier caption, floating above the console/handlebar so it
// clears TreadmillProp.jsx's own geometry. `value`/`color` come from
// data/treadmill.js's TREADMILLS (via Treadmills.jsx), same as
// GlowFloorPanelLabel's per-panel wins count.
const LABEL_HEIGHT = 4.5 // metres above the treadmill's placement position
const LOCKED_LINE_GAP = 1.05

// Below `rebirthRequired`, a second line calls out the requirement — same
// "M Wins Required" warning-color convention as SkateRackLabel.jsx, but
// gating a deck the player can already walk onto rather than a purchase, so
// systems/treadmillAnim.js also refuses to mark it occupied (no belt scroll,
// no forced walk gait, no treadmill-walking Speed gain) until it's met.
const LOCKED_COLOR = '#ffd21e'

export default function TreadmillLabel({ position, value, color, rebirthRequired }) {
  const rebirth = useGameStore((s) => s.rebirth)
  const locked = rebirth < rebirthRequired

  return (
    <Billboard position={[position[0], position[1] + LABEL_HEIGHT, position[2]]}>
      <Text
        position={[0, locked ? LOCKED_LINE_GAP / 2 : 0, 0]}
        fontSize={0.9}
        fontWeight="bold"
        letterSpacing={-0.02}
        color={color}
        outlineWidth={0.09}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {`X${value} Speed`}
      </Text>
      {locked && (
        <Text
          position={[0, -LOCKED_LINE_GAP / 2, 0]}
          fontSize={0.45}
          fontWeight="bold"
          letterSpacing={-0.02}
          color={LOCKED_COLOR}
          outlineWidth={0.05}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {`Required Rebirth ${rebirthRequired}`}
        </Text>
      )}
    </Billboard>
  )
}
