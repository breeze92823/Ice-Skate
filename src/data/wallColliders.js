import { SIDE_WALLS, SIDE_WALL_END_CAPS, SIDE_WALL_BULGES, SIDE_WALL_JOGS } from './sideWalls.js'
import { HUB_WALLS, HUB_DOOR_FILL } from './hubWalls.js'
import { STAGE2_SEGMENTS, STAGE2_JOGS } from './stage2Walls.js'
import { STAGE3_SEGMENTS, STAGE3_RAMP_JOGS, STAGE3_DOOR_FILLS } from './stage3Walls.js'
import { STAGE4_SEGMENTS, STAGE4_JOGS, STAGE4_DOOR_FILLS } from './stage4Walls.js'
import { STAGE5_SEGMENTS, STAGE5_JOGS } from './stage5Walls.js'
import { STAGE6_SEGMENTS, STAGE6_JOGS } from './stage6Walls.js'
import { STAGE7_SEGMENTS, STAGE7_JOGS } from './stage7Walls.js'
import { STAGE8_SEGMENTS, STAGE8_JOGS } from './stage8Walls.js'
import { STAGE9_SEGMENTS, STAGE9_JOGS } from './stage9Walls.js'
import { STAGE10_SEGMENTS, STAGE10_DOOR_FILLS } from './stage10Walls.js'
import { STAGE11_SEGMENTS, STAGE11_JOGS, STAGE11_DOOR_FILLS } from './stage11Walls.js'
import { STAGE12_SEGMENTS, STAGE12_JOGS } from './stage12Walls.js'

// Every boundary-wall box in the game, concatenated once at module scope —
// moved out of systems/playerMovement.js into this dependency-free data
// module (no import of playerState.js/cameraOrbit.js/etc.) so
// systems/cameraCollision.js can read the same list without pulling in
// playerMovement.js, which itself imports cameraOrbit.js (getYaw) —
// cameraOrbit.js importing cameraCollision.js directly for its own
// clampCameraDistance() otherwise made that a real import cycle
// (cameraOrbit -> cameraCollision -> playerMovement -> cameraOrbit), which
// throws "can't access lexical declaration before initialization" on
// whichever const in the cycle a module reads before its own top-level code
// finishes running.
//
// HUB_WALLS/HUB_DOOR_FILL, SIDE_WALLS/SIDE_WALL_END_CAPS/SIDE_WALL_BULGES/
// SIDE_WALL_JOGS, and STAGE2_SEGMENTS..STAGE12_JOGS are each a boundary-wall
// shape category or one stage's corridor guard walls — see
// systems/playerMovement.js's resolveSideWalls for the per-shape history/
// reasoning behind this list; unchanged here, just relocated.
export const SIDE_WALL_COLLIDERS = [
  ...HUB_WALLS,
  HUB_DOOR_FILL,
  ...SIDE_WALLS,
  ...SIDE_WALL_END_CAPS,
  ...SIDE_WALL_BULGES,
  ...SIDE_WALL_JOGS,
  ...STAGE2_SEGMENTS,
  ...STAGE2_JOGS,
  ...STAGE3_SEGMENTS,
  ...STAGE3_RAMP_JOGS,
  ...STAGE3_DOOR_FILLS,
  ...STAGE4_SEGMENTS,
  ...STAGE4_JOGS,
  ...STAGE4_DOOR_FILLS,
  ...STAGE5_SEGMENTS,
  ...STAGE5_JOGS,
  ...STAGE6_SEGMENTS,
  ...STAGE6_JOGS,
  ...STAGE7_SEGMENTS,
  ...STAGE7_JOGS,
  ...STAGE8_SEGMENTS,
  ...STAGE8_JOGS,
  ...STAGE9_SEGMENTS,
  ...STAGE9_JOGS,
  ...STAGE10_SEGMENTS,
  ...STAGE10_DOOR_FILLS,
  ...STAGE11_SEGMENTS,
  ...STAGE11_JOGS,
  ...STAGE11_DOOR_FILLS,
  ...STAGE12_SEGMENTS,
  ...STAGE12_JOGS,
]
