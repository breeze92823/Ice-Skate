// Stage-transition boundary walls imported from Blender/world.blend's
// "StageWall.001" through "StageWall.013" objects (top-level in Stage1
// through Stage13 respectively, unparented, no modifiers/rig) — plain
// duplicates of the same source cube, one per stage. Visual-only: unlike
// SideWalls (data/sideWalls.js), these are NOT registered in
// playerMovement.js's collision — the player must be able to skate straight
// through them, so no resolve*Walls step reads this array. Geometry/material
// come from the game's own boxGeometry + a plain tinted glass
// MeshStandardMaterial (components/StageWalls.jsx), not from Blender — see
// feedback-blender-material-ownership memory.
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
// `recommendedLevel` feeds the "Recommended Level: {n}" caption above the
// "Stage {n}" one. PLACEHOLDER VALUES — just distinct filler numbers so each
// sign reads differently for now; replace with the real recommended-level
// figures once progression.js/design has them.
const STAGE_WALL_SIZE = [18.4655818939209, 11.44459056854248, 0.22710511088371277]

export const STAGE_WALLS = [
  {
    name: 'StageWall.001',
    position: [-0.008928011171519756, 11.1223726272583, 20.595752716064453],
    size: STAGE_WALL_SIZE,
    stage: 1,
    recommendedLevel: 5, // placeholder
  },
  {
    name: 'StageWall.002',
    position: [-0.008928011171519756, 11.1223726272583, 155.8538360595703],
    size: STAGE_WALL_SIZE,
    stage: 2,
    recommendedLevel: 12, // placeholder
  },
  {
    name: 'StageWall.003',
    position: [-0.008928011171519756, 11.1223726272583, 273.27154541015625],
    size: STAGE_WALL_SIZE,
    stage: 3,
    recommendedLevel: 19, // placeholder
  },
  {
    name: 'StageWall.004',
    position: [-0.008928011171519756, 25.05631446838379, 401.91607666015625],
    size: STAGE_WALL_SIZE,
    stage: 4,
    recommendedLevel: 27, // placeholder
  },
  {
    name: 'StageWall.005',
    position: [-0.008928011171519756, 23.43892478942871, 511.34002685546875],
    size: STAGE_WALL_SIZE,
    stage: 5,
    recommendedLevel: 34, // placeholder
  },
  {
    name: 'StageWall.006',
    position: [-0.008928011171519756, 23.43892478942871, 628.186279296875],
    size: STAGE_WALL_SIZE,
    stage: 6,
    recommendedLevel: 41, // placeholder
  },
  {
    name: 'StageWall.007',
    position: [-0.008928011171519756, 23.43892478942871, 794.4322509765625],
    size: STAGE_WALL_SIZE,
    stage: 7,
    recommendedLevel: 49, // placeholder
  },
  {
    name: 'StageWall.008',
    position: [-0.008928011171519756, 23.43892478942871, 988.9906616210938],
    size: STAGE_WALL_SIZE,
    stage: 8,
    recommendedLevel: 56, // placeholder
  },
  {
    name: 'StageWall.009',
    position: [-131.2569580078125, 23.43892478942871, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 9,
    recommendedLevel: 63, // placeholder
  },
  {
    name: 'StageWall.010',
    position: [-303.4832763671875, 23.43892478942871, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 10,
    recommendedLevel: 71, // placeholder
  },
  {
    name: 'StageWall.011',
    position: [-366.3192443847656, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 11,
    recommendedLevel: 78, // placeholder
  },
  {
    name: 'StageWall.012',
    position: [-666.6488647460938, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 12,
    recommendedLevel: 85, // placeholder
  },
  {
    name: 'StageWall.013',
    position: [-848.6567993164062, 116.84745025634766, 1003.2493286132812],
    size: STAGE_WALL_SIZE,
    rotationY: -1.5707963705062866,
    stage: 13,
    recommendedLevel: 93, // placeholder
  },
]
