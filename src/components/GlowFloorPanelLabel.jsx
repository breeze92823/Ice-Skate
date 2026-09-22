import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { GLOW_FLOOR_PANEL_TOP_Y, GLOW_FLOOR_PANEL_SCALE } from '../data/glowFloorPanel.js'

// Ported from Laser-Escape's GlowFloorPanelLabel.jsx, minus its "Return"
// caption — that referred to Laser-Escape's run-reset-on-contact behavior,
// which this project's panel doesn't have (see systems/glowFloorPanel.js).
// Laser-Escape hard-coded LABEL_HEIGHT to 3.5, floating the label well above
// its panel; here it's derived from the panel's own scaled height so the
// cup sits directly above the glowing model instead of disconnected from it.
const CUP_URL = '/ui/xp_cup.png'
const CUP_SIZE = 0.95 // metres (xp_cup.png is 64x64, square)
const PANEL_TOP_HEIGHT = GLOW_FLOOR_PANEL_TOP_Y * GLOW_FLOOR_PANEL_SCALE // real-world height of the panel's glowing top face above its base
const PANEL_CLEARANCE = 0.45 // gap between the panel's top face and the bottom of the floating cup
const CUP_TEXT_GAP = 0.95 // vertical offset from the Text's center down to the cup
const LABEL_HEIGHT = PANEL_TOP_HEIGHT + PANEL_CLEARANCE + CUP_TEXT_GAP + CUP_SIZE / 2 // metres above the panel's placement position, at the Text's own center

// One shared texture for every label — a single 64x64 PNG, loaded once and
// kept for the session (no per-instance GPU allocation, no re-download).
let cupTexture
function getCupTexture() {
  if (!cupTexture) {
    cupTexture = new THREE.TextureLoader().load(CUP_URL)
    cupTexture.colorSpace = THREE.SRGBColorSpace
    cupTexture.anisotropy = 4
  }
  return cupTexture
}

// Gentle idle float: a few detuned sine waves per axis, each sign seeded with
// its own phase/frequency so multiple cups (if ever more than one) drift
// independently and never look synced.
function FloatingCup({ position }) {
  const cup = useMemo(getCupTexture, [])
  const ref = useRef()
  const s = useRef({
    t: Math.random() * 100, // random phase offset
    sway: 0.45 + Math.random() * 0.35, // horizontal drift speed
    bob: 0.65 + Math.random() * 0.4, // vertical bob speed
    tilt: 0.3 + Math.random() * 0.3, // rock speed
  }).current

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    s.t += delta
    mesh.position.x =
      position[0] + Math.sin(s.t * s.sway) * 0.11 + Math.sin(s.t * s.sway * 2.7) * 0.03
    mesh.position.y =
      position[1] + Math.sin(s.t * s.bob) * 0.09 + Math.sin(s.t * s.bob * 2.3) * 0.03
    mesh.rotation.z = Math.sin(s.t * s.tilt) * 0.14
  })

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[CUP_SIZE, CUP_SIZE]} />
      <meshBasicMaterial map={cup} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

// In-world signage over the glow_floor_panel: the flat Wins it grants on
// contact (data/glowFloorPanel.js's GLOW_FLOOR_PANEL_WINS) in big yellow,
// black-outlined text, with the xp_cup icon floating beneath. Billboarded so
// it reads from any approach.
export default function GlowFloorPanelLabel({ position, wins }) {
  return (
    <Billboard position={[position[0], position[1] + LABEL_HEIGHT, position[2]]}>
      <Text
        fontSize={0.9}
        fontWeight="bold"
        letterSpacing={-0.02}
        color="#ffd21e"
        outlineWidth={0.09}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {`+${wins} Wins`}
      </Text>
      <FloatingCup position={[0, -CUP_TEXT_GAP, 0]} />
    </Billboard>
  )
}
