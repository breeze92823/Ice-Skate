import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { STAGE2_SEGMENTS, STAGE2_JOGS, STAGE2_ROOFS } from '../data/stage2Walls.js'

// Guard-wall container for the Stage2 -> Stage3 corridor — see
// data/stage2Walls.js for the full layout (alternating normal/narrow lane
// widths matching the floor, plus a WinPad.003-clearing bulge). Same
// studded material/colors as components/SideWalls.jsx (MATERIAL_PBR.SIDE_WALL,
// same LIGHT/DARK) so it reads as one continuous wall system with Stage1's
// corridor, just driven by a flat per-box list instead of SideWalls.jsx's
// one-hook-per-shape-category pattern — this container has many more
// distinctly-sized boxes (30+, vs SideWalls.jsx's half-dozen shape
// categories), so materials are built with a single memoized cache keyed
// by size instead of a fixed set of useFaceMaterial() hook calls (which
// would need a call per box and break the rules of hooks under a .map()).
const LIGHT = '#9398a0'
const DARK = '#9398a0'
const CELL = 1 // metres per checker cell, matches SideWalls.jsx
const STUDS_PER_CELL = 4

// BoxGeometry's default face order is [+X, -X, +Y, -Y, +Z, -Z]. Builds all
// 3 face-pair materials for one box's [width, height, depth], sized to its
// own real dimensions (same reasoning as SideWalls.jsx's useFaceMaterial)
// so the stud pitch stays consistent across wildly different box sizes.
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

export default function Stage2Walls() {
  const pieces = useMemo(() => [...STAGE2_SEGMENTS, ...STAGE2_JOGS, ...STAGE2_ROOFS], [])

  // One materials entry per unique [width, height, depth] — most
  // left/right segment pairs share a size (only position.x differs), so
  // this avoids rebuilding the same texture twice.
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
    </>
  )
}
