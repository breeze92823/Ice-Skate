import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Euler, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { applyBoxUV } from '../systems/boxUV.js'
import { HAMMERS } from '../data/hammer.js'
import { hammerAnim } from '../systems/hammerAnim.js'

// Stage7's pedestal-pole props — see data/hammer.js for the Blender/GLB sync
// and systems/hammerAnim.js for the shared drop/rise/hold cycle they all
// play in sync. All 4 instances share the exact same authored mesh, so
// they're one InstancedMesh (1 draw call) instead of 4 separate meshes.
//
// UVs are generated in code (systems/boxUV.js), not read from whatever the
// .glb carries — the authored mesh's own UVs were degenerate on its tapered
// pole/skirt faces (a leftover from whatever edit produced that shape), and
// material/texture mapping shouldn't depend on Blender getting UVs right
// (see feedback-blender-material-ownership memory). BOX_UV_SIZE matches
// this project's CELL*2 stud-texture-tiling convention, so a stud texture
// at repeat (1,1) tiles at the correct real-world pitch.
const LIGHT = '#9398a0'
const DARK = '#6b6f76'
const STUDS_PER_CELL = 4
const BOX_UV_SIZE = 2
const COUNT = HAMMERS.length

const _pos = new Vector3()
const _euler = new Euler()
const _scale = new Vector3(1, 1, 1)
const _matrix = new Matrix4()

export default function Hammer() {
  const { scene } = useGLTF('/models/hammer.glb')
  const ref = useRef()

  // The exported GLB has one mesh primitive (see data/hammer.js) — reuse
  // its geometry directly rather than cloning, same as SlopeBlock.jsx, but
  // overwrite its UV attribute with one computed from the geometry itself
  // (see BOX_UV_SIZE comment above) rather than trusting the file's own.
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
  const material = useMemo(() => new MeshStandardMaterial({ map: texture, ...MATERIAL_PBR.SIDE_WALL }), [texture])

  // three.js does not GC GPU memory. Only the texture/material are ours to
  // dispose — the geometry belongs to useGLTF's own cache.
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material]
  )

  // Each instance's fixed yaw, computed once — rotation/scale never
  // change, only Y position animates (systems/hammerAnim.js).
  const quats = useMemo(
    () =>
      HAMMERS.map(({ rotationY }) => {
        _euler.set(0, rotationY, 0)
        return new Quaternion().setFromEuler(_euler)
      }),
    []
  )

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return

    const dy = hammerAnim.offsetY
    HAMMERS.forEach(({ position }, i) => {
      _pos.set(position[0], position[1] + dy, position[2])
      _matrix.compose(_pos, quats[i], _scale)
      mesh.setMatrixAt(i, _matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} castShadow receiveShadow />
}

useGLTF.preload('/models/hammer.glb')
