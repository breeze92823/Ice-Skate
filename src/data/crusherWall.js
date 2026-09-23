// CrusherWall / CrusherWall.001 — Stage9's compactor hazard, imported from
// Blender/world.blend's "Stage9" collection. Both objects are unparented
// "Ground_Cube" duplicates (same mesh family as GroundBlock props, data
// names Ground_Cube.068/.069), unrotated, resting flush on Ground.048's top
// surface — one slab bookending each end of that platform along Z. No
// animation data in Blender; the slide-together/retract loop lives in
// systems/crusherAnim.js.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as hammer.js/groundBlocks.js (see project-blender-previz-rig
// memory): three.position = (blender.x, blender.z, -blender.y). Both
// objects have rotation (0,0,0) in Blender, so size converts straight
// across: (blender scale.x, scale.z, scale.y) -> three (width, height,
// depth).
//
// Rendered via the shared GroundBlock component (components/Ground.jsx) —
// same textured box, same castShadow=false/receiveShadow=true convention
// already used for every Ground_Cube-derived prop, matching the
// cast_shadow=false/receive_shadow=true custom props set on both objects in
// Blender. Material/texture come from the game's own code, not Blender (see
// feedback-blender-material-ownership memory).
export const CRUSHER_WALL_SIZE = [134, 12.110005378723145, 28.87409019470215] // [width, height, depth]

export const CRUSHER_WALLS = [
  {
    name: 'CrusherWall',
    position: [-201.19317626953125, 24.118471145629883, 1031.671875],
  },
  {
    name: 'CrusherWall.001',
    position: [-201.19317626953125, 24.118471145629883, 974.583984375],
  },
]
