import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { useGLTF } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { GROUND_Y, WATER_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from '../data/hub.js'

// The elevated island floor(s) — authored as a plain unit box in
// Blender/world.blend (the "Ground" object) and exported to a single
// reusable GLB with no size baked in, so every island instance shares the
// same load/geometry/UVs and only its own transform (scale + position)
// differs. Each instance still gets its own stud textures, sized to its
// own real dimensions, so tiling stays square rather than sharing one
// tiling tuned for a different-sized island.
const THICKNESS = GROUND_Y - WATER_Y // metres — main island spans water surface to ground

const CELL = 1 // metres per checker cell
const STUDS_PER_CELL = 4 // studs per cell, each stud on a CELL/STUDS_PER_CELL = 0.5m pitch
const DARK = '#3a4049'
const LIGHT = '#525a68'

// Exported for reuse by GroundBlocks.jsx, so every GroundBlock-collection
// prop gets the same stud-textured top/side material treatment as the main
// island (geometry, roughness/metalness, shadow settings), while still
// being able to use its own checker colors. `light`/`dark` default to
// Ground's own tones below, so Ground() itself is untouched.
export function GroundBlock({ width, depth, thickness, position, rotation = [0, 0, 0], light = LIGHT, dark = DARK }) {
  const { scene } = useGLTF('/models/ground.glb')

  const topTexture = useMemo(
    () =>
      makeStudTexture({
        light,
        dark,
        studsPerCell: STUDS_PER_CELL,
        repeatX: width / (CELL * 2),
        repeatY: depth / (CELL * 2),
      }),
    [width, depth, light, dark]
  )
  const sideTexture = useMemo(
    () =>
      makeStudTexture({
        light,
        dark,
        studsPerCell: STUDS_PER_CELL,
        repeatX: width / (CELL * 2),
        repeatY: thickness / (CELL * 2),
      }),
    [width, thickness, light, dark]
  )

  const topMaterial = useMemo(
    () => new MeshStandardMaterial({ map: topTexture, ...MATERIAL_PBR.GROUND }),
    [topTexture]
  )
  const sideMaterial = useMemo(
    () => new MeshStandardMaterial({ map: sideTexture, ...MATERIAL_PBR.GROUND }),
    [sideTexture]
  )

  const block = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.name === 'IceSkate_GROUND_SIDE' ? sideMaterial : topMaterial
        child.receiveShadow = true
        child.castShadow = false
      }
    })
    return clone
  }, [scene, topMaterial, sideMaterial])

  // three.js does not GC GPU memory.
  useEffect(
    () => () => {
      topTexture.dispose()
      sideTexture.dispose()
      topMaterial.dispose()
      sideMaterial.dispose()
    },
    [topTexture, sideTexture, topMaterial, sideMaterial]
  )

  return <primitive object={block} scale={[width, thickness, depth]} position={position} rotation={rotation} />
}

export default function Ground() {
  return (
    <GroundBlock
      width={ISLAND_WIDTH}
      depth={ISLAND_DEPTH}
      thickness={THICKNESS}
      position={[ISLAND_X, GROUND_Y - THICKNESS / 2, ISLAND_Z]}
    />
  )
}

useGLTF.preload('/models/ground.glb')
