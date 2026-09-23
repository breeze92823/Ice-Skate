// Guard-wall container for the Stage10 -> Stage11 corridor (StageWall.010's
// far face through StageWall.011's near face), continuing the pattern from
// data/stage2Walls.js through data/stage9Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows.
//
// No new turn here (StageWall.011 shares StageWall.010's z, 1003.2493286132812,
// and the same rotationY, -1.5707963705062866) — the corridor keeps
// heading -X, same as data/stage9Walls.js. What's different is height:
// StageWall.011 sits at y 116.84745025634766, ~93m above StageWall.010's
// y 23.43892478942871. Checked against Blender/world.blend
// (GroundBlock.009/Stage10): the floor between them is Ground.053 (a low
// shelf, top ~18), Ground.054 (a plain, unrotated, 96m-tall/2.5m-thin
// block — not a ramp or staircase, just a sheer riser face) and Ground.055
// (a high shelf, top ~111, leading up to StageWall.011). There's no
// staircase/ramp/lift modeled yet for the actual climb between the low and
// high shelves — confirmed with the user this is coming in a later pass.
// Blender/world.blend's own "Ramp" collection (data/ramp.js, the curved
// Stage11 skate ramp referenced in the project-ramp-collision memory)
// starts right at StageWall.011's own x, i.e. *after* this container, not
// inside it.
//
// Per the user ("just keep space till top" until the climb mechanic
// exists): this container doesn't try to model the climb or hug
// Ground.053/.054's own (oddly narrow, 2.5m-deep) footprints, which look
// more like placeholder risers than a finished walkable lane. It's the
// same NORMAL_HALF magnitude used throughout this project, flush with
// StageWall.010 — see Step 2's "connect at the panel" — built floor-to-
// ceiling tall (WATER_Y through StageWall.011's own top), so wherever the
// eventual climb gets added along Ground.053/.054's stretch, there's no
// premature roof in its way.
//
// No WinPad in this stretch — Blender's Stage11 collection has a
// "WinPad.010" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory), so
// there's nothing here needing a clearance bulge.
//
// WALL_HEIGHT/WALL_Y: ROOM_TOP is StageWall.011's own top (the taller of
// the two boundary panels, 122.5697455406189) rather than the usual
// "clears both, no fill needed" case — StageWall.010's own top
// (29.16122007369995) falls 93.40852546691895m short of that, so
// STAGE10_DOOR_FILLS closes the gap there, same treatment as data/
// stage3Walls.js/data/stage4Walls.js. Still spans down to WATER_Y (0), no
// bottom cap, same as every other container.
const WATER_Y = 0
const ROOM_TOP = 122.5697455406189
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2

const Z_CENTER = 1003.05908203125 // shared z-center for this whole X-run, same reference data/stage8Walls.js/data/stage9Walls.js used
const NORMAL_HALF = 10.057079792022705 // the same "normal lane" magnitude used everywhere else in this project

const NEAR_Z = Z_CENTER - NORMAL_HALF
const FAR_Z = Z_CENTER + NORMAL_HALF

// Plain normal-width run the whole way from StageWall.010's connector to
// StageWall.011's connector — no narrowing/jogs.
const RUN_X = -334.90126259457855
const RUN_DEPTH = 62.60885846949036

export const STAGE10_SEGMENTS = [
  { name: 'Stage10Wall.near', position: [RUN_X, WALL_Y, NEAR_Z], size: [RUN_DEPTH, WALL_HEIGHT, 2] },
  { name: 'Stage10Wall.far', position: [RUN_X, WALL_Y, FAR_Z], size: [RUN_DEPTH, WALL_HEIGHT, 2] },
]

const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF

export const STAGE10_ROOFS = [
  { name: 'Stage10Roof', position: [RUN_X, ROOF_Y, Z_CENTER], size: [RUN_DEPTH, ROOF_HEIGHT, NORMAL_ROOF_WIDTH] },
]

// Door-top infill above StageWall.010's own glass panel — ROOM_TOP is set
// to StageWall.011's own (much taller) top, so StageWall.010's own top
// falls 93.40852546691895m short of the ceiling here. Sized/overlapped
// the same corrected way as data/stage3Walls.js/data/stage4Walls.js's
// fills (own width matching the walls' outer-face span, own depth = the
// door's 0.22710511088371277m thickness plus a 0.3m OVERLAP into the
// neighboring wall on each side) rather than just the door's own width,
// so it actually connects to the walls in 3D. No matching fill at
// StageWall.011 — this container's ceiling already sits exactly at that
// panel's own top.
const DOOR_FILL_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF (NORMAL_HALF + 1) * 2
const DOOR_FILL_DEPTH = 0.22710511088371277 + 0.3 * 2

export const STAGE10_DOOR_FILLS = [
  { name: 'Stage10DoorFill.010', position: [-303.4832763671875, 75.86548280715942, Z_CENTER], size: [DOOR_FILL_DEPTH, 93.40852546691895, DOOR_FILL_WIDTH] },
]
