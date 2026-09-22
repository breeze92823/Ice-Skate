import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { useGLTF } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { SLOPE_BLOCK_TRANSFORM } from '../data/groundBlocks.js'

// Stage3's ramp bridging Ground.013 up to the elevated Ground.014 — see
// data/groundBlocks.js header comment. Unlike GroundBlocks.jsx's boxes, this
// is a genuinely custom-edited mesh (a tapered, beveled shape), so it's its
// own exported public/models/slope_block.glb rather than a scaled instance
// of ground.glb. The mesh has one authored material (no top/side split like
// Ground_Cube's IceSkate_GROUND/IceSkate_GROUND_SIDE), so it gets one stud
// material overall — its UVs were cube-projected in Blender at a 2-unit
// cube size (matching CELL*2 below), so they already encode real-world
// scale and the texture needs no extra repeat multiplier.
const LIGHT = '#34bac9'
const DARK = '#34bac9'
const STUDS_PER_CELL = 4

export default function SlopeBlock() {
  const { scene } = useGLTF('/models/slope_block.glb')

  const texture = useMemo(
    () => makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: 1, repeatY: 1 }),
    []
  )
  const material = useMemo(() => new MeshStandardMaterial({ map: texture, ...MATERIAL_PBR.GROUND }), [texture])

  const model = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = material
        child.receiveShadow = true
        child.castShadow = false
      }
    })
    return clone
  }, [scene, material])

  // three.js does not GC GPU memory.
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material]
  )

  return <primitive object={model} position={SLOPE_BLOCK_TRANSFORM.position} rotation={SLOPE_BLOCK_TRANSFORM.rotation} />
}

useGLTF.preload('/models/slope_block.glb')
