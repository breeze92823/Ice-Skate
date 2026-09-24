import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
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
    </>
  )
}
