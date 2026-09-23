import { useEffect, useMemo } from 'react'
import { BoxGeometry } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'
import { applyBoxUV } from '../systems/boxUV.js'
import { PODIUM_POSITION, PODIUM_ROTATION_Y, PODIUM_SCALE, PODIUM_SHAPE } from '../data/podium.js'

// Empty stepped display podium beside the road — see data/podium.js. One
// contiguous tier block (same "wedding cake" staircase trick as
// GroundBlocks: box k is taller and shallower than box k-1, so stacking them
// reads as a staircase with a visible riser at every level), flanked by a
// sloped slide down to the ground on each outer side, all resting on one
// plinth. No gap/ramp down the middle — the tier block is solid across its
// full width.
const LIGHT = '#565b64'
const DARK = '#3d4149'
const STUDS_PER_CELL = 4
const CELL = 0.5 // metres per checker-cell module
const BOX_UV_SIZE = CELL * 2

const {
  numTiers: NUM_TIERS,
  tierRise: TIER_RISE,
  tierDepth: TIER_DEPTH,
  sideWidth: SIDE_WIDTH,
  rampWidth: RAMP_WIDTH,
  rampThickness: RAMP_THICKNESS,
  baseHeight: BASE_HEIGHT,
  baseMargin: BASE_MARGIN,
} = PODIUM_SHAPE

const TOTAL_DEPTH = NUM_TIERS * TIER_DEPTH
const TOP_HEIGHT = NUM_TIERS * TIER_RISE
const TIER_WIDTH = 2 * SIDE_WIDTH // one contiguous block, no centre gap
const TOTAL_WIDTH = TIER_WIDTH + 2 * RAMP_WIDTH // a slide flanks each outer side
const RAMP_X = TIER_WIDTH / 2 + RAMP_WIDTH / 2

// Each slide spans the structure's full height — true ground (y=0) at its
// front-low end, not just the plinth's own top (y=BASE_HEIGHT) — so it
// reads as one continuous slide down to the ground instead of stopping
// partway down the plinth's own riser.
const RAMP_RISE = BASE_HEIGHT + TOP_HEIGHT
const RAMP_LENGTH = Math.hypot(TOTAL_DEPTH, RAMP_RISE)
const RAMP_ANGLE = Math.atan2(RAMP_RISE, TOTAL_DEPTH)

// Tier k (0 = front/lowest) spans the full depth up through its own front
// edge — each subsequent tier is shorter (its front recedes by TIER_DEPTH)
// and taller (by one more TIER_RISE), all sharing the same back edge.
function tierBox(k) {
  const height = (k + 1) * TIER_RISE
  const depth = TOTAL_DEPTH - k * TIER_DEPTH
  return { height, depth, y: BASE_HEIGHT + height / 2, z: -(k * TIER_DEPTH) / 2 }
}

// Builds one box's geometry with a code-generated cube-projection UV set
// (systems/boxUV.js) instead of boxGeometry's default per-face UVs, so one
// shared checker texture tiles at a consistent real-world pitch across boxes
// of very different sizes (tiers, plinth, the rotated ramp) instead of
// stretching per-face.
function useUvBoxGeometry(w, h, d) {
  return useMemo(() => {
    const geo = new BoxGeometry(w, h, d)
    applyBoxUV(geo, BOX_UV_SIZE)
    return geo
  }, [w, h, d])
}

export default function DisplayPodium() {
  const texture = useMemo(
    () => makeStudTexture({ light: LIGHT, dark: DARK, studsPerCell: STUDS_PER_CELL, repeatX: 1, repeatY: 1 }),
    []
  )
  useEffect(() => () => texture.dispose(), [texture])

  const plinthGeometry = useUvBoxGeometry(
    TOTAL_WIDTH + 2 * BASE_MARGIN,
    BASE_HEIGHT,
    TOTAL_DEPTH + 2 * BASE_MARGIN
  )
  const rampGeometry = useUvBoxGeometry(RAMP_WIDTH, RAMP_THICKNESS, RAMP_LENGTH)
  const tierGeometries = useMemo(
    () => Array.from({ length: NUM_TIERS }, (_, k) => {
      const { height, depth } = tierBox(k)
      const geo = new BoxGeometry(TIER_WIDTH, height, depth)
      applyBoxUV(geo, BOX_UV_SIZE)
      return geo
    }),
    []
  )

  // three.js does not GC GPU memory.
  useEffect(
    () => () => {
      plinthGeometry.dispose()
      rampGeometry.dispose()
      tierGeometries.forEach((geo) => geo.dispose())
    },
    [plinthGeometry, rampGeometry, tierGeometries]
  )

  return (
    <group position={PODIUM_POSITION} rotation-y={PODIUM_ROTATION_Y} scale={PODIUM_SCALE}>
      <mesh geometry={plinthGeometry} position={[0, BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={texture} {...MATERIAL_PBR.DISPLAY_PODIUM} />
      </mesh>

      {tierGeometries.map((geometry, k) => {
        const { y, z } = tierBox(k)
        return (
          <mesh key={k} geometry={geometry} position={[0, y, z]} castShadow receiveShadow>
            <meshStandardMaterial map={texture} {...MATERIAL_PBR.DISPLAY_PODIUM} />
          </mesh>
        )
      })}

      {/* Thin inclined panels — receiveShadow only, no castShadow, same as any thin platform surface. */}
      {[-1, 1].map((sign) => (
        <mesh
          key={sign}
          geometry={rampGeometry}
          position={[sign * RAMP_X, RAMP_RISE / 2, 0]}
          rotation-x={RAMP_ANGLE}
          receiveShadow
        >
          <meshStandardMaterial map={texture} {...MATERIAL_PBR.DISPLAY_PODIUM} />
        </mesh>
      ))}
    </group>
  )
}
