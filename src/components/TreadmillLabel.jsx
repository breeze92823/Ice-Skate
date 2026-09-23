import { Billboard, Text } from '@react-three/drei'

// Same in-world signage approach as GlowFloorPanelLabel.jsx: big bold
// outlined text, billboarded so it reads from any approach. No floating
// icon here (that's specific to the glow panel's Wins pickup) — just the
// speed-multiplier caption, floating above the console/handlebar so it
// clears TreadmillProp.jsx's own geometry. `value`/`color` come from
// data/treadmill.js's TREADMILLS (via Treadmills.jsx), same as
// GlowFloorPanelLabel's per-panel wins count.
const LABEL_HEIGHT = 4 // metres above the treadmill's placement position

export default function TreadmillLabel({ position, value, color }) {
  return (
    <Billboard position={[position[0], position[1] + LABEL_HEIGHT, position[2]]}>
      <Text
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
    </Billboard>
  )
}
