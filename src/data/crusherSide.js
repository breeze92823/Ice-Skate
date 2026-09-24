// CrusherSide — Stage8's side-mounted compactor hazard, imported from
// Blender/world.blend's "Stage8" collection. A single, unparented, unrotated
// "Cube" object (data name Cube.050 — the plain default-cube family used by
// StageWall/Hammer, not the unit "Ground_Cube" family), resting on
// Ground.047's platform right where the Stage8 corridor's Z-run meets its
// X-run turn (see data/stage8Walls.js). Unlike CrusherWall/CrusherWall.001
// (a matched pair that slides together to meet at a shared center), there's
// only one CrusherSide object and no paired/fixed target in Blender marking
// a "closed" position — the slide distance is a gameplay call, not a synced
// value (see systems/crusherSideAnim.js's TRAVEL_X). No animation data or
// custom props on the object in Blender.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as crusherWall.js/hammer.js/groundBlocks.js (see
// project-blender-previz-rig memory): three.position = (blender.x,
// blender.z, -blender.y). Rotation is (0,0,0) in Blender. Because this
// object is a plain "Cube" (default 2x2x2 mesh) rather than a unit
// "Ground_Cube", its Blender *scale* isn't the size directly — size comes
// from Blender's computed *dimensions* instead (scale * 2), same convention
// as data/sideWalls.js/data/stageWalls.js: three size = (blender
// dimensions.x, dimensions.z, dimensions.y).
export const CRUSHER_SIDE_SIZE = [6.950812339782715, 11.193673133850098, 28.444263458251953] // [width, height, depth]

export const CRUSHER_SIDE = {
  name: 'CrusherSide',
  position: [17.567996978759766, 23.557037353515625, 1003.0599975585938],
}
