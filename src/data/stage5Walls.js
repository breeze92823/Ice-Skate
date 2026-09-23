// Guard-wall container for the Stage5 -> Stage6 corridor (StageWall.005's
// far face through StageWall.006's near face), continuing the pattern from
// data/stage2Walls.js/data/stage3Walls.js/data/stage4Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows. Checked against Blender/world.blend: GroundBlock.004
// finishes this side of StageWall.005 (Ground.024's tail, already covered
// by data/stage4Walls.js's own wide lane), then Ground.027 (a narrow gate,
// 13.800000190734863 wide), a real ~5.4m floor gap (no Ground block covers
// z 522.062-527.440 — a jump, not a hazard needing extra width), Ground.026
// (narrow too, 13.5 wide, and phasing — fades in/out on a timer per
// systems/groundPhase.js; the guard walls stay solid through that, same as
// every other wall in this game, since phasing only affects the floor's
// own visibility/collision), Ground.025 (narrow again, 13.800000190734863
// wide, sitting right where Ground.026 ends and Ground.028 begins), then
// Ground.028 (a wide slab, the same 33.651187896728516m width as
// Ground.010/.013/.015/.024). No "SideWall" collection for any of this, so
// this whole file is hand-authored like the others.
//
// Ground.025/.026/.027 are all narrower than the normal lane (13.5-13.8m
// vs the lane's own ~18.1m span) — the guard walls do NOT narrow down to
// hug them, on request: they stay at the normal lane width the entire way
// from StageWall.005 through to Ground.028, i.e. this container's opening
// stays the same width as StageWall.006's own doorway for that whole
// stretch rather than pinching in around each narrow slab the way
// data/stage2Walls.js/data/stage4Walls.js do for their own narrow gates.
// That does mean the walls stand proud of Ground.025/.026/.027's actual
// floor edges for ~80m — a deliberate tradeoff, not an oversight.
//
// WALL_HEIGHT/WALL_Y: StageWall.005 and StageWall.006 share the exact same
// y (23.43892478942871), so both panels' own tops are identical
// (29.16122007369995) — no Giant_Ball-style hard constraint in this
// stretch, so the room's ceiling is just that shared panel top, and
// (unlike data/stage3Walls.js/data/stage4Walls.js) neither boundary needs
// a STAGE N_DOOR_FILLS entry, since the ceiling already matches both
// panels' tops exactly. Still spans down to WATER_Y (0), no bottom cap,
// same as every other container.
const WATER_Y = 0
const ROOM_TOP = 29.16122007369995
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const NORMAL_LEFT = -10.071032524108887 // same lane as every other container
const NORMAL_RIGHT = 10.043127059936523
const WIDE_LEFT = -15.325593948364258 // fit to Ground.028's own 33.651187896728516m-wide floor, same value as data/stage2Walls.js's WIDE lane
const WIDE_RIGHT = 15.325593948364258

// Straight runs. The normal-lane run spans the entire distance from
// StageWall.005's far face through to right before Ground.028's own
// footprint begins — covering Ground.027, the floor gap, Ground.026 and
// Ground.025 all at one constant width (see the header comment on why).
// The final segment mirrors every other container's short 2m normal-lane
// connector approaching StageWall.006.
export const STAGE5_SEGMENTS = [
  // Normal lane, StageWall.005's far face through to Ground.028's own start.
  { name: 'Stage5Wall.normal.right', position: [NORMAL_RIGHT, WALL_Y, 551.6581045076251], size: [2, WALL_HEIGHT, 80.40905019342904] },
  { name: 'Stage5Wall.normal.left', position: [NORMAL_LEFT, WALL_Y, 551.6581045076251], size: [2, WALL_HEIGHT, 80.40905019342904] },
  // Ground.028's wide lane, hugging its own edges (same treatment as Ground.010/.015/.024) — this also naturally clears WinPad.006 (x -10.69305419921875, well inside this lane's ~14.3 inner face) without needing a separate bulge.
  { name: 'Stage5Wall.g028.right', position: [WIDE_RIGHT, WALL_Y, 608.9676781728863], size: [2, WALL_HEIGHT, 32.473277679085754] },
  { name: 'Stage5Wall.g028.left', position: [WIDE_LEFT, WALL_Y, 608.9676781728863], size: [2, WALL_HEIGHT, 32.473277679085754] },
  // Final normal-lane connector, flush with StageWall.006's near face.
  { name: 'Stage5Wall.final.right', position: [NORMAL_RIGHT, WALL_Y, 627.0727267414331], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage5Wall.final.left', position: [NORMAL_LEFT, WALL_Y, 627.0727267414331], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same perpendicular-stub idea as every other
// container's jogs. jogO: normal lane -> Ground.028's wide lane, at the
// floor seam. jogP: wide -> normal lane, before the final connector.
// (Geometrically identical to each other — both bridge the same two
// lines, just at different z.)
export const STAGE5_JOGS = [
  { name: 'Stage5Jog.O.right', position: [12.68436050415039, WALL_Y, 592.2968344688416], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage5Jog.O.left', position: [-12.698313236236572, WALL_Y, 592.2968344688416], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage5Jog.P.right', position: [12.68436050415039, WALL_Y, 625.6385218769312], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage5Jog.P.left', position: [-12.698313236236572, WALL_Y, 625.6385218769312], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
]

// Roof pieces — merged with their adjoining jog(s) wherever the jog's own
// max outer extent matches the wider neighbor's width exactly (same
// approach as every other container's roof list). jogO/jogP both reach
// widest toward WIDE, so both merge into Ground.028's roof.
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // same as data/stage2Walls.js's WIDE_ROOF_WIDTH
const WIDE_ROOF_X = 0

export const STAGE5_ROOFS = [
  { name: 'Stage5Roof.normal', position: [NORMAL_ROOF_X, ROOF_Y, 551.6581045076251], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 80.40905019342904] }, // normal lane
  { name: 'Stage5Roof.g028', position: [WIDE_ROOF_X, ROOF_Y, 608.9676781728864], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 34.2100971370935] }, // jogO + Ground.028 + jogP
  { name: 'Stage5Roof.final', position: [NORMAL_ROOF_X, ROOF_Y, 627.0727267414331], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // final segment
]

// No STAGE5_DOOR_FILLS export — StageWall.005 and StageWall.006 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
