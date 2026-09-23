// Level layout is data, not a Blender file.

// Height of the elevated island floor (Ground.jsx) that the spawn point,
// road and props sit on.
export const GROUND_Y = 6

// Water.jsx's surface height — the original ground plane, now a full-size
// water plane beneath/around the island. Falling below the island's footprint
// down to this height drowns the player (see systems/playerMovement.js).
export const WATER_Y = 0

// Ground.jsx's island footprint — synced from Blender/world.blend's "Ground"
// object (see project-blender-previz-rig memory for the rig-rotation
// conversion this was derived through). No longer centered on the origin:
// ISLAND_X/ISLAND_Z is the island's own center, offset in Z so its edge
// lines up with groundBlocks.js's Ground.001 (Stage 1's start block).
export const ISLAND_WIDTH = 128.598
export const ISLAND_DEPTH = 95.154
export const ISLAND_X = 0
export const ISLAND_Z = -27.228

export const SPAWN = { x: 0, y: GROUND_Y, z: 0 }

// Placement of the first treadmill in the row (data/treadmill.js's
// TREADMILLS lays out two more beside it, to the right) — reuses the
// original step+pillar+overhead-screen gym unit's own spot: synced from
// Blender/world.blend's "Treadmill" object (see project-blender-previz-rig
// memory for the rig-rotation conversion this position/yaw was derived
// through).
export const TREADMILL_POSITION = [16.213, GROUND_Y, -63.659]
export const TREADMILL_ROTATION_Y = 0

