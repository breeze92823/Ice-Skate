// Pedestal-pole props imported from Blender/world.blend's "Hammer"
// collection (nested under Stage7, alongside "GroundBlock.006") — four
// duplicates (no modifiers, unparented, no rig) of one genuinely
// custom-authored mesh (Cube.020-023, 16 verts/14 polys: a base slab with a
// pole rising out of it), not a box-decomposable shape like GroundBlocks —
// same situation as groundBlocks.js's `Slope_Block`. Exported once to
// public/models/hammer.glb (a temp duplicate of `Hammer` with
// location/rotation reset to identity and `transform_apply` baking in its
// scale — same recipe as Slope_Block's own export — then deleted, leaving
// the live scene's 4 objects untouched) and rendered by
// components/Hammer.jsx via useGLTF, not built from boxGeometry primitives.
// UV mapping for the stud texture is generated in code from the geometry
// itself (systems/boxUV.js) rather than read from the file — the authored
// mesh's own UVs were degenerate on its tapered pole/skirt faces, and
// material/texture mapping shouldn't depend on Blender getting UVs right
// either way (see feedback-blender-material-ownership memory). Re-export
// the GLB by hand any time Cube.020-023's shape changes in Blender — this
// is not auto-synced.
//
// `position`/`rotationY` here are each instance's resting (top) transform —
// only per-instance placement is imported from Blender; the shared
// drop/rise/hold loop that animates their world Y each frame lives in
// systems/hammerAnim.js, not here.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as groundBlocks.js/sideWalls.js (see
// project-blender-previz-rig memory):
//   three.position = (blender.x, blender.z, -blender.y)
// `rotationY` (three, radians) = the object's raw `rotation_euler.z` (a
// Blender Z-axis yaw maps straight through to three.js Y under this
// axis-swap — same convention already verified for the GroundBlock.006
// pillar cluster right next to this collection).
//
// Only transform is imported from Blender; material/color come from the
// game's own code (components/Hammer.jsx) — see
// feedback-blender-material-ownership memory.
//
// Hazard bounding shape for systems/hammerCrush.js — a vertical
// cylinder, local to each instance's own position (before
// hammerAnim.offsetY is added): radius is the mesh's actual half-width at
// its widest (the base slab), used for the full height range rather than
// tapering down to the pole's narrower radius higher up, so the check
// stays a cheap radius+vertical-span test like giantBallCrush.js/
// sahurCrush.js instead of a yawed-box test. Read straight off
// hammer.glb's own accessor bounds (public/models/hammer.glb, position
// min/max) — re-derive by hand if the mesh is re-exported with a
// different size.
export const HAMMER_RADIUS = 9.234540939331055
export const HAMMER_BOTTOM_Y = -2.9804632663726807
export const HAMMER_TOP_Y = 50.64613723754883

export const HAMMERS = [
  {
    name: 'Hammer',
    position: [-21.408306121826172, 43.08964538574219, 816.7951049804688],
    rotationY: 0,
  },
  {
    name: 'Hammer.001',
    position: [9.160017013549805, 43.08964538574219, 849.5603637695312],
    rotationY: -0.40852466225624084,
  },
  {
    name: 'Hammer.002',
    position: [-16.031526565551758, 43.08964538574219, 886.4190063476562],
    rotationY: -0.10390707850456238,
  },
  {
    name: 'Hammer.003',
    position: [-2.349668502807617, 43.08964538574219, 928.8259887695312],
    rotationY: -0.18999062478542328,
  },
]
