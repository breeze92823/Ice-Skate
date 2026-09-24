import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { AdditiveBlending, Color, DoubleSide, Matrix4, Quaternion, Vector3 } from 'three'
import { TELEPORT_GATES } from '../data/teleportGate.js'
import { GATE_PARTICLES, GATE_PARTICLE_PALETTE } from '../data/teleportGateEffect.js'
import { makeTeleportGateTexture } from '../systems/teleportGateTexture.js'

// Unlit glow, not a bloom pass — see CLAUDE.md's lighting section. DoubleSide
// so the portal reads from whichever side the player approaches from. The
// face is a baked nebula/warp texture (systems/teleportGateTexture.js) that
// fades to fully transparent at its edge, paired with a transparent +
// additive material so there's no square backdrop — just the glow. A slow
// texture rotation (not a redraw) gives the bake its swirl, and a swirling
// mote InstancedMesh (one draw call per gate) sits just in front of it for
// actual depth/motion, dense enough it reads as a real particle effect
// rather than a sparse sprinkle.
const SWIRL_SPEED = 0.12 // radians/sec, baked-texture rotation
// Local-Y offset from the gate group's own origin, NOT size/2 + margin —
// this corridor's roof (data/sideWalls.js's SIDE_WALL_ROOF) has its
// underside at world Y 16.864, and this gate's group origin sits at world Y
// 10.663, so anything past a ~6.2 local offset renders inside the opaque
// roof slab and gets occluded. 5.6 keeps the label just under the portal's
// own top edge (size/2 = 5.95) with clearance to spare.
const LABEL_HEIGHT = 5.6
const LABEL_COLOR = '#ffffff'
const LABEL_OUTLINE = '#6f2cff' // echoes the nebula bake's purple core

const PARTICLE_COUNT = GATE_PARTICLES.count
const _pos = new Vector3()
const _scale = new Vector3()
const _matrix = new Matrix4()
const _quat = new Quaternion() // identity — motes are flat discs, no per-instance rotation needed
const _color = new Color()

export default function TeleportGate() {
  const textures = useMemo(
    () => TELEPORT_GATES.map(() => makeTeleportGateTexture({})),
    []
  )
  useEffect(() => () => textures.forEach((tex) => tex.dispose()), [textures])

  const particleRefs = useRef([])
  particleRefs.current = []

  const particleLayouts = useMemo(
    () =>
      TELEPORT_GATES.map(({ size }) =>
        Array.from({ length: PARTICLE_COUNT }, (_, i) => {
          const t = Math.random()
          const radius =
            size * (GATE_PARTICLES.minRadiusFrac + t * (GATE_PARTICLES.maxRadiusFrac - GATE_PARTICLES.minRadiusFrac))
          return {
            angle: Math.random() * Math.PI * 2,
            radius,
            depth: (Math.random() * 2 - 1) * GATE_PARTICLES.depthJitter,
            phase: Math.random() * Math.PI * 2,
            spinDir: Math.random() < 0.5 ? -1 : 1,
            size: GATE_PARTICLES.particleSize * (1 + (Math.random() * 2 - 1) * GATE_PARTICLES.sizeJitter),
            color: GATE_PARTICLE_PALETTE[i % GATE_PARTICLE_PALETTE.length],
          }
        })
      ),
    []
  )

  useEffect(() => {
    particleRefs.current.forEach((mesh, gateIdx) => {
      if (!mesh) return
      particleLayouts[gateIdx].forEach((d, i) => mesh.setColorAt(i, _color.set(d.color)))
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })
  }, [particleLayouts])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    for (const tex of textures) tex.rotation += delta * SWIRL_SPEED

    particleRefs.current.forEach((mesh, gateIdx) => {
      if (!mesh) return
      const layout = particleLayouts[gateIdx]
      for (let i = 0; i < layout.length; i++) {
        const d = layout[i]
        const angle = d.angle + t * GATE_PARTICLES.spinSpeed * d.spinDir
        const drift = 1 + Math.sin(t * GATE_PARTICLES.driftSpeed + d.phase) * GATE_PARTICLES.driftAmount
        const radius = d.radius * drift
        const flicker = 0.6 + Math.abs(Math.sin(t * GATE_PARTICLES.flickerSpeed + d.phase)) * 0.4
        _pos.set(Math.cos(angle) * radius, Math.sin(angle) * radius, d.depth)
        _scale.setScalar(d.size * flicker)
        _matrix.compose(_pos, _quat, _scale)
        mesh.setMatrixAt(i, _matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <>
      {TELEPORT_GATES.map(({ name, position, rotationY, size }, i) => (
        <group key={name} position={position} rotation-y={rotationY}>
          <mesh castShadow={false} receiveShadow={false}>
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
              map={textures[i]}
              side={DoubleSide}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <instancedMesh
            ref={(el) => (particleRefs.current[i] = el)}
            args={[null, null, PARTICLE_COUNT]}
            castShadow={false}
            receiveShadow={false}
          >
            <circleGeometry args={[1, 6]} />
            <meshBasicMaterial
              vertexColors
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
              side={DoubleSide}
            />
          </instancedMesh>
          <Billboard position={[0, LABEL_HEIGHT-5, 2]}>
            <Text
              fontSize={0.9}
              fontWeight="bold"
              letterSpacing={-0.02}
              color={LABEL_COLOR}
              outlineWidth={0.09}
              outlineColor={LABEL_OUTLINE}
              anchorX="center"
              anchorY="middle"
            >
              Teleport
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  )
}
