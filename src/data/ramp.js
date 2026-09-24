// Stage11's skate ramp cluster, imported from Blender/world.blend's "Ramp"
// collection (nested under Stage11, alongside "GroundBlock.010") — six
// unparented duplicates (Ground_Cube.076/.079-.083) of one genuinely
// custom-authored mesh: a curved, multi-segment incline (not a plain box,
// and not a constant-slope ramp like groundBlocks.js's `Slope_Block`
// either — its slope steepens along the run rather than staying constant),
// climbing along the mesh's own local X axis. Two mirrored pairs (yawed
// 180° in Blender) and two narrower side pieces (Ramp.004/.005, split
// either side of the main run) round out the cluster. Exported once,
// unscaled/unrotated/at the origin, to public/models/ramp.glb (see
// components/RampBlock.jsx) — same recipe as Slope_Block/Hammer's own
// exports. Only transform is imported from Blender; material/texture come
// from the game's own code (see feedback-blender-material-ownership
// memory). Re-export the GLB and re-derive RAMP_PROFILE by hand if
// Ground_Cube.076's shape changes in Blender — this file is not
// auto-synced.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same axis-swap as groundBlocks.js/hammer.js (see
// project-blender-previz-rig memory), but unlike those, every instance
// here has a nonuniform, per-axis scale (not baked into a `size` AABB),
// so `scale` is carried through explicitly rather than reduced to a box:
//   three.position = (blender.x, blender.z, -blender.y)
//   three.scale     = (blender.scale.x, blender.scale.z, blender.scale.y)
// `rotationY` (three, radians) = the object's raw `rotation_euler.z` — a
// Blender Z-axis yaw maps straight through to three.js Y under this
// axis-swap (same convention verified for hammer.js/GroundBlock.006).
//
// RAMP_PROFILE describes the shared mesh's own top-surface curve in its
// local, unscaled space: local X runs from the flat entry lip (x=0.5) to
// the high end (x=-1.271328), and RAMP_HALF_WIDTH is the mesh's constant
// local half-width along its other horizontal axis (Blender's local Y,
// which maps to three's local -Z before this instance's own yaw/scale).
// Both are read straight off Ground_Cube.076's vertices (every cross-
// section is exactly 1 unit "thick" locally, so the top face's local Z is
// the lower Z value of each vertex pair plus 1 — equivalently, just the
// higher of the pair). See systems/rampCollision.js for how a world (x, z)
// is mapped into this local frame and profile-sampled for its top height.
export const RAMP_HALF_WIDTH = 0.5

export const RAMP_PROFILE = [
  { x: -1.271328, z: 1.955747 },
  { x: -1.110785, z: 1.671291 },
  { x: -0.941223, z: 1.375679 },
  { x: -0.766249, z: 1.024292 },
  { x: -0.593079, z: 0.695215 },
  { x: -0.409085, z: 0.5 },
  { x: 0.5, z: 0.5 },
]

export const RAMPS = [
  {
    name: 'Ramp',
    position: [-379.1177978515625, 107.18892669677734, 1003.05908203125],
    rotationY: 0,
    scale: [25.307403564453125, 8.18472957611084, 31.094039916992188],
  },
  {
    name: 'Ramp.001',
    position: [-483.783447265625, 107.18892669677734, 1003.05908203125],
    rotationY: 0,
    scale: [25.307403564453125, 8.18472957611084, 31.094039916992188],
  },
  {
    name: 'Ramp.002',
    position: [-458.46142578125, 107.18892669677734, 1003.05908203125],
    rotationY: -3.1415927410125732,
    scale: [25.307403564453125, 8.18472957611084, 31.094039916992188],
  },
  {
    name: 'Ramp.003',
    position: [-556.685302734375, 107.18892669677734, 1003.05908203125],
    rotationY: -3.1415927410125732,
    scale: [25.307403564453125, 8.18472957611084, 31.094039916992188],
  },
  {
    name: 'Ramp.004',
    position: [-582.00732421875, 107.18892669677734, 1014.1369018554688],
    rotationY: 0,
    scale: [25.307403564453125, 8.18472957611084, 9],
  },
  {
    name: 'Ramp.005',
    position: [-582.00732421875, 107.18892669677734, 992.0159912109375],
    rotationY: 0,
    scale: [25.307403564453125, 8.18472957611084, 9],
  },
]
