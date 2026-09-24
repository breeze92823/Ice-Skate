import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { HUB_WALLS, HUB_ROOF, HUB_DOOR_FILL } from '../data/hubWalls.js'

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
  const pieces = useMemo(() => [...HUB_WALLS, HUB_ROOF, HUB_DOOR_FILL], [])

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
