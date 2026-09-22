import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Euler, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { applyBoxUV } from '../systems/boxUV.js'
import { RAMPS } from '../data/ramp.js'

// Stage11's skate ramp cluster — see data/ramp.js for the Blender/GLB sync.
// Unlike Hammer.jsx's instances, each Ramp has its own nonuniform scale (not
// just position/yaw), so the shared InstancedMesh below composes a full
// per-instance matrix (position + yaw quaternion + scale) once on mount
// rather than reusing one fixed `_scale` — nothing here animates per frame.
//
// Same teal as the rest of this stage's GROUND_BLOCKS (GROUND_BLOCK_COLOR in
// groundBlocks.js) and the same GROUND roughness/metalness, since this is
// the same walkable-terrain family, just a curved shape instead of a box.
//
// UVs are generated in code (systems/boxUV.js), not read from the .glb —
// same reasoning as Hammer.jsx (see feedback-blender-material-ownership
// memory): material/texture mapping shouldn't depend on Blender's authored
// UVs. BOX_UV_SIZE matches this project's CELL*2 stud-texture-tiling
// convention.
const LIGHT = '#34bac9'
const DARK = '#34bac9'
const STUDS_PER_CELL = 4
const BOX_UV_SIZE = 2
const COUNT = RAMPS.length

const _pos = new Vector3()
const _euler = new Euler()
const _scale = new Vector3()
const _matrix = new Matrix4()

export default function RampBlock() {
  const { scene } = useGLTF('/models/ramp.glb')
  const ref = useRef()

  // The exported GLB has one mesh primitive (see data/ramp.js) — reuse its
  // geometry directly, same as Hammer.jsx/SlopeBlock.jsx.
  const geometry = useMemo(() => {
    let geo = null
    scene.traverse((child) => {
      if (child.isMesh && !geo) geo = child.geometry
    })
    if (geo) applyBoxUV(geo, BOX_UV_SIZE)
    return geo
  }, [scene])

  const texture = useMemo(
    () => makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: 1, repeatY: 1 }),
    []
  )
  const material = useMemo(() => new MeshStandardMaterial({ map: texture, ...MATERIAL_PBR.GROUND }), [texture])

  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material]
  )

  // Static transforms — set the instance matrices once rather than every
  // frame (nothing here moves, unlike Hammer's drop/rise/hold loop).
  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    RAMPS.forEach(({ position, rotationY, scale }, i) => {
      _pos.set(position[0], position[1], position[2])
      _euler.set(0, rotationY, 0)
      _scale.set(scale[0], scale[1], scale[2])
      _matrix.compose(_pos, new Quaternion().setFromEuler(_euler), _scale)
      mesh.setMatrixAt(i, _matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} castShadow receiveShadow />
}

useGLTF.preload('/models/ramp.glb')
