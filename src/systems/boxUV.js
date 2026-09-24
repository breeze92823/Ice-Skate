// Generates a cube-projection UV set directly from a geometry's own
// vertex positions/normals, in code — not sourced from whatever UVs (if
// any) the source .glb was authored with in Blender. See components/
// Hammer.jsx for why: an imported mesh's authored UVs can be degenerate or
// garbled from edits made outside this project's control, and material/
// texture mapping should not depend on Blender getting that right (see
// feedback-blender-material-ownership memory).
import { BufferAttribute } from 'three'

// `cubeSize` matches this project's CELL*2 stud-texture-tiling convention
// (see systems/studTexture.js) — pass the same value the consumer's
// makeStudTexture repeat is tuned for (repeat (1,1) tiles at the correct
// real-world pitch when cubeSize equals CELL*2). Picks each vertex's
// dominant normal axis and projects the other two position components,
// same result as Blender's "cube project" UV unwrap. Only correct for
// geometry with per-face (non-shared, flat-shaded) vertices — a vertex
// shared between differently-oriented faces would only get one projection.
export function applyBoxUV(geometry, cubeSize) {
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal
  const uv = new Float32Array(position.count * 2)

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const nx = Math.abs(normal.getX(i))
    const ny = Math.abs(normal.getY(i))
    const nz = Math.abs(normal.getZ(i))

    let u, v
    if (nx >= ny && nx >= nz) {
      u = z
      v = y
    } else if (ny >= nx && ny >= nz) {
      u = x
      v = z
    } else {
      u = x
      v = y
    }
    uv[i * 2] = u / cubeSize
    uv[i * 2 + 1] = v / cubeSize
  }

  geometry.setAttribute('uv', new BufferAttribute(uv, 2))
}
