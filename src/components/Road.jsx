import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeRoadTexture } from '../systems/roadTexture.js'
import {
  ROAD_PATHS,
  ROAD_WIDTH,
  ROAD_Y_OFFSET,
  ROAD_CELL,
  ROAD_COLOR,
  ROAD_COLOR_DARK,
  ROAD_CURB_LIGHT,
  ROAD_CURB_DARK,
  ROAD_CURB_WIDTH,
} from '../data/road.js'
import { GROUND_Y } from '../data/hub.js'

// Orange tread-plate road laid over Ground.jsx's floor. ROAD_PATHS
// (data/road.js) is a list of polylines — the main route plus any branches —
// each walked as one straight ribbon segment per consecutive waypoint pair
// and appended into the same shared buffers, merged into a single
// BufferGeometry — same technique as Laser-Escape's components/Road.jsx —
// so bending the route or adding a branch is a data-only edit (add/move
// waypoints, or push a new named waypoint array onto ROAD_PATHS), no
// component change needed. Each segment reuses the one baked tread-plate+kerb
// CanvasTexture (systems/roadTexture.js): U is normalized 0..1 across the
// ribbon's width so the texture's kerb strips always land on the two edges
// regardless of a waypoint's width override, and V is set in world metres
// along the segment's length (tiled by the texture's own `repeat`, so
// segments of different lengths stay tiled consistently and joints need no
// miter geometry).

const DEFAULT_COLOR = new THREE.Color(ROAD_COLOR)
// A waypoint's `color` re-tints the baked texture by its ratio to the
// default ROAD_COLOR (see data/road.js), so an unset color multiplies the
// texture by white (1,1,1) — a no-op — reproducing the baked look exactly.
function tintFor(waypoint) {
  const c = new THREE.Color(waypoint.color ?? ROAD_COLOR)
  return [c.r / DEFAULT_COLOR.r, c.g / DEFAULT_COLOR.g, c.b / DEFAULT_COLOR.b]
}

const PERP_DOT_EPS = 0.05 // |cos angle| below this counts as a right-angle bend

// Unit direction + length from a to b, or null for coincident points (an
// instant color/width switch — see the zero-length skip below).
function segmentDir(a, b) {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const length = Math.hypot(dx, dz)
  return length < 1e-6 ? null : { ux: dx / length, uz: dz / length, length }
}

function isPerp(ux1, uz1, ux2, uz2) {
  return Math.abs(ux1 * ux2 + uz1 * uz2) < PERP_DOT_EPS
}

function pushQuad(positions, uvs, colors, indices, p0, p1, p2, p3, uv, tint0, tint1, tint2, tint3) {
  const base = positions.length / 3
  positions.push(...p0, ...p1, ...p2, ...p3)
  uvs.push(...uv)
  colors.push(...tint0, ...tint1, ...tint2, ...tint3)
  indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
}

// Appends one path's ribbon segments into the shared buffers so any number
// of paths (main route + branches) can merge into a single BufferGeometry /
// one draw call — same signature/technique as Laser-Escape's addPolyline().
// A gently curving polyline (many waypoints, small angle changes — Laser-
// Escape's long routes) needs no miter: consecutive segments barely overlap
// or gap. A sharp right-angle bend (our branch spurs) is different — the
// incoming and outgoing rectangles double-draw a square on the inside of
// the turn (a z-fighting/texture-seam overlap) while leaving one unpaved on
// the outside. So each segment is trimmed back by half its neighbor's width
// wherever that neighbor turns ~90°, and the corner-patch loop below fills
// the resulting joint with one square sized to that waypoint's own width —
// covering the turn exactly once, no gap, no overlap.
function addPolyline(waypoints, positions, uvs, colors, indices) {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]
    const dir = segmentDir(a, b)
    if (!dir) continue // coincident waypoints (an instant color/width switch): no segment to draw
    const { ux, uz, length } = dir
    const widthA = a.width ?? ROAD_WIDTH
    const widthB = b.width ?? ROAD_WIDTH

    let aTrim = 0
    let bTrim = 0
    if (i > 0) {
      const prevDir = segmentDir(waypoints[i - 1], a)
      if (prevDir && isPerp(prevDir.ux, prevDir.uz, ux, uz)) aTrim = widthA / 2
    }
    if (i + 2 < waypoints.length) {
      const nextDir = segmentDir(b, waypoints[i + 2])
      if (nextDir && isPerp(ux, uz, nextDir.ux, nextDir.uz)) bTrim = widthB / 2
    }
    if (aTrim + bTrim >= length) {
      aTrim = 0
      bTrim = 0 // segment too short to trim without inverting — draw it untrimmed rather than corrupt it
    }

    const ax = a.x + ux * aTrim
    const az = a.z + uz * aTrim
    const bx = b.x - ux * bTrim
    const bz = b.z - uz * bTrim
    const trimmedLength = length - aTrim - bTrim

    const paX = (-uz * widthA) / 2
    const paZ = (ux * widthA) / 2
    const pbX = (-uz * widthB) / 2
    const pbZ = (ux * widthB) / 2
    const tintA = tintFor(a)
    const tintB = tintFor(b)

    pushQuad(
      positions,
      uvs,
      colors,
      indices,
      [ax + paX, 0, az + paZ],
      [ax - paX, 0, az - paZ],
      [bx - pbX, 0, bz - pbZ],
      [bx + pbX, 0, bz + pbZ],
      [0, 0, 1, 0, 1, trimmedLength, 0, trimmedLength],
      tintA,
      tintA,
      tintB,
      tintB,
    )
  }

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prevDir = segmentDir(waypoints[i - 1], waypoints[i])
    const nextDir = segmentDir(waypoints[i], waypoints[i + 1])
    if (!prevDir || !nextDir || !isPerp(prevDir.ux, prevDir.uz, nextDir.ux, nextDir.uz)) continue
    const corner = waypoints[i]
    const half = (corner.width ?? ROAD_WIDTH) / 2
    const tint = tintFor(corner)
    pushQuad(
      positions,
      uvs,
      colors,
      indices,
      [corner.x - half, 0, corner.z - half],
      [corner.x + half, 0, corner.z - half],
      [corner.x + half, 0, corner.z + half],
      [corner.x - half, 0, corner.z + half],
      [0, 0, 1, 0, 1, half * 2, 0, half * 2],
      tint,
      tint,
      tint,
      tint,
    )
  }
}

function buildRoadGeometry() {
  const positions = []
  const uvs = []
  const colors = []
  const indices = []

  for (const path of ROAD_PATHS) {
    addPolyline(path, positions, uvs, colors, indices)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export default function Road() {
  const texture = useMemo(
    () =>
      makeRoadTexture({
        width: ROAD_WIDTH,
        cell: ROAD_CELL,
        color: ROAD_COLOR,
        colorDark: ROAD_COLOR_DARK,
        curbLight: ROAD_CURB_LIGHT,
        curbDark: ROAD_CURB_DARK,
        curbWidth: ROAD_CURB_WIDTH,
      }),
    [],
  )
  const geometry = useMemo(buildRoadGeometry, [])

  // three.js does not GC GPU memory.
  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh position={[0, GROUND_Y + ROAD_Y_OFFSET, 0]} geometry={geometry} receiveShadow>
      {/* DoubleSide: the road is only ever seen from above, but this frees a
         segment's winding from having to be hand-verified per direction. */}
      <meshStandardMaterial
        map={texture}
        vertexColors
        side={THREE.DoubleSide}
        {...MATERIAL_PBR.GROUND}
      />
    </mesh>
  )
}
