import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { STAGE3_SEGMENTS, STAGE3_RAMP_JOGS, STAGE3_ROOFS, STAGE3_DOOR_FILLS } from '../data/stage3Walls.js'

// Guard-wall container for the Stage3 -> Stage4 corridor — see
// data/stage3Walls.js for the full layout (flat lane segments/jogs around
// the Slope_Block ramp and Ground.014/.015). Same studded material/colors
// and size-keyed material cache as components/Stage2Walls.jsx.
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

export default function Stage3Walls() {
  const pieces = useMemo(
    () => [...STAGE3_SEGMENTS, ...STAGE3_RAMP_JOGS, ...STAGE3_ROOFS, ...STAGE3_DOOR_FILLS],
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
