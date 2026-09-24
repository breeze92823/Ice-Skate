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
// WinPad.010 (data/glowFloorPanel.js's GLOW_FLOOR_PANEL_POSITIONS[9], on
// Ground.055's plateau) has since been synced — this note used to say there
// was nothing to clear, but the pad's actual z (992.4925537109375) lands
// inside Stage10Wall.near's own 2m thickness (992.002-994.002), not out in
// the room. Same WinPad-clearance treatment as data/sideWalls.js's
// SIDE_WALL_BULGES/SIDE_WALL_JOGS, just rotated to match this container's
// orientation: that corridor runs along Z with walls at fixed X, so it
// bulges outward in X; this one runs along X with walls at fixed Z (NEAR_Z/
// FAR_Z), so the alcove below bulges Stage10Wall.near further out in -Z
// instead, with the jog elbows running along Z instead of along X. Only the
// near wall needs it — the pad sits close to NEAR_Z, nowhere near FAR_Z.
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
// StageWall.011's connector — no narrowing/jogs, except for the
// WinPad.010-clearance alcove carved into Stage10Wall.near below.
const RUN_X = -334.90126259457855
const RUN_DEPTH = 62.60885846949036
const RUN_LEFT_X = RUN_X - RUN_DEPTH / 2 // StageWall.011-side edge
const RUN_RIGHT_X = RUN_X + RUN_DEPTH / 2 // StageWall.010-side edge

// WinPad.010 clearance alcove — see the comment above. BULGE_NEAR_Z pulls
// Stage10Wall.near back so its inner face clears the pad's own z by exactly
// PAD_RANGE (GLOW_FLOOR_PANEL_RANGE), same "clear by exactly RANGE" target
// as data/sideWalls.js's SIDE_WALL_BULGES. PAD_JOG_HALF_SPAN (how far along
// X the jog elbows sit from the pad) only needs to clear
// sqrt(PAD_RANGE^2 - gap^2) once the wall is back on its normal NEAR_Z line
// beyond the jog — 9 is a generous margin past that minimum, same "bigger
// than the bare minimum" convention data/sideWalls.js's SIDE_WALL_JOGS used
// (~10.2m there), and comfortably inside the ~20m of run available on the
// StageWall.011 side before RUN_LEFT_X.
const JOG_DEPTH = 0.8684097290039062 // same jog depth used throughout this project
const PAD_X = -346.25323486328125 // WinPad.010 — data/glowFloorPanel.js's GLOW_FLOOR_PANEL_POSITIONS[9]
const PAD_Z = 992.4925537109375
const PAD_RANGE = 3.5 // GLOW_FLOOR_PANEL_RANGE
const WALL_HALF_THICKNESS = 1 // half of every wall segment's 2m thickness
const BULGE_NEAR_Z = PAD_Z - PAD_RANGE - WALL_HALF_THICKNESS
const PAD_JOG_HALF_SPAN = 9
const PAD_JOG_X_LOW = PAD_X - PAD_JOG_HALF_SPAN // toward StageWall.011
const PAD_JOG_X_HIGH = PAD_X + PAD_JOG_HALF_SPAN // toward StageWall.010
const PAD_JOG_Z = (NEAR_Z + BULGE_NEAR_Z) / 2
const PAD_JOG_Z_SPAN = NEAR_Z - BULGE_NEAR_Z

export const STAGE10_SEGMENTS = [
  { name: 'Stage10Wall.near.before', position: [(RUN_LEFT_X + PAD_JOG_X_LOW) / 2, WALL_Y, NEAR_Z], size: [PAD_JOG_X_LOW - RUN_LEFT_X, WALL_HEIGHT, 2] },
  { name: 'Stage10Wall.near.bulge', position: [PAD_X, WALL_Y, BULGE_NEAR_Z], size: [PAD_JOG_X_HIGH - PAD_JOG_X_LOW - JOG_DEPTH, WALL_HEIGHT, 2] },
  { name: 'Stage10Wall.near.after', position: [(PAD_JOG_X_HIGH + RUN_RIGHT_X) / 2, WALL_Y, NEAR_Z], size: [RUN_RIGHT_X - PAD_JOG_X_HIGH, WALL_HEIGHT, 2] },
  { name: 'Stage10Wall.far', position: [RUN_X, WALL_Y, FAR_Z], size: [RUN_DEPTH, WALL_HEIGHT, 2] },
]

// Elbow connectors bridging Stage10Wall.near's normal NEAR_Z line to the
// bulge's BULGE_NEAR_Z line, one at each transition x — same idea as
// data/sideWalls.js's SIDE_WALL_JOGS, rotated (long axis along Z here
// instead of X, since this container's straight runs are X-oriented).
export const STAGE10_JOGS = [
  { name: 'Stage10Jog.pad.low', position: [PAD_JOG_X_LOW, WALL_Y, PAD_JOG_Z], size: [JOG_DEPTH, WALL_HEIGHT, PAD_JOG_Z_SPAN] },
  { name: 'Stage10Jog.pad.high', position: [PAD_JOG_X_HIGH, WALL_Y, PAD_JOG_Z], size: [JOG_DEPTH, WALL_HEIGHT, PAD_JOG_Z_SPAN] },
]

const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
// Outer x-edges of the widened roof stretch over the bulge + both jogs
// (mirrors SIDE_WALL_ROOF_WIDE's "swallow both elbows" span).
const PAD_ROOF_X_LOW = PAD_JOG_X_LOW - JOG_DEPTH / 2
const PAD_ROOF_X_HIGH = PAD_JOG_X_HIGH + JOG_DEPTH / 2
// Widened roof's own z-span/center: from the bulge wall's outer face
// through Stage10Wall.far's outer face (the roof only needs to widen toward
// the bulge side — Stage10Wall.far never moves).
const PAD_ROOF_Z_LOW = BULGE_NEAR_Z - WALL_HALF_THICKNESS
const PAD_ROOF_Z_HIGH = FAR_Z + WALL_HALF_THICKNESS
const PAD_ROOF_Z_SPAN = PAD_ROOF_Z_HIGH - PAD_ROOF_Z_LOW
const PAD_ROOF_Z_CENTER = (PAD_ROOF_Z_HIGH + PAD_ROOF_Z_LOW) / 2

export const STAGE10_ROOFS = [
  { name: 'Stage10Roof.before', position: [(RUN_LEFT_X + PAD_ROOF_X_LOW) / 2, ROOF_Y, Z_CENTER], size: [PAD_ROOF_X_LOW - RUN_LEFT_X, ROOF_HEIGHT, NORMAL_ROOF_WIDTH] },
  { name: 'Stage10Roof.pad', position: [PAD_X, ROOF_Y, PAD_ROOF_Z_CENTER], size: [PAD_ROOF_X_HIGH - PAD_ROOF_X_LOW, ROOF_HEIGHT, PAD_ROOF_Z_SPAN] },
  { name: 'Stage10Roof.after', position: [(PAD_ROOF_X_HIGH + RUN_RIGHT_X) / 2, ROOF_Y, Z_CENTER], size: [RUN_RIGHT_X - PAD_ROOF_X_HIGH, ROOF_HEIGHT, NORMAL_ROOF_WIDTH] },
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
