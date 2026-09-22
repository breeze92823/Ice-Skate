// Giant ball prop imported from Blender/world.blend's "Giant_Ball" object
// (Stage3 collection) — a plain unparented UV sphere, so unlike Ground/Road/
// Treadmill its raw matrix_world already IS the final Blender-world
// transform (no rig-rotation algebra to undo). Only the standard Blender
// Z-up -> three.js Y-up axis swap applies:
//   three.position = (blender.x, blender.z, -blender.y)
// Rotation is irrelevant (sphere symmetry). `radius` is the object's uniform
// scale (5.494345664978027) times the base mesh's own radius (1 — confirmed
// by Blender dimensions 10.988868465423584 / scale = 2, i.e. a unit-radius
// UV sphere).
//
// Geometry/transform only — material is owned by the game (GiantBall.jsx),
// see feedback-blender-material-ownership memory. Re-run this conversion by
// hand any time Giant_Ball is added/moved/resized in Blender — this file is
// not auto-synced.
export const GIANT_BALL = {
  name: 'Giant_Ball',
  position: [0, 42.02785110473633, 350.5101013183594],
  radius: 5.494345664978027,
  // World-space z at which systems/giantBallPhysics.js's loop resets the
  // ball back to `position` — the ball rolls downhill (-z) after landing on
  // Slope_Block, so this is a "how far down the ramp it gets" knob: raise it
  // (toward `position[2]`) to reset earlier/higher on the ramp, lower it
  // (toward Ground.013's z, ~257) to let it roll further first. Default
  // ≈271.58 is Slope_Block's own low (downhill) edge, from its `bands` data.
  resetZ: 280,
}
