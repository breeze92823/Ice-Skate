// Guard-wall container for the Stage12 -> Stage13 corridor (StageWall.012's
// far face through StageWall.013's near face), continuing the pattern from
// data/stage2Walls.js through data/stage11Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows.
//
// No new turn here (StageWall.013 shares StageWall.012's z, 1003.2493286132812,
// and the same rotationY, -1.5707963705062866) — the corridor keeps
// heading -X. Checked against Blender/world.blend (world-space vertex
// bounding boxes, same method as Gotcha #1) rather than trusting Blender's
// own "GroundBlock.011"/"GroundBlock.012" collection naming, since that
// grouping doesn't line up with the actual stage-wall boundaries here:
// Ground.057 (nominally in the "GroundBlock.011" collection) actually sits
// almost entirely in *this* container (x -818.089 to -666.801, right up
// against StageWall.012), and Ground.058 (nominally "GroundBlock.012")
// actually sits past StageWall.013, in the *next* container. What's
// actually between StageWall.012 and StageWall.013 is Ground.057 (a huge
// plaza slab, 136.59722900390625m wide) for most of the run, narrowing to
// Ground.059 (the usual 33.651187896728516m-wide waypoint shape) for the
// last ~30m approaching StageWall.013 — the two overlap slightly (Ground.057
// ends at x -818.089, Ground.059 starts at x -817.286), so there's no
// floor gap. No hazards/props found in this stretch (surveyed every
// object whose bbox falls in this x-range) other than a WinPad.012 (see
// below).
//
// Ground.057's own half-width (68.298614501953125) hugged directly (same
// -1.5m inset formula as every other WIDE lane in this project, e.g.
// data/stage2Walls.js's/data/stage7Walls.js's WIDE_HALF fit to a
// 33.651187896728516m slab) rather than the "+3m perimeter" cluster
// formula — this is one single flat slab, not a scattered cluster, so it
// gets the same "hug the floor" treatment as any other WIDE lane, just at
// a much bigger scale. Both StageWall.012 and StageWall.013 share the same
// narrow half-width (9.232788085937505, verified via Blender, same as
// data/stage11Walls.js's PANEL_HALF) with almost no clearance in front of
// either one (~0.152m before StageWall.012, ~0.032m before StageWall.013)
// — same "starts right at the panel" situation as data/stage7Walls.js's
// pillar cluster and data/stage11Walls.js's ramp — so both ends taper via
// a jog sitting right at the panel (Gotcha #6), no separate flat
// connector. A third jog handles the mid-run transition from the plaza
// width down to Ground.059's own WIDE width, positioned in the middle of
// the two floor pieces' small overlap zone.
//
// No WinPad clearance needed — Blender's Stage13 collection has a
// "WinPad.012" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory) sitting on
// Ground.059's top, well inside the WIDE tier's z-range, nowhere near a
// wall.
//
// WALL_HEIGHT/WALL_Y: StageWall.012 and StageWall.013 share the exact same
// own top (122.56974792480469, verified via Blender) — no Giant_Ball- or
// ramp-peak-style hard constraint found in this stretch, so no
// STAGE12_DOOR_FILLS export, same situation as data/stage9Walls.js. Still
// spans down to WATER_Y (0), no bottom cap, same as every other container.
const WATER_Y = 0
const ROOM_TOP = 122.56974792480469
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2

const Z_CENTER = 1003.05908203125 // shared z-center for this whole X-run, same reference data/stage8Walls.js through data/stage11Walls.js used
const PANEL_HALF = 9.232788085937505 // StageWall.012's/StageWall.013's own shared half-width, verified via Blender
const PLAZA_HALF = 66.798614501953125 // Ground.057's own 136.59722900390625m-wide floor: 136.59722900390625/2 - 1.5
const WIDE_HALF = 15.325593948364258 // fit to Ground.059's own 33.651187896728516m-wide floor, same value as data/stage2Walls.js's/data/stage11Walls.js's WIDE lane
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const PLAZA_NEAR_Z = Z_CENTER - PLAZA_HALF
const PLAZA_FAR_Z = Z_CENTER + PLAZA_HALF
const WIDE_NEAR_Z = Z_CENTER - WIDE_HALF
const WIDE_FAR_Z = Z_CENTER + WIDE_HALF

export const STAGE12_SEGMENTS = [
  // Plaza run, hugging Ground.057's own width, from StageWall.012's jog to the mid-run transition jog.
  { name: 'Stage12Wall.plaza.near', position: [-742.1681823730469, WALL_Y, PLAZA_NEAR_Z], size: [149.3018157958984, WALL_HEIGHT, 2] },
  { name: 'Stage12Wall.plaza.far', position: [-742.1681823730469, WALL_Y, PLAZA_FAR_Z], size: [149.3018157958984, WALL_HEIGHT, 2] },
  // Wide run, hugging Ground.059's own width, from the transition jog to StageWall.013's jog.
  { name: 'Stage12Wall.wide.near', position: [-833.1721496582031, WALL_Y, WIDE_NEAR_Z], size: [29.232479858398392, WALL_HEIGHT, 2] },
  { name: 'Stage12Wall.wide.far', position: [-833.1721496582031, WALL_Y, WIDE_FAR_Z], size: [29.232479858398392, WALL_HEIGHT, 2] },
]

// Elbow connectors — jogA tapers PANEL_HALF -> PLAZA_HALF right at
// StageWall.012 (same idea as data/stage7Walls.js's jogW/data/
// stage11Walls.js's Stage11Jog.011); jogTransition tapers PLAZA_HALF ->
// WIDE_HALF at the Ground.057/Ground.059 seam; jogB tapers WIDE_HALF ->
// PANEL_HALF right at StageWall.013.
export const STAGE12_JOGS = [
  { name: 'Stage12Jog.A.near', position: [-667.0830696105957, WALL_Y, 965.0433807373047], size: [JOG_DEPTH, WALL_HEIGHT, 57.56582641601562] },
  { name: 'Stage12Jog.A.far', position: [-667.0830696105957, WALL_Y, 1041.0747833251953], size: [JOG_DEPTH, WALL_HEIGHT, 57.56582641601562] },
  { name: 'Stage12Jog.transition.near', position: [-817.6875, WALL_Y, 961.9969778060913], size: [JOG_DEPTH, WALL_HEIGHT, 51.47302055358887] },
  { name: 'Stage12Jog.transition.far', position: [-817.6875, WALL_Y, 1044.1211862564087], size: [JOG_DEPTH, WALL_HEIGHT, 51.47302055358887] },
  { name: 'Stage12Jog.B.near', position: [-848.2225944519043, WALL_Y, 990.7798910140991], size: [JOG_DEPTH, WALL_HEIGHT, 6.0928058624267525] },
  { name: 'Stage12Jog.B.far', position: [-848.2225944519043, WALL_Y, 1015.3382730484009], size: [JOG_DEPTH, WALL_HEIGHT, 6.0928058624267525] },
]

// Roof pieces — jogA merges into the plaza roof (both reach PLAZA_HALF),
// jogB merges into the wide roof (both reach WIDE_HALF), and the
// transition jog is split between the two (its own outer extents match
// each neighbor exactly), same merge rule as every other container. Each
// roof stays a constant width the whole way, including over its jog(s) —
// same as data/stage7Walls.js's Stage7Roof.perimeter and data/
// stage11Walls.js's Stage11Roof, since nothing collides with the roof and
// STAGE12 has no door fills to worry about matching.
const PLAZA_ROOF_WIDTH = 135.59722900390625 // (PLAZA_HALF + 1) * 2
const WIDE_ROOF_WIDTH = 32.651187896728516 // (WIDE_HALF + 1) * 2, same as data/stage2Walls.js's/data/stage9Walls.js's WIDE_X_ROOF_WIDTH

export const STAGE12_ROOFS = [
  { name: 'Stage12Roof.plaza', position: [-742.1681823730469, ROOF_Y, Z_CENTER], size: [151.03863525390625, ROOF_HEIGHT, PLAZA_ROOF_WIDTH] }, // jogA + plaza + half of jogTransition
  { name: 'Stage12Roof.wide', position: [-833.1721496582031, ROOF_Y, Z_CENTER], size: [30.96929931640625, ROOF_HEIGHT, WIDE_ROOF_WIDTH] }, // half of jogTransition + wide + jogB
]

// No STAGE12_DOOR_FILLS export — StageWall.012 and StageWall.013 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
