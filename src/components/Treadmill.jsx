import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { makeBeltTexture } from '../systems/beltTexture.js'
import { TREADMILL_POSITION, TREADMILL_ROTATION_Y } from '../data/hub.js'

// Studded stone/steel frame, matching Ground's Bloxity-block look but a
// couple shades lighter so the prop reads as a distinct structure against
// the darker floor instead of blending into it.
const FRAME_LIGHT = '#8f97a6'
const FRAME_DARK = '#666f7e'
const FRAME_CELL = 0.4 // metres per block module

const DECK_WIDTH = 3.2 // X, across the belt
const DECK_DEPTH = 4.8 // Z, front (steps) to back (pillars)
const WALL_THICK = 0.4
const WALL_HEIGHT = 0.55
const BELT_RECESS = 0.08 // belt top sits this far below the wall top

const OUTER_WIDTH = DECK_WIDTH + WALL_THICK * 2
const OUTER_DEPTH = DECK_DEPTH + WALL_THICK * 2

const STEP_COUNT = 2
const STEP_DEPTH = 0.5
const STEP_HEIGHT = WALL_HEIGHT / STEP_COUNT

const PILLAR_SIZE = 0.55
const PILLAR_HEIGHT = 2.1 // above the wall top
const PILLAR_TOTAL_HEIGHT = WALL_HEIGHT + PILLAR_HEIGHT
const PILLAR_X = DECK_WIDTH / 2 + WALL_THICK / 2
const PILLAR_Z = DECK_DEPTH / 2 + WALL_THICK / 2

const BEAM_HEIGHT = 0.45
// Measured from Blender's Treadmill_Beam, not derived — the beam sits between
// the pillars rather than spanning across their outer faces.
const BEAM_LENGTH = 3.1
const BEAM_DEPTH = 0.53

const POLE_LEAN = -0.38 // radians, tilts the screen stalk toward the deck
const POLE_LENGTH = 0.62
// Small extra tilt on top of the pole's own lean — the pole lean alone
// already angles the screen forward-and-down; this just adds a touch more.
const SCREEN_TILT = -0.12
const SCREEN_W = 0.7
const SCREEN_H = 0.46
const SCREEN_THICK = 0.06
// Small mount offset off the pole tip (from Blender's Treadmill_Screen), so
// the screen clears the pole instead of clipping through it.
const SCREEN_MOUNT_OFFSET_Y = 0.013
const SCREEN_MOUNT_OFFSET_Z = 0.058

// Sized clone of the shared stud texture for one box's dominant face, so
// block scale stays consistent (FRAME_CELL metres/block) across parts of
// very different sizes.
function useStudTexture(faceWidth, faceHeight) {
  const texture = useMemo(
    () =>
      makeStudTexture({
        light: FRAME_LIGHT,
        dark: FRAME_DARK,
        studsPerCell: 1,
        repeatX: faceWidth / (FRAME_CELL * 2),
        repeatY: faceHeight / (FRAME_CELL * 2),
      }),
    [faceWidth, faceHeight]
  )
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function Treadmill() {
  const wallFrontBackTex = useStudTexture(OUTER_WIDTH, WALL_HEIGHT)
  const wallSideTex = useStudTexture(OUTER_DEPTH, WALL_HEIGHT)
  const pillarTex = useStudTexture(PILLAR_SIZE, PILLAR_TOTAL_HEIGHT)
  const beamTex = useStudTexture(BEAM_LENGTH, BEAM_HEIGHT)
  const stepTex = useStudTexture(OUTER_WIDTH, STEP_HEIGHT)

  const beltTexture = useMemo(
    () => makeBeltTexture({ width: DECK_WIDTH, depth: DECK_DEPTH }),
    []
  )
  useEffect(() => () => beltTexture.dispose(), [beltTexture])

  const beltHeight = WALL_HEIGHT - BELT_RECESS

  return (
    <group position={TREADMILL_POSITION} rotation-y={TREADMILL_ROTATION_Y}>
      {/* Belt / deck */}
      <mesh position={[0, beltHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[DECK_WIDTH, beltHeight, DECK_DEPTH]} />
        <meshStandardMaterial map={beltTexture} {...MATERIAL_PBR.TREADMILL_BELT} />
      </mesh>

      {/* Border walls */}
      <mesh position={[0, WALL_HEIGHT / 2, -(DECK_DEPTH / 2 + WALL_THICK / 2)]} castShadow receiveShadow>
        <boxGeometry args={[OUTER_WIDTH, WALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial map={wallFrontBackTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, DECK_DEPTH / 2 + WALL_THICK / 2]} castShadow receiveShadow>
        <boxGeometry args={[OUTER_WIDTH, WALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial map={wallFrontBackTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
      </mesh>
      <mesh position={[-(DECK_WIDTH / 2 + WALL_THICK / 2), WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, WALL_HEIGHT, DECK_DEPTH]} />
        <meshStandardMaterial map={wallSideTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
      </mesh>
      <mesh position={[DECK_WIDTH / 2 + WALL_THICK / 2, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, WALL_HEIGHT, DECK_DEPTH]} />
        <meshStandardMaterial map={wallSideTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
      </mesh>

      {/* Entry steps, in front of the front wall */}
      {Array.from({ length: STEP_COUNT }).map((_, i) => {
        const riser = STEP_COUNT - i // 2, 1 — tallest step nearest the wall
        const height = STEP_HEIGHT * riser
        const z = -(DECK_DEPTH / 2 + WALL_THICK + STEP_DEPTH * (i + 0.5))
        return (
          <mesh key={i} position={[0, height / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[OUTER_WIDTH, height, STEP_DEPTH]} />
            <meshStandardMaterial map={stepTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
          </mesh>
        )
      })}

      {/* Back corner pillars */}
      {[-PILLAR_X, PILLAR_X].map((x) => (
        <mesh key={x} position={[x, PILLAR_TOTAL_HEIGHT / 2, PILLAR_Z]} castShadow receiveShadow>
          <boxGeometry args={[PILLAR_SIZE, PILLAR_TOTAL_HEIGHT, PILLAR_SIZE]} />
          <meshStandardMaterial map={pillarTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
        </mesh>
      ))}

      {/* Top crossbeam */}
      <mesh position={[0, PILLAR_TOTAL_HEIGHT - BEAM_HEIGHT / 2, PILLAR_Z]} castShadow receiveShadow>
        <boxGeometry args={[BEAM_LENGTH, BEAM_HEIGHT, BEAM_DEPTH]} />
        <meshStandardMaterial map={beamTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
      </mesh>

      {/* Screen stalk, mounted on the beam and leaning over the deck */}
      <group position={[0, PILLAR_TOTAL_HEIGHT, PILLAR_Z]} rotation-x={POLE_LEAN}>
        <mesh position={[0, POLE_LENGTH / 2, 0]} castShadow>
          <boxGeometry args={[0.12, POLE_LENGTH, 0.12]} />
          <meshStandardMaterial color="#2a2e35" {...MATERIAL_PBR.TREADMILL_SCREEN_BEZEL} />
        </mesh>
        <group
          position={[0, POLE_LENGTH + SCREEN_MOUNT_OFFSET_Y, SCREEN_MOUNT_OFFSET_Z]}
          rotation-x={SCREEN_TILT}
        >
          <mesh castShadow>
            <boxGeometry args={[SCREEN_W, SCREEN_H, SCREEN_THICK]} />
            <meshStandardMaterial color="#23262c" {...MATERIAL_PBR.TREADMILL_SCREEN_BEZEL} />
          </mesh>
          {/* Faces -Z (forward, over the deck) so it looks down at the player. */}
          <mesh position={[0, 0, -(SCREEN_THICK / 2 + 0.005)]} rotation-y={Math.PI}>
            <planeGeometry args={[SCREEN_W * 0.86, SCREEN_H * 0.8]} />
            <meshStandardMaterial color="#dbe3ec" side={DoubleSide} {...MATERIAL_PBR.TREADMILL_SCREEN_FACE} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
