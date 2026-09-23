import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeRoadTexture } from '../systems/roadTexture.js'
import {
  ROAD_WAYPOINTS,
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

// Orange tread-plate road laid over Ground.jsx's floor. ROAD_WAYPOINTS
// (data/road.js) is a polyline walked as one straight ribbon segment per
// consecutive pair, merged into a single BufferGeometry — same technique as
// Laser-Escape's components/Road.jsx — so bending the route or adding a
// branch is a data-only edit (add/move waypoints there), no component
// change needed. Each segment reuses the one baked tread-plate+kerb
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

function buildRoadGeometry() {
  const positions = []
  const uvs = []
  const colors = []
  const indices = []

  for (let i = 0; i < ROAD_WAYPOINTS.length - 1; i++) {
    const a = ROAD_WAYPOINTS[i]
    const b = ROAD_WAYPOINTS[i + 1]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const length = Math.hypot(dx, dz)
    if (length < 1e-6) continue // coincident waypoints (an instant color/width switch): no segment to draw
    const ux = dx / length
    const uz = dz / length
    const widthA = a.width ?? ROAD_WIDTH
    const widthB = b.width ?? ROAD_WIDTH
    const paX = (-uz * widthA) / 2
    const paZ = (ux * widthA) / 2
    const pbX = (-uz * widthB) / 2
    const pbZ = (ux * widthB) / 2
    const tintA = tintFor(a)
    const tintB = tintFor(b)

    const base = positions.length / 3
    positions.push(a.x + paX, 0, a.z + paZ) // left0
    positions.push(a.x - paX, 0, a.z - paZ) // right0
    positions.push(b.x - pbX, 0, b.z - pbZ) // right1
    positions.push(b.x + pbX, 0, b.z + pbZ) // left1

    uvs.push(0, 0, 1, 0, 1, length, 0, length)
    colors.push(...tintA, ...tintA, ...tintB, ...tintB)
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
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
