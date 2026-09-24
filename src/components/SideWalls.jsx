import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import {
  SIDE_WALLS,
  SIDE_WALL_END_CAPS,
  SIDE_WALL_BULGES,
  SIDE_WALL_JOGS,
  SIDE_WALL_BEAMS,
  SIDE_WALL_ROOF,
  SIDE_WALL_ROOF_WIDE,
  SIDE_WALL_ROOF_END,
} from '../data/sideWalls.js'

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
// SIDE_WALL_BEAMS only — every other wall/roof piece here uses LIGHT/DARK
// above. Same flat (light === dark) grey as LIGHT/DARK, just darkened ~25%
// so the beams read as a distinct pilaster against the rest of the wall.
const BEAM_LIGHT = '#6e7278'
const BEAM_DARK = '#6e7278'
const CELL = 1 // metres per checker cell
const STUDS_PER_CELL = 4 // studs per cell, each stud on a CELL/STUDS_PER_CELL = 0.5m pitch

// One face-pair's texture + material, sized to that pair's own real
// dimensions so the stud pitch stays consistent (CELL metres/tile) instead
// of stretching to fit a different pair's aspect ratio. `light`/`dark`
// default to the shared grey but can be overridden per-call (SIDE_WALL_BEAMS).
function useFaceMaterial(repeatX, repeatY, light = LIGHT, dark = DARK) {
  const texture = useMemo(
    () => makeStudTexture({ light, dark, studsPerCell: STUDS_PER_CELL, repeatX, repeatY }),
    [repeatX, repeatY, light, dark]
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

  // End-cap segments (SIDE_WALL_END_CAPS) share SIDE_WALLS' width/height
  // but are a different (shorter) depth, so they need their own repeat set.
  const [, , endCapDepth] = SIDE_WALL_END_CAPS[0].size
  const endCapSideMaterial = useFaceMaterial(endCapDepth / (CELL * 2), height / (CELL * 2)) // ±X
  const endCapTopMaterial = useFaceMaterial(width / (CELL * 2), endCapDepth / (CELL * 2)) // ±Y
  const endCapMaterials = useMemo(
    () => [endCapSideMaterial, endCapSideMaterial, endCapTopMaterial, endCapTopMaterial, endMaterial, endMaterial],
    [endCapSideMaterial, endCapTopMaterial, endMaterial]
  )

  // Alcove segments (SIDE_WALL_BULGES) share SIDE_WALLS' width/height but
  // are a different (shorter) depth, so they need their own repeat set.
  const [, , bulgeDepth] = SIDE_WALL_BULGES[0].size
  const bulgeSideMaterial = useFaceMaterial(bulgeDepth / (CELL * 2), height / (CELL * 2)) // ±X
  const bulgeTopMaterial = useFaceMaterial(width / (CELL * 2), bulgeDepth / (CELL * 2)) // ±Y
  const bulgeMaterials = useMemo(
    () => [bulgeSideMaterial, bulgeSideMaterial, bulgeTopMaterial, bulgeTopMaterial, endMaterial, endMaterial],
    [bulgeSideMaterial, bulgeTopMaterial, endMaterial]
  )

  // Elbow connectors (SIDE_WALL_JOGS) bending each side between its normal
  // line and its SIDE_WALL_BULGES alcove — their long axis runs along X
  // instead of Z, so "width" here is what reads as its depth along the
  // corridor and vice versa; own repeat set either way.
  const [jogWidth, jogHeight, jogDepth] = SIDE_WALL_JOGS[0].size
  const jogSideMaterial = useFaceMaterial(jogDepth / (CELL * 2), jogHeight / (CELL * 2)) // ±X
  const jogTopMaterial = useFaceMaterial(jogWidth / (CELL * 2), jogDepth / (CELL * 2)) // ±Y
  const jogEndMaterial = useFaceMaterial(jogWidth / (CELL * 2), jogHeight / (CELL * 2)) // ±Z
  const jogMaterials = useMemo(
    () => [jogSideMaterial, jogSideMaterial, jogTopMaterial, jogTopMaterial, jogEndMaterial, jogEndMaterial],
    [jogSideMaterial, jogTopMaterial, jogEndMaterial]
  )

  // Gap-closing/mid-span beams (SIDE_WALL_BEAMS) are a pilaster shape —
  // wider (protrudes past the wall's outer face) and shallower than
  // SIDE_WALLS, and a darker shade than the rest of the wall — so
  // `materials` above would neither fit nor look right. Own repeat set,
  // sized to the beam's own dimensions.
  const [beamWidth, beamHeight, beamDepth] = SIDE_WALL_BEAMS[0].size
  const beamSideMaterial = useFaceMaterial(beamDepth / (CELL * 2), beamHeight / (CELL * 2), BEAM_LIGHT, BEAM_DARK) // ±X
  const beamTopMaterial = useFaceMaterial(beamWidth / (CELL * 2), beamDepth / (CELL * 2), BEAM_LIGHT, BEAM_DARK) // ±Y
  const beamEndMaterial = useFaceMaterial(beamWidth / (CELL * 2), beamHeight / (CELL * 2), BEAM_LIGHT, BEAM_DARK) // ±Z
  const beamMaterials = useMemo(
    () => [beamSideMaterial, beamSideMaterial, beamTopMaterial, beamTopMaterial, beamEndMaterial, beamEndMaterial],
    [beamSideMaterial, beamTopMaterial, beamEndMaterial]
  )

  // Roof/lintel joining the two wall pairs — much wider and thinner than
  // either SIDE_WALLS or SIDE_WALL_BEAMS, so it needs its own repeat set too.
  const [roofWidth, roofHeight, roofDepth] = SIDE_WALL_ROOF.size
  const roofSideMaterial = useFaceMaterial(roofDepth / (CELL * 2), roofHeight / (CELL * 2)) // ±X
  const roofTopMaterial = useFaceMaterial(roofWidth / (CELL * 2), roofDepth / (CELL * 2)) // ±Y
  const roofEndMaterial = useFaceMaterial(roofWidth / (CELL * 2), roofHeight / (CELL * 2)) // ±Z
  const roofMaterials = useMemo(
    () => [roofSideMaterial, roofSideMaterial, roofTopMaterial, roofTopMaterial, roofEndMaterial, roofEndMaterial],
    [roofSideMaterial, roofTopMaterial, roofEndMaterial]
  )

  // Wide roof segment over the bend (SIDE_WALL_ROOF_WIDE) — different
  // width/depth than SIDE_WALL_ROOF, so it needs its own repeat set too.
  const [roofWideWidth, roofWideHeight, roofWideDepth] = SIDE_WALL_ROOF_WIDE.size
  const roofWideSideMaterial = useFaceMaterial(roofWideDepth / (CELL * 2), roofWideHeight / (CELL * 2)) // ±X
  const roofWideTopMaterial = useFaceMaterial(roofWideWidth / (CELL * 2), roofWideDepth / (CELL * 2)) // ±Y
  const roofWideEndMaterial = useFaceMaterial(roofWideWidth / (CELL * 2), roofWideHeight / (CELL * 2)) // ±Z
  const roofWideMaterials = useMemo(
    () => [
      roofWideSideMaterial,
      roofWideSideMaterial,
      roofWideTopMaterial,
      roofWideTopMaterial,
      roofWideEndMaterial,
      roofWideEndMaterial,
    ],
    [roofWideSideMaterial, roofWideTopMaterial, roofWideEndMaterial]
  )

  // Narrow roof segment past the bend (SIDE_WALL_ROOF_END) — same width as
  // SIDE_WALL_ROOF but a different depth, so it still needs its own repeat.
  const [roofEndWidth, roofEndHeight, roofEndDepth] = SIDE_WALL_ROOF_END.size
  const roofEndSideMaterial = useFaceMaterial(roofEndDepth / (CELL * 2), roofEndHeight / (CELL * 2)) // ±X
  const roofEndTopMaterial = useFaceMaterial(roofEndWidth / (CELL * 2), roofEndDepth / (CELL * 2)) // ±Y
  const roofEndEndMaterial = useFaceMaterial(roofEndWidth / (CELL * 2), roofEndHeight / (CELL * 2)) // ±Z
  const roofEndMaterials = useMemo(
    () => [
      roofEndSideMaterial,
      roofEndSideMaterial,
      roofEndTopMaterial,
      roofEndTopMaterial,
      roofEndEndMaterial,
      roofEndEndMaterial,
    ],
    [roofEndSideMaterial, roofEndTopMaterial, roofEndEndMaterial]
  )

  return (
    <>
      {SIDE_WALLS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={materials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {SIDE_WALL_END_CAPS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={endCapMaterials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {SIDE_WALL_BULGES.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={bulgeMaterials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {SIDE_WALL_JOGS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={jogMaterials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {SIDE_WALL_BEAMS.map(({ name, position, size: [w, h, d] }) => (
        <mesh key={name} position={position} material={beamMaterials} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      <mesh position={SIDE_WALL_ROOF.position} material={roofMaterials} castShadow receiveShadow>
        <boxGeometry args={SIDE_WALL_ROOF.size} />
      </mesh>
      <mesh position={SIDE_WALL_ROOF_WIDE.position} material={roofWideMaterials} castShadow receiveShadow>
        <boxGeometry args={SIDE_WALL_ROOF_WIDE.size} />
      </mesh>
      <mesh position={SIDE_WALL_ROOF_END.position} material={roofEndMaterials} castShadow receiveShadow>
        <boxGeometry args={SIDE_WALL_ROOF_END.size} />
      </mesh>
    </>
  )
}
