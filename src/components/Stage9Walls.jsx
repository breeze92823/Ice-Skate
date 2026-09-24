import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { STAGE9_SEGMENTS, STAGE9_JOGS, STAGE9_ROOFS } from '../data/stage9Walls.js'

// Guard-wall container for the Stage9 -> Stage10 corridor — see
// data/stage9Walls.js for the full layout (a plain straight X-oriented run
// — no turn this time, StageWall.010 shares StageWall.009's z/rotation —
// with normal-width connectors flush at both panels, no door fills
// needed). Same studded material/colors and size-keyed material cache as
// components/Stage3Walls.jsx through Stage8Walls.jsx.
const LIGHT = '#9398a0'
const DARK = '#9398a0'
const CELL = 1
const STUDS_PER_CELL = 4

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

export default function Stage9Walls() {
  const pieces = useMemo(() => [...STAGE9_SEGMENTS, ...STAGE9_JOGS, ...STAGE9_ROOFS], [])

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
