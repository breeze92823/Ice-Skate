import { GroundBlock } from './Ground.jsx'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'

// Solid ground-block props imported from Blender's "GroundBlock" collection
// — each stands in for a duplicated Ground object, at its own imported
// transform, rendered with the exact same stud-textured material as the
// main island (GroundBlock, from Ground.jsx) rather than anything brought
// over from Blender (see feedback-blender-material-ownership memory).
// `customMesh` entries (e.g. Slope_Block, a genuinely custom shape rather
// than a duplicate of Ground) are collision-only here — SlopeBlock.jsx
// renders those with their own real geometry, mounted separately in App.jsx.
export default function GroundBlocks() {
  return (
    <>
      {GROUND_BLOCKS.filter((b) => !b.customMesh).map(
        ({ name, position, size: [width, thickness, depth], rotationX = 0, light, dark }) => (
          <GroundBlock
            key={name}
            width={width}
            thickness={thickness}
            depth={depth}
            position={position}
            rotation={[rotationX, 0, 0]}
            light={light}
            dark={dark}
          />
        )
      )}
    </>
  )
}
