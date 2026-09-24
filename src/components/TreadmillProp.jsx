import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { makeBeltTexture } from '../systems/beltTexture.js'
import { TREADMILL_SHAPE } from '../data/treadmill.js'
import { treadmillAnim } from '../systems/treadmillAnim.js'

// One treadmill instance in the row (Treadmills.jsx maps data/treadmill.js's
// TREADMILLS over this) — a flush deck with raised side rails and a pair of
// leaning console arms at the front (handlebar + tilted display), styled
// after a household treadmill rather than a gym unit. Every instance shares
// this geometry; only its placement, belt-scroll key and material colors
// (frameLight/frameDark for the rails, armColor for the console) differ.
const FRAME_CELL = 0.4 // metres per block module

// Structural dimensions come from data/treadmill.js's TREADMILL_SHAPE,
// shared with systems/treadmillAnim.js's "is the player on this deck" test
// and systems/treadmillCollision.js's rail/deck colliders — a single source
// so collision and the belt-scroll trigger always match the exact shape
// drawn here.
const {
  deckWidth: DECK_WIDTH,
  deckDepth: DECK_DEPTH,
  beltHeight: BELT_HEIGHT,
  railThick: RAIL_THICK,
  railTopY: RAIL_TOP_Y,
} = TREADMILL_SHAPE
const RAIL_LENGTH = DECK_DEPTH

const ARM_WIDTH = 0.12
const ARM_LENGTH = 1.35
const ARM_LEAN = -0.22 // radians, sweeps the console arms forward over open air
const ARM_X = DECK_WIDTH / 2 + RAIL_THICK / 2
const ARM_BASE_Z = -(DECK_DEPTH / 2) // console end

const HANDLEBAR_LENGTH = ARM_X * 2 + ARM_WIDTH
const HANDLEBAR_THICK = 0.1

const CONSOLE_W = 0.62
const CONSOLE_H = 0.4
const CONSOLE_THICK = 0.05
const CONSOLE_TILT = 0.35 // radians, angles the display face up toward the runner

// Sized clone of the shared stud texture for one box's dominant face, so
// block scale stays consistent (FRAME_CELL metres/block) across parts of
// very different sizes. Colors are per-instance (frameLight/frameDark), so
// each treadmill in the row builds and disposes its own texture.
function useStudTexture(faceWidth, faceHeight, frameLight, frameDark) {
  const texture = useMemo(
    () =>
      makeStudTexture({
        light: frameLight,
        dark: frameDark,
        studsPerCell: 1,
        repeatX: faceWidth / (FRAME_CELL * 2),
        repeatY: faceHeight / (FRAME_CELL * 2),
      }),
    [faceWidth, faceHeight, frameLight, frameDark]
  )
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function TreadmillProp({ name, position, rotationY, scale = 1, frameLight, frameDark, armColor }) {
  const railTex = useStudTexture(RAIL_LENGTH, RAIL_TOP_Y, frameLight, frameDark)

  const beltTexture = useMemo(
    () => makeBeltTexture({ width: DECK_WIDTH, depth: DECK_DEPTH }),
    []
  )
  useEffect(() => () => beltTexture.dispose(), [beltTexture])

  // Scrolls the belt texture along its own depth while the player is
  // standing on this deck (systems/treadmillAnim.js, keyed by `name`) — no
  // React subscription, same read-a-mutable-singleton-in-useFrame convention
  // as GroundBlocks.jsx reading groundPhase.opacity.
  useFrame(() => {
    beltTexture.offset.y = treadmillAnim.get(name).offset
  })

  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      {/* Belt / deck */}
      <mesh position={[0, BELT_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[DECK_WIDTH, BELT_HEIGHT, DECK_DEPTH]} />
        <meshStandardMaterial map={beltTexture} {...MATERIAL_PBR.TREADMILL_BELT} />
      </mesh>

      {/* Raised side rails, running the full length of the deck */}
      {[-1, 1].map((sign) => (
        <mesh
          key={sign}
          position={[sign * (DECK_WIDTH / 2 + RAIL_THICK / 2), RAIL_TOP_Y / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[RAIL_THICK, RAIL_TOP_Y, RAIL_LENGTH]} />
          <meshStandardMaterial map={railTex} {...MATERIAL_PBR.TREADMILL_FRAME} />
        </mesh>
      ))}

      {/* Console arms, handlebar and tilted display, leaning over the console end */}
      <group position={[0, RAIL_TOP_Y, ARM_BASE_Z]} rotation-x={ARM_LEAN}>
        {[-ARM_X, ARM_X].map((x) => (
          <mesh key={x} position={[x, ARM_LENGTH / 2, 0]} castShadow>
            <boxGeometry args={[ARM_WIDTH, ARM_LENGTH, ARM_WIDTH]} />
            <meshStandardMaterial color={armColor} {...MATERIAL_PBR.TREADMILL_FRAME} />
          </mesh>
        ))}
        <mesh position={[0, ARM_LENGTH, 0]} castShadow>
          <boxGeometry args={[HANDLEBAR_LENGTH, HANDLEBAR_THICK, HANDLEBAR_THICK]} />
          <meshStandardMaterial color={armColor} {...MATERIAL_PBR.TREADMILL_FRAME} />
        </mesh>
        <group
          position={[0, ARM_LENGTH - CONSOLE_H / 2 - 0.05, HANDLEBAR_THICK / 2 + CONSOLE_THICK / 2 + 0.01]}
          rotation-x={CONSOLE_TILT}
        >
          <mesh castShadow>
            <boxGeometry args={[CONSOLE_W, CONSOLE_H, CONSOLE_THICK]} />
            <meshStandardMaterial color="#23262c" {...MATERIAL_PBR.TREADMILL_SCREEN_BEZEL} />
          </mesh>
          {/* Faces +Z, back toward the runner on the belt. */}
          <mesh position={[0, 0, CONSOLE_THICK / 2 + 0.005]}>
            <planeGeometry args={[CONSOLE_W * 0.82, CONSOLE_H * 0.78]} />
            <meshStandardMaterial color="#d7e0ea" side={DoubleSide} {...MATERIAL_PBR.TREADMILL_SCREEN_FACE} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
