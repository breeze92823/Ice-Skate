import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { SIDE_WALLS, SIDE_WALL_BEAMS } from '../data/sideWalls.js'

// Stage1's boundary guard walls — see data/sideWalls.js for the Blender
// sync. Studded low-poly look, same tile pitch as Ground.jsx (CELL/
// STUDS_PER_CELL), but its own MATERIAL_PBR.SIDE_WALL and LIGHT/DARK below
// so it can be tuned independently of Ground's own material/colors. Each
// wall is a thin (2m) slab with 3 distinct face-size pairs — ±X (the two
// big inward-facing sides, spanning height x depth), ±Y (top/bottom,
// spanning width x depth) and ±Z (the two thin end caps, spanning
// width x height) — each pair gets its own texture sized to its own real
// dimensions. Three.js applies one UV repeat to every face sharing a
// material, so reusing one texture across faces of different real sizes is
// what stretched the top/bottom/end-cap faces before. Both walls share one
// size, so one set of 3 materials covers both.
const LIGHT = '#9398a0'
const DARK = '#9398a0'
const CELL = 1 // metres per checker cell
const STUDS_PER_CELL = 4 // studs per cell, each stud on a CELL/STUDS_PER_CELL = 0.5m pitch

// One face-pair's texture + material, sized to that pair's own real
// dimensions so the stud pitch stays consistent (CELL metres/tile) instead
// of stretching to fit a different pair's aspect ratio.
function useFaceMaterial(repeatX, repeatY) {
  const texture = useMemo(
    () => makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX, repeatY }),
    [repeatX, repeatY]
  )
  const material = useMemo(
    () => new MeshStandardMaterial({ map: texture, ...MATERIAL_PBR.SIDE_WALL }),
    [texture]
  )

  // three.js does not GC GPU memory.
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material]
  )

  return material
}

export default function SideWalls() {
  const [width, height, depth] = SIDE_WALLS[0].size

  const sideMaterial = useFaceMaterial(depth / (CELL * 2), height / (CELL * 2)) // ±X
  const topMaterial = useFaceMaterial(width / (CELL * 2), depth / (CELL * 2)) // ±Y
  const endMaterial = useFaceMaterial(width / (CELL * 2), height / (CELL * 2)) // ±Z

  // BoxGeometry's default face order is [+X, -X, +Y, -Y, +Z, -Z].
  const materials = useMemo(
    () => [sideMaterial, sideMaterial, topMaterial, topMaterial, endMaterial, endMaterial],
    [sideMaterial, topMaterial, endMaterial]
  )

  // Gap-closing beams (SIDE_WALL_BEAMS) are a pilaster shape — wider (it
  // protrudes past the wall's outer face) and shallower than SIDE_WALLS —
  // so `materials` above would stretch the stud tiles across every face.
  // Give them their own repeat set, sized to the beam's own dimensions.
  const [beamWidth, beamHeight, beamDepth] = SIDE_WALL_BEAMS[0].size
  const beamSideMaterial = useFaceMaterial(beamDepth / (CELL * 2), beamHeight / (CELL * 2)) // ±X
  const beamTopMaterial = useFaceMaterial(beamWidth / (CELL * 2), beamDepth / (CELL * 2)) // ±Y
  const beamEndMaterial = useFaceMaterial(beamWidth / (CELL * 2), beamHeight / (CELL * 2)) // ±Z
  const beamMaterials = useMemo(
    () => [beamSideMaterial, beamSideMaterial, beamTopMaterial, beamTopMaterial, beamEndMaterial, beamEndMaterial],
    [beamSideMaterial, beamTopMaterial, beamEndMaterial]
  )

  return (
    <>
      {SIDE_WALLS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={materials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {SIDE_WALL_BEAMS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={beamMaterials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
    </>
  )
}
