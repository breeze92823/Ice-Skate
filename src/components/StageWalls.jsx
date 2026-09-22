import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { STAGE_WALLS } from '../data/stageWalls.js'

// Stage-transition glass walls — see data/stageWalls.js for the Blender
// sync. Purely visual markers between stages: ~80% transparent so the
// player can see and skate straight through, and deliberately never added
// to playerMovement.js's collision (unlike SideWalls). castShadow is off
// per the thin/transparent-panel rule in CLAUDE.md — a hard rectangular
// shadow would look wrong cast from glass this see-through; receiveShadow
// stays on so the key light still reads across each panel.
const GLASS_COLOR = '#bfe6ff'
const GLASS_OPACITY = 0.7

// Each wall's "Stage {n}" caption, from that wall's own `stage` number
// (data/stageWalls.js). Deliberately NOT a Billboard (drei's camera-facing
// wrapper, used by GlowFloorPanelLabel.jsx) — a Billboard re-orients every
// frame to face the camera, which reads as the text constantly turning as
// the player moves. This is a static sign instead, nested in the same
// <group> as its glass panel so it inherits the panel's position/rotationY
// and never rotates on its own. It's offset LABEL_FORWARD_OFFSET out along
// the panel's own local -Z (the back face, the side the player approaches
// from on the way into the stage) rather than centered on it — sitting
// exactly on the panel's center plane put the text inside the box's solid
// volume, where the box's own nearer face depth-occluded it. The extra
// Math.PI yaw flips the text to face back along -Z so it reads correctly
// (not mirrored) from that approach side, instead of the +Z side, which
// only became visible after already passing through the panel.
//
// Bold, rounded "bubble letter" display font (matches the reference image) —
// hosted as a fixed .woff via the @fontsource CDN build, same font-loading
// approach troika-three-text expects for its `font` prop (a font file URL,
// not a CSS @font-face rule). Deliberately the classic .woff, not .woff2 —
// troika's bundled parser (opentype.js) throws "woff2 fonts not supported"
// at runtime, since woff2's brotli compression needs a decoder opentype.js
// doesn't ship; plain .woff is zlib-compressed sfnt, which it parses fine.
// It ships one weight only, so there's no fontWeight prop to pair it with.
// Shared by both captions below so they read as one sign.
const LABEL_FONT_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/fredoka-one/files/fredoka-one-latin-400-normal.woff'
const LABEL_FONT_SIZE = 2.4
const LABEL_COLOR = '#d5d5d5' // light silver, per reference image
const LABEL_OUTLINE_WIDTH = 0.08
const LABEL_OUTLINE_COLOR = '#000000'
const LABEL_FORWARD_OFFSET = 0.15 // metres clear of the panel's back face

// "Recommended Level: {n}" caption, stacked above the "Stage {n}" one from
// each wall's own `recommendedLevel` (data/stageWalls.js — currently
// placeholder filler numbers, not real difficulty figures yet). Same font
// and facing/offset convention as the Stage caption, just smaller and in a
// contrasting blue so the two captions read as separate lines rather than
// one run-on sentence.
const LEVEL_LABEL_FONT_SIZE = 1.15
const LEVEL_LABEL_COLOR = '#3fa9f5'
const LEVEL_LABEL_OUTLINE_WIDTH = 0.05
const LEVEL_LABEL_OUTLINE_COLOR = '#0a2a55'
const LEVEL_LABEL_Y_OFFSET = 3.1 // metres above the Stage caption's center

export default function StageWalls() {
  return (
    <>
      {STAGE_WALLS.map(({ name, position, size, rotationY = 0, stage, recommendedLevel }) => (
        <group key={name} position={position} rotation={[0, rotationY, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={GLASS_COLOR} transparent opacity={GLASS_OPACITY} {...MATERIAL_PBR.STAGE_WALL} />
          </mesh>
          <Text
            position={[0, 0, -(size[2] / 2 + LABEL_FORWARD_OFFSET)]}
            rotation={[0, Math.PI, 0]}
            font={LABEL_FONT_URL}
            fontSize={LABEL_FONT_SIZE}
            color={LABEL_COLOR}
            outlineWidth={LABEL_OUTLINE_WIDTH}
            outlineColor={LABEL_OUTLINE_COLOR}
            anchorX="center"
            anchorY="middle"
          >
            {`Stage ${stage}`}
          </Text>
          <Text
            position={[0, LEVEL_LABEL_Y_OFFSET, -(size[2] / 2 + LABEL_FORWARD_OFFSET)]}
            rotation={[0, Math.PI, 0]}
            font={LABEL_FONT_URL}
            fontSize={LEVEL_LABEL_FONT_SIZE}
            color={LEVEL_LABEL_COLOR}
            outlineWidth={LEVEL_LABEL_OUTLINE_WIDTH}
            outlineColor={LEVEL_LABEL_OUTLINE_COLOR}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            lineHeight={1.15}
          >
            {`Recommended\nLevel: ${recommendedLevel}`}
          </Text>
        </group>
      ))}
    </>
  )
}
