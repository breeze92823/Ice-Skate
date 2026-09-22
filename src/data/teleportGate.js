// Teleport-gate portal prop imported from Blender/world.blend's
// "Teleport_Gate" object (Stage1 collection) — a plain flat Plane, unparented
// (no rig, so unlike Ground/Road/Treadmill its raw matrix_world already IS
// the final Blender-world transform — no rig-rotation algebra to undo).
// Only the standard Blender Z-up -> three.js Y-up axis swap applies:
//   three.position = (blender.x, blender.z, -blender.y)
// Rotation is reduced to a single yaw: take the object's local +Z axis (a
// Plane's default face normal) in world space, run it through the same
// swap, then yaw = atan2(three_dir.x, three_dir.z). This is the same method
// verified against Treadmill's TREADMILL_ROTATION_Y in hub.js (using
// Treadmill's local +Z axis) — see project-blender-previz-rig memory.
// `size` is the plane's world-space edge length (Blender `dimensions`, both
// axes equal here since it's an unrotated-in-its-own-plane square).
//
// Geometry/transform only — material is owned by the game (TeleportGate.jsx),
// see feedback-blender-material-ownership memory. Re-run this conversion by
// hand any time Teleport_Gate is added/moved/resized in Blender — this file
// is not auto-synced.
export const TELEPORT_GATES = [
  {
    name: 'Teleport_Gate',
    position: [-9.00705623626709, 10.662978172302246, 30.266468048095703],
    rotationY: Math.PI / 2,
    size: 5.949975490570068,
  },
]

// Metres, ground-plane (x/z) only — the gate's authored `position[1]` is the
// portal plane's own centre height (well above the player's feet on the
// ground below it), so a 3D distance check the way systems/merchant.js does
// it would need an unreasonably large range to ever trigger. See
// systems/teleportGate.js.
export const TELEPORT_GATE_RANGE = 5
