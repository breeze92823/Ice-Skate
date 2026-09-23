import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { FIRE_RING, FIRE_SPARKS, FIRE_TILT, FIRE_CENTER_Y, FIRE_PALETTE, FIRE_SPARK_COLOR } from '../data/skateFireEffect.js'

// Rare-tier halo: a swirling ring of flame motes (InstancedMesh, flat discs
// laid down via a shared fixed-tilt quaternion) plus a handful of thin
// shards streaking outward through it (InstancedMesh, thin boxes oriented
// radially). Two draw calls total, ~150 triangles — see
// data/skateFireEffect.js for tuning. No allocation inside useFrame: every
// Vector3/Quaternion/Matrix4/Color below is hoisted and mutated in place,
// per-instance layout is precomputed once in useMemo.
const RING_COUNT = FIRE_RING.count
const SPARK_COUNT = FIRE_SPARKS.count
const SPARK_TRAVEL_SPAN = FIRE_SPARKS.maxRadius - FIRE_SPARKS.minRadius

const _pos = new Vector3()
const _scale = new Vector3()
const _matrix = new Matrix4()
const _euler = new Euler()
const _quat = new Quaternion()
const _color = new Color()
// Ring motes always lie flat (disc face up) regardless of swirl angle —
// same flat-disc convention as the equipped/glow rings elsewhere on the
// rack (SkateRackItem.jsx).
const _ringQuat = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))

export default function SkateFireEffect() {
  const ringRef = useRef(null)
  const sparkRef = useRef(null)

  const ringData = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, i) => ({
        angle: (i / RING_COUNT) * Math.PI * 2,
        radius: FIRE_RING.radius + (Math.random() * 2 - 1) * FIRE_RING.radiusJitter,
        yOff: (Math.random() * 2 - 1) * FIRE_RING.yJitter,
        phase: Math.random() * Math.PI * 2,
        color: FIRE_PALETTE[i % FIRE_PALETTE.length],
      })),
    []
  )

  const sparkData = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, i) => ({
        angle: (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.4,
        travelOffset: Math.random() * SPARK_TRAVEL_SPAN,
      })),
    []
  )

  useEffect(() => {
    const mesh = ringRef.current
    if (!mesh) return
    ringData.forEach((d, i) => mesh.setColorAt(i, _color.set(d.color)))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [ringData])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const ring = ringRef.current
    const spark = sparkRef.current

    if (ring) {
      for (let i = 0; i < RING_COUNT; i++) {
        const d = ringData[i]
        const angle = d.angle + t * FIRE_RING.swirlSpeed
        const flicker = 1 + Math.sin(t * FIRE_RING.flickerSpeed + d.phase) * 0.3
        _pos.set(Math.cos(angle) * d.radius, d.yOff, Math.sin(angle) * d.radius)
        _scale.setScalar(FIRE_RING.particleSize * flicker)
        _matrix.compose(_pos, _ringQuat, _scale)
        ring.setMatrixAt(i, _matrix)
      }
      ring.instanceMatrix.needsUpdate = true
    }

    if (spark) {
      for (let i = 0; i < SPARK_COUNT; i++) {
        const d = sparkData[i]
        const travel = (d.travelOffset + t * FIRE_SPARKS.travelSpeed) % SPARK_TRAVEL_SPAN
        const radius = FIRE_SPARKS.minRadius + travel
        const angle = d.angle + t * FIRE_SPARKS.spinSpeed
        _pos.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
        // Orient the box's local Z (its long axis) to point radially
        // outward at this angle — see data/skateFireEffect.js header note.
        _euler.set(0, Math.PI / 2 - angle, 0)
        _quat.setFromEuler(_euler)
        _scale.set(FIRE_SPARKS.width, FIRE_SPARKS.width, FIRE_SPARKS.length)
        _matrix.compose(_pos, _quat, _scale)
        spark.setMatrixAt(i, _matrix)
      }
      spark.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group position={[0, FIRE_CENTER_Y, 0]} rotation={[FIRE_TILT.x, 0, FIRE_TILT.z]}>
      <instancedMesh ref={ringRef} args={[null, null, RING_COUNT]} castShadow={false} receiveShadow={false}>
        <circleGeometry args={[1, 6]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.85}
          toneMapped={false}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </instancedMesh>
      <instancedMesh ref={sparkRef} args={[null, null, SPARK_COUNT]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={FIRE_SPARK_COLOR}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}
