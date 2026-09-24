import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { SKATE_RACK_SIGN, SKATE_RACK_SCALE, SKATE_RACK_POSITION, skateRackRowTopY } from '../data/skateRack.js'
import {
  HUB_WALLS,
  HUB_ROOF,
  HUB_DOOR_FILL,
  HUB_WALL_BEAMS,
  HUB_WALL_BEAM_TOP,
  HUB_DOOR_LIGHT_STRIPS,
  HUB_WALL_BEAM_LIGHT_STRIPS,
  DOOR_LIGHT_STRIP_COLOR,
  WALL_BEAM_STRIP_COLOR,
} from '../data/hubWalls.js'

// Hub container — see data/hubWalls.js for the full layout. Same studded
// material/colors as components/SideWalls.jsx (MATERIAL_PBR.SIDE_WALL, same
// LIGHT/DARK) so it reads as one continuous wall system with the corridor
// it opens into, driven by the size-keyed material cache pattern
// (components/Stage2Walls.jsx) since west/east/south/both north segments/
// roof are all distinct sizes.
const LIGHT = '#9398a0'
const DARK = '#9398a0'
const CELL = 1 // metres per checker cell, matches SideWalls.jsx
const STUDS_PER_CELL = 4

// "Test" label on HubWallBeam.door.top's own room-facing face — same static
// (non-Billboard) sign convention as components/StageWalls.jsx: text faces
// -Z (toward the player standing in the room, same direction
// HUB_DOOR_LIGHT_STRIPS/HUB_WALL_BEAMS protrude), so it needs the same
// rotation={[0, Math.PI, 0]} flip StageWalls.jsx uses for its captions.
const BEAM_LABEL_TEXT = 'START HERE!'
const BEAM_LABEL_FONT_SIZE = 2
const BEAM_LABEL_COLOR = '#ffffff'
const BEAM_LABEL_OUTLINE_WIDTH = 0.04
const BEAM_LABEL_OUTLINE_COLOR = '#000000'
const BEAM_LABEL_FORWARD_OFFSET = 0.02 // metres clear of the beam's own front face

// "Test" sign mounted on HubWall.south's own room-facing face — a duplicate
// of components/SkateRackSign.jsx's board (backing box + face plate + Text,
// same SKATE_RACK_SIGN dimensions/materials) in place of a bare floating
// Text label, so it reads as a proper mounted sign. Same static
// (non-Billboard) convention as that board and components/StageWalls.jsx.
// Unlike SkateRackSign's group (mesh/face/Text all at local origin/offsets),
// this wall has no natural local origin to nest the board in, so the group's
// own position is derived here instead: the room lies toward +Z from the
// south wall (data/hubWalls.js's SOUTH_BEAMS use faceSign=1, the opposite of
// the north wall's beams), so — like SkateRackSign's board, which also faces
// +Z — no extra yaw is needed, just placing the board's back face
// SOUTH_WALL_SIGN_CLEARANCE clear of the wall's own +Z face. Also scaled by
// SKATE_RACK_SCALE, same as SkateRackSign itself — it's only ever rendered
// nested inside SkateRack.jsx's own `scale={SKATE_RACK_SCALE}` group, so its
// SIGN_W/H/THICK dimensions are local (pre-scale) values; this group applies
// that same scale directly since HubWalls has no such scaled ancestor.
const { width: SOUTH_WALL_SIGN_W, height: SOUTH_WALL_SIGN_H, thick: SOUTH_WALL_SIGN_THICK } = SKATE_RACK_SIGN
const SOUTH_WALL = HUB_WALLS.find((wall) => wall.name === 'HubWall.south')
const SOUTH_WALL_SIGN_TEXT = 'Train'
const SOUTH_WALL_SIGN_CLEARANCE = 0.8 // metres clear of the wall's own room-facing face, incl. 2m requested shift
// Same world Y as SkateRackSign's own board: its group sits at local
// (backTopY + clearance + height/2) inside SkateRack.jsx's own
// position={SKATE_RACK_POSITION} scale={SKATE_RACK_SCALE} group, so that
// local Y has to be scaled and offset the same way here since HubWalls has
// no such scaled ancestor of its own.
const SOUTH_WALL_SIGN_Y =
  SKATE_RACK_POSITION[1] + (skateRackRowTopY(1) + SKATE_RACK_SIGN.clearance + SKATE_RACK_SIGN.height / 2) * SKATE_RACK_SCALE
const SOUTH_WALL_SIGN_Z =
  SOUTH_WALL.position[2] + SOUTH_WALL.size[2] / 2 + SOUTH_WALL_SIGN_CLEARANCE + (SOUTH_WALL_SIGN_THICK * SKATE_RACK_SCALE) / 2

// BoxGeometry's default face order is [+X, -X, +Y, -Y, +Z, -Z].
function buildMaterialsForSize(width, height, depth) {
  const sideTexture = makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: depth / (CELL * 2), repeatY: height / (CELL * 2) })
  const topTexture = makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: width / (CELL * 2), repeatY: depth / (CELL * 2) })
  const endTexture = makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: width / (CELL * 2), repeatY: height / (CELL * 2) })
  const sideMaterial = new MeshStandardMaterial({ map: sideTexture, ...MATERIAL_PBR.SIDE_WALL })
  const topMaterial = new MeshStandardMaterial({ map: topTexture, ...MATERIAL_PBR.SIDE_WALL })
  const endMaterial = new MeshStandardMaterial({ map: endTexture, ...MATERIAL_PBR.SIDE_WALL })
  return {
    materials: [sideMaterial, sideMaterial, topMaterial, topMaterial, endMaterial, endMaterial],
    disposables: [sideTexture, topTexture, endTexture, sideMaterial, topMaterial, endMaterial],
  }
}

export default function HubWalls() {
  const pieces = useMemo(
    () => [...HUB_WALLS, HUB_ROOF, HUB_DOOR_FILL, ...HUB_WALL_BEAMS, HUB_WALL_BEAM_TOP],
    []
  )

  const { materialsByKey, disposables } = useMemo(() => {
    const byKey = new Map()
    const allDisposables = []
    for (const { size } of pieces) {
      const key = size.join('x')
      if (byKey.has(key)) continue
      const built = buildMaterialsForSize(...size)
      byKey.set(key, built.materials)
      allDisposables.push(...built.disposables)
    }
    return { materialsByKey: byKey, disposables: allDisposables }
  }, [pieces])

  // three.js does not GC GPU memory.
  useEffect(() => () => {
    for (const item of disposables) item.dispose()
  }, [disposables])

  return (
    <>
      {pieces.map(({ name, position, size }) => (
        <mesh key={name} position={position} material={materialsByKey.get(size.join('x'))} castShadow receiveShadow>
          <boxGeometry args={size} />
        </mesh>
      ))}
      {/* Door-frame glow trim — unlit, untone-mapped (CLAUDE.md: fake glow
          with an emissive-looking MeshBasicMaterial shape, no bloom pass). */}
      {HUB_DOOR_LIGHT_STRIPS.map(({ name, position, size }) => (
        <mesh key={name} position={position} castShadow={false} receiveShadow={false}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={DOOR_LIGHT_STRIP_COLOR} toneMapped={false} />
        </mesh>
      ))}
      {/* Beam edge glow trim, same treatment as the door-frame strips above. */}
      {HUB_WALL_BEAM_LIGHT_STRIPS.map(({ name, position, size }) => (
        <mesh key={name} position={position} castShadow={false} receiveShadow={false}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={WALL_BEAM_STRIP_COLOR} toneMapped={false} />
        </mesh>
      ))}
      <Text
        position={[
          HUB_WALL_BEAM_TOP.position[0],
          HUB_WALL_BEAM_TOP.position[1],
          HUB_WALL_BEAM_TOP.position[2] - HUB_WALL_BEAM_TOP.size[2] / 2 - BEAM_LABEL_FORWARD_OFFSET,
        ]}
        rotation={[0, Math.PI, 0]}
        fontSize={BEAM_LABEL_FONT_SIZE}
        fontWeight="bold"
        color={BEAM_LABEL_COLOR}
        outlineWidth={BEAM_LABEL_OUTLINE_WIDTH}
        outlineColor={BEAM_LABEL_OUTLINE_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        {BEAM_LABEL_TEXT}
      </Text>
      {/* Duplicate of SkateRackSign's board — backing box + face plate + Text,
          same structure/materials, just mounted on the south wall instead of
          nested behind the skate rack's back row. */}
      <group position={[SOUTH_WALL.position[0], SOUTH_WALL_SIGN_Y, SOUTH_WALL_SIGN_Z]} scale={SKATE_RACK_SCALE}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[SOUTH_WALL_SIGN_W, SOUTH_WALL_SIGN_H, SOUTH_WALL_SIGN_THICK]} />
          <meshStandardMaterial color="#23262c" {...MATERIAL_PBR.SKATE_RACK_SIGN_BEZEL} />
        </mesh>
        <mesh position={[0, 0, SOUTH_WALL_SIGN_THICK / 2 + 0.005]} castShadow={false}>
          <planeGeometry args={[SOUTH_WALL_SIGN_W * 0.92, SOUTH_WALL_SIGN_H * 0.8]} />
          <meshStandardMaterial color="#2fb6e8" {...MATERIAL_PBR.SKATE_RACK_SIGN_FACE} />
        </mesh>
        <Text
          position={[0, 0, SOUTH_WALL_SIGN_THICK / 2 + 0.02]}
          fontSize={0.46}
          fontWeight="bold"
          letterSpacing={0.02}
          color="#ffffff"
          outlineWidth={0.025}
          outlineColor="#0a4a63"
          anchorX="center"
          anchorY="middle"
        >
          {SOUTH_WALL_SIGN_TEXT}
        </Text>
      </group>
    </>
  )
}
