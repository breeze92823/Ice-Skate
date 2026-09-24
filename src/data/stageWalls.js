// Stage-transition boundary walls imported from Blender/world.blend's
// "StageWall.001" through "StageWall.013" objects (top-level in Stage1
// through Stage13 respectively, unparented, no modifiers/rig) — plain
// duplicates of the same source cube, one per stage. Visual-only: unlike
// SideWalls (data/sideWalls.js), STAGE_WALLS itself is NOT registered in
// playerMovement.js's collision — the player must be able to skate straight
// through StageWall.001-012, so no resolve*Walls step reads this array
// directly. StageWall.013 (Stage13, the final stage) is the one exception —
// see STAGE13_END_WALL_COLLIDER below, which data/wallColliders.js does
// register, so the player is stopped at "The End" instead of skating past
// it. Geometry/material come from the game's own boxGeometry + a plain
// tinted glass MeshStandardMaterial (components/StageWalls.jsx), not from
// Blender — see feedback-blender-material-ownership memory.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as groundBlocks.js/sideWalls.js (see
// project-blender-previz-rig memory):
//   three.position = (blender.x, blender.z, -blender.y)
//   three.size     = (blender.dimensions.x, blender.dimensions.z, blender.dimensions.y)
// All 12 share one size — same source cube duplicated per stage, never
// independently resized.
//
// `rotationY` (optional, three.js radians, default 0) — StageWall.009-013
// (Stage9-Stage13) are yawed -90° about Blender's Z axis to close off the
// corridor after it turns there; a Blender Z-axis rotation maps straight
// through to a three.js Y-axis rotation of the same signed angle (same
// convention as groundBlocks.js's Ground.049/052/056-059 turn pillars).
//
// Re-run this conversion by hand any time StageWall.001-013 is
// added/moved/resized/rotated/renamed in Blender — this file is not
// auto-synced (see project-stage-layout memory on Blender renumbering).
//
// `stage` is the number painted on that wall's "Stage {n}" label
// (components/StageWalls.jsx) — it's each wall's own Blender collection
// number (StageWall.NNN lives in the "StageNNN" collection), not derived
// from the array index or parsed from the object name, so a future Blender
// renumbering can't silently relabel a wall.
//
// `label` (optional) overrides the "Stage {n}" caption text entirely — only
// StageWall.013/Stage13 sets it (to "The End", the final stage's own sign)
// so the main caption doesn't read as just another numbered stage.
//
// `recommendedLevel` feeds the "Recommended Level: {n}" caption above the
// "Stage {n}" one — real design-set figures (not placeholders). `null` (only
// StageWall.013/Stage13, the final stage) omits that caption entirely.
const STAGE_WALL_SIZE = [18.4655818939209, 11.44459056854248, 0.22710511088371277]

export const STAGE_WALLS = [
  {
    name: 'StageWall.001',
    position: [-0.008928011171519756, 11.1223726272583, 20.595752716064453],
    size: STAGE_WALL_SIZE,
    stage: 1,
    recommendedLevel: 1,
  },
  {
    name: 'StageWall.002',
    position: [-0.008928011171519756, 11.1223726272583, 155.8538360595703],
    size: STAGE_WALL_SIZE,
    stage: 2,
    recommendedLevel: 13,
  },
  {
    name: 'StageWall.003',
    position: [-0.008928011171519756, 11.1223726272583, 273.27154541015625],
    size: STAGE_WALL_SIZE,
    stage: 3,
    recommendedLevel: 15,
  },
  {
    name: 'StageWall.004',
    position: [-0.008928011171519756, 25.05631446838379, 401.91607666015625],
    size: STAGE_WALL_SIZE,
    stage: 4,
    recommendedLevel: 18,
  },
  {
    name: 'StageWall.005',
    position: [-0.008928011171519756, 23.43892478942871, 511.34002685546875],
    size: STAGE_WALL_SIZE,
    stage: 5,
    recommendedLevel: 25,
  },
  {
    name: 'StageWall.006',
    position: [-0.008928011171519756, 23.43892478942871, 628.186279296875],
    size: STAGE_WALL_SIZE,
    stage: 6,
    recommendedLevel: 35,
  },
  {
    name: 'StageWall.007',
    position: [-0.008928011171519756, 23.43892478942871, 794.4322509765625],
    size: STAGE_WALL_SIZE,
    stage: 7,
    recommendedLevel: 39,
  },
  {
    name: 'StageWall.008',
    position: [-0.008928011171519756, 23.43892478942871, 988.9906616210938],
    size: STAGE_WALL_SIZE,
    stage: 8,
    recommendedLevel: 69,
  },
  {
    name: 'StageWall.009',
    position: [-131.2569580078125, 23.43892478942871, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 9,
    recommendedLevel: 80,
  },
  {
    name: 'StageWall.010',
    position: [-303.4832763671875, 23.43892478942871, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 10,
    recommendedLevel: 112,
  },
  {
    name: 'StageWall.011',
    position: [-366.3192443847656, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 11,
    recommendedLevel: 118,
  },
  {
    name: 'StageWall.012',
    position: [-666.6488647460938, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 12,
    recommendedLevel: 120,
  },
  {
    name: 'StageWall.013',
    position: [-848.6567993164062, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 13,
    recommendedLevel: null,
    label: 'The End',
  },
]

// StageWall.013 (Stage13, the final stage) is the only stage wall that's
// actually solid — every other StageWall stays a pass-through visual marker
// (see the file-top comment): there's no next stage beyond it to skate into,
// so the player needs to be stopped at "The End" instead of skating straight
// through it like every earlier stage transition.
//
// Derived from that same wall's own position/size above rather than
// duplicated by hand. resolveSideWalls (systems/playerMovement.js, fed by
// data/wallColliders.js's SIDE_WALL_COLLIDERS) only does axis-aligned box
// collision, with no rotationY support — so this swaps the local X/Z extents
// the same way a bare ±90° yaw swaps an AABB's world-space footprint
// (StageWall.013's own rotationY is exactly -90°, same turn every
// Stage9-13 wall shares).
const stageWall013 = STAGE_WALLS.find((wall) => wall.name === 'StageWall.013')
export const STAGE13_END_WALL_COLLIDER = {
  name: 'StageWall.013.collider',
  position: stageWall013.position,
  size: [stageWall013.size[2], stageWall013.size[1], stageWall013.size[0]],
}
