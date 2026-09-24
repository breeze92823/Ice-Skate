// CrusherUp — Stage10's floor-mounted rising-spike hazard, imported from
// Blender/world.blend's "Stage10" collection. A single, unparented
// "Ground_Cube" duplicate (data name Ground_Cube.002, same unit-cube family
// as GroundBlock props), yawed -90deg about Blender's Z axis, resting deeply
// buried below Ground.052's platform (its top face sits ~40 units below the
// floor's own top surface) with no partner object or fixed target in
// Blender to derive a "punched" position from — user confirmed directly:
// slides straight up (+Y) to punch through the floor into the Stage10
// corridor, ~45 units of travel (top face reaches ~4 units above the floor
// surface), same as CrusherSide needing its travel asked for directly.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as crusherSide.js/crusherWall.js/groundBlocks.js (see
// project-blender-previz-rig memory): three.position = (blender.x,
// blender.z, -blender.y). Because this object is a "Ground_Cube" (unit cube)
// rather than the plain default-cube family, size still comes from Blender's
// computed *dimensions* (not raw scale) to match the dimensions-based
// convention every other Ground_Cube-derived prop here uses: three size =
// (blender dimensions.x, dimensions.z, dimensions.y) — this is the box's
// *local* (pre-yaw) width/height/depth, matching how GroundBlocks.jsx's
// rotationY-yawed pillar cluster builds its box before rotating it.
//
// `rotationY` (three.js radians) supports the object's -90deg Blender Z yaw —
// same "Blender Z rotation maps straight through to a three.js Y rotation of
// the same signed angle" rule as GroundBlock.006's pillar cluster (see
// groundBlocks.js) — equals the object's raw rotation_euler.z, no extra
// conversion needed.
export const CRUSHER_UP_SIZE = [33.651187896728516, 159.7958526611328, 23.02165985107422] // [width, height, depth]

export const CRUSHER_UP = {
  name: 'CrusherUp',
  position: [-315.05072021484375, -102.52626037597656, 1003.1856689453125],
  rotationY: -1.5707963705062866,
}
