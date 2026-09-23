// Guard-wall container for the Stage9 -> Stage10 corridor (StageWall.009's
// far face through StageWall.010's near face), continuing the pattern from
// data/stage2Walls.js through data/stage8Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows.
//
// No new turn here: StageWall.010 shares StageWall.009's exact z
// (1003.2493286132812) and the same rotationY (-1.5707963705062866), so
// the corridor keeps heading -X the whole way — this container is a
// plain straight run, just oriented along X instead of Z (like every
// container before data/stage8Walls.js's turn), not another L-shape.
// Checked against Blender/world.blend: the floor is Ground.048
// (GroundBlock.008/Stage9, already partly covered on its near end by
// data/stage8Walls.js's own X-run — same block, this container just picks
// up the rest of its length) and Ground.052 (GroundBlock.009/Stage10, the
// same rotated-square shape as Ground.049, its own width running along
// world Z the same way), which together span this whole container's
// x-range with room to spare at both ends.
//
// X_RUN_HALF/NORMAL_HALF/JOG_DEPTH are the exact same values
// data/stage8Walls.js used for its own X-run and final connector —
// Ground.048's own z-depth (28.87409019470215) is identical here, so
// there's no need to recompute the margin. Same "connect at the panel"
// treatment at both ends this time (Gotcha #6 — data/stage8Walls.js's
// first attempt skipped this and left a visible gap at StageWall.009):
// a short 2m normal-width connector flush with each panel, then a jog out
// to the wide X-run and back.
//
// No WinPad in this stretch — Blender's Stage10 collection has a
// "WinPad.009" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory), so
// there's nothing here needing a clearance bulge.
//
// WALL_HEIGHT/WALL_Y: StageWall.009 and StageWall.010 share the exact
// same y (23.43892478942871) — same situation as every container since
// data/stage5Walls.js — so both panels' own tops are identical
// (29.16122007369995), no hard height constraint in this stretch, and
// neither boundary needs a STAGE N_DOOR_FILLS entry. Still spans down to
// WATER_Y (0), no bottom cap, same as every other container.
const WATER_Y = 0
const ROOM_TOP = 29.16122007369995
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const Z_CENTER = 1003.05908203125 // Ground.048's own z-center, same reference data/stage8Walls.js used
const X_RUN_HALF = 12.937045097351074 // Ground.048's own z-depth margin, reused from data/stage8Walls.js
const NORMAL_HALF = 10.057079792022705 // the same "normal lane" magnitude used everywhere else, reused from data/stage8Walls.js

const NEAR_Z = Z_CENTER - X_RUN_HALF
const FAR_Z = Z_CENTER + X_RUN_HALF
const NORMAL_NEAR_Z = Z_CENTER - NORMAL_HALF
const NORMAL_FAR_Z = Z_CENTER + NORMAL_HALF

export const STAGE9_SEGMENTS = [
  // Short 2m normal-width connector, flush with StageWall.009's far face.
  { name: 'Stage9Wall.connectorA.near', position: [-132.37051056325436, WALL_Y, NORMAL_NEAR_Z], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage9Wall.connectorA.far', position: [-132.37051056325436, WALL_Y, NORMAL_FAR_Z], size: [2, WALL_HEIGHT, 2] },
  // Main X-run, spanning Ground.048 and Ground.052.
  { name: 'Stage9Wall.main.near', position: [-217.3701171875, WALL_Y, NEAR_Z], size: [166.26239379048346, WALL_HEIGHT, 2] },
  { name: 'Stage9Wall.main.far', position: [-217.3701171875, WALL_Y, FAR_Z], size: [166.26239379048346, WALL_HEIGHT, 2] },
  // Short 2m normal-width connector, flush with StageWall.010's near face.
  { name: 'Stage9Wall.connectorB.near', position: [-302.36972381174564, WALL_Y, NORMAL_NEAR_Z], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage9Wall.connectorB.far', position: [-302.36972381174564, WALL_Y, NORMAL_FAR_Z], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same idea as data/stage8Walls.js's Stage8Jog.near/.far,
// rotated the same way (run along Z, bridging two z-lines): jogA between
// connectorA and the main run, jogB between the main run and connectorB.
export const STAGE9_JOGS = [
  { name: 'Stage9Jog.A.near', position: [-133.80471542775632, WALL_Y, 991.5620195865631], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
  { name: 'Stage9Jog.A.far', position: [-133.80471542775632, WALL_Y, 1014.5561444759369], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
  { name: 'Stage9Jog.B.near', position: [-300.9355189472437, WALL_Y, 991.5620195865631], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
  { name: 'Stage9Jog.B.far', position: [-300.9355189472437, WALL_Y, 1014.5561444759369], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
]

// Roof pieces — jogA/jogB both reach widest toward the main X-run (same
// logic as every other container's roof list), so both merge into the
// main roof piece, leaving only the two short normal-width connector caps
// separate.
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same magnitude as data/sideWalls.js's SIDE_WALL_ROOF
const WIDE_X_ROOF_WIDTH = 27.874090194702148 // (X_RUN_HALF + 1) * 2

export const STAGE9_ROOFS = [
  { name: 'Stage9Roof.connectorA', position: [-132.37051056325436, ROOF_Y, Z_CENTER], size: [2, ROOF_HEIGHT, NORMAL_ROOF_WIDTH] },
  { name: 'Stage9Roof.main', position: [-217.3701171875, ROOF_Y, Z_CENTER], size: [167.9992132484913, ROOF_HEIGHT, WIDE_X_ROOF_WIDTH] }, // jogA + main + jogB
  { name: 'Stage9Roof.connectorB', position: [-302.36972381174564, ROOF_Y, Z_CENTER], size: [2, ROOF_HEIGHT, NORMAL_ROOF_WIDTH] },
]

// No STAGE9_DOOR_FILLS export — StageWall.009 and StageWall.010 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
