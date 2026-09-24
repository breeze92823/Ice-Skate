// Guard-wall container for the Stage8 -> Stage9 corridor (StageWall.008's
// far face through StageWall.009's near face), continuing the pattern from
// data/stage2Walls.js through data/stage7Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows, including the new "L-shaped turn" technique this file
// introduces (see that doc's Turns section for the general recipe).
//
// This is the first container where the corridor itself turns: StageWall.009
// sits at x -131.2569580078125 (not ~0) and carries rotationY
// -1.5707963705062866 (same "yawed -90 about Blender's Z axis" convention
// documented in data/groundBlocks.js for turn pillars) — the path bends
// from heading +Z to heading -X right after StageWall.008. Checked against
// Blender/world.blend: Ground.047 (GroundBlock.007/Stage8, a big
// 142.8367919921875 x 28.87409019470215 slab starting almost immediately
// after StageWall.008, z 988.622-1017.496) carries the corner, then
// Ground.049 (GroundBlock.008/Stage9, the same width as Ground.010/.015/
// etc but rotationY -1.5707963705062874 like the panel itself, so its own
// width now runs along world Z) bridges to Ground.048 (identical size to
// Ground.047, further along -X) leading to StageWall.009.
//
// Modeling the actual L-shape (confirmed with the user, over one big box
// spanning the whole turn) means two pairs of walls instead of one:
//   - OUTER (the +X/outer side of the turn — the corridor turns toward
//     -X, i.e. left, so the +X wall has to sweep around the *outside* of
//     the bend): a Z-run piece (x = NORMAL_RIGHT) continuing all the way
//     to the X-run's *far* z-edge, plus an X-run piece (z = that far
//     edge) continuing all the way back past the Z-run's own x line —
//     each extends 1m past where the other one's own centerline sits, so
//     their volumes genuinely overlap at the corner instead of just
//     sharing an x/z range the way a flat pair of jogs would (see
//     GuardWallContainers.md Gotcha #2 — an infill/corner piece has to
//     intersect in 3D, not just look close on one axis).
//   - INNER (the -X/inner side — the short way around, cutting the
//     corner): the mirror of OUTER, but its Z-run piece stops at the
//     X-run's *near* z-edge instead of the far one, since the inner
//     corner is a concave notch that doesn't need its own wall coverage
//     — the two straight runs just need to meet cleanly at that point.
// The Z-run stays at StageWall.008's own NORMAL lane width the whole way
// (no narrowing there). The X-run runs wide (Ground.047/.048's shared
// z-depth, 28.87409019470215/2 - 0.5 - 1 margin — Ground.049's own
// rotated width, 33.651187896728516, is wider than this and comfortably
// contains it) for most of its length, but — unlike data/stage5Walls.js/
// data/stage6Walls.js's "don't narrow" cases — it DOES narrow back down
// to a normal width right before StageWall.009: being wider than the
// panel everywhere isn't the same as "connect at the panel" (Step 2 of
// GuardWallContainers.md). Leaving the wide X_RUN_HALF opening flush
// against the much narrower door left a big stretch of open, wall-less
// space flanking the glass right at the threshold — same class of issue
// as the original data/stage3Walls.js door fills, just approached from
// the opposite direction (too wide, not too short). Fixed with the same
// short-connector-then-jog pattern used at every other panel, just
// rotated 90°: a 2m flat connector at normal width right at StageWall.009's
// near face, then a jog (here, two Z-oriented pieces closing the gap
// between the wide X-run's z-lines and the narrow connector's own
// z-lines) bringing it back out to X_RUN_HALF for the rest of the run.
//
// No WinPad in this stretch — Blender's Stage9 collection has a
// "WinPad.008" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory), so
// there's nothing here needing a clearance bulge.
//
// WALL_HEIGHT/WALL_Y: StageWall.008 and StageWall.009 share the exact
// same y (23.43892478942871) — same situation as every container since
// data/stage5Walls.js — so both panels' own tops are identical
// (29.16122007369995), no Giant_Ball-style hard constraint in this
// stretch, and neither boundary needs a STAGE N_DOOR_FILLS entry. Still
// spans down to WATER_Y (0), no bottom cap, same as every other
// container.
const WATER_Y = 0
const ROOM_TOP = 29.16122007369995
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2

const NORMAL_LEFT = -10.071032524108887 // same lane as every other container
const NORMAL_RIGHT = 10.043127059936523
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164

// The turn's reference frame: Z_CENTER is the X-run's own centerline (z),
// X_RUN_HALF its half-width — both derived from Ground.047/.048's shared
// 28.87409019470215m depth, same 0.5m/1m-wall-half margin formula as
// every other floor-hugging lane in this project. NORMAL_HALF is the
// same "normal lane" magnitude used everywhere else in this project
// ((10.071032524108887 + 10.043127059936523) / 2, symmetric here since
// there's no Blender-authored asymmetry to preserve in this rotated
// context), reused as the X-run's own narrow connector width approaching
// StageWall.009. JOG_DEPTH matches every other container's jog depth.
const Z_CENTER = 1003.05908203125
const X_RUN_HALF = 12.937045097351074
const NORMAL_HALF = 10.057079792022705
const JOG_DEPTH = 0.8684097290039062

export const STAGE8_SEGMENTS = [
  // OUTER: Z-run's right wall, extended to the X-run's far z-edge.
  { name: 'Stage8Wall.outerZ', position: [NORMAL_RIGHT, WALL_Y, 1003.0501706525683], size: [2, WALL_HEIGHT, 27.891912952065468] },
  // OUTER: X-run's far wall, extended back past the Z-run's own x line — shortened at the StageWall.009 end, where Stage8Jog.far takes over.
  { name: 'Stage8Wall.outerX', position: [-58.61593433171511, WALL_Y, 1015.9961271286011], size: [139.31812278330327, WALL_HEIGHT, 2] },
  // INNER: Z-run's left wall, stopping at the X-run's near z-edge (the corner's concave notch needs no wall of its own).
  { name: 'Stage8Wall.innerZ', position: [NORMAL_LEFT, WALL_Y, 990.1131255552173], size: [2, WALL_HEIGHT, 2.0178227573633194] },
  // INNER: X-run's near wall — shortened at the StageWall.009 end, where Stage8Jog.near takes over.
  { name: 'Stage8Wall.innerX', position: [-68.67301412373781, WALL_Y, 990.1220369338989], size: [119.20396319925786, WALL_HEIGHT, 2] },
  // Short 2m normal-width connector, flush with StageWall.009's near face — "connect at the panel" (GuardWallContainers.md Step 2), same as every other container's final segment, just rotated: these run along Z instead of X.
  { name: 'Stage8Wall.final.far', position: [-130.14340545237064, WALL_Y, 1013.1161618232727], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage8Wall.final.near', position: [-130.14340545237064, WALL_Y, 993.0020022392273], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors closing the gap between the wide X-run's z-lines
// (outerX_z/innerX_z) and the narrow final connector's own z-lines —
// same perpendicular-stub idea as every other container's jogs, just
// rotated: these run along Z instead of X, bridging the two lines the
// same way a normal jog bridges two x-lines.
export const STAGE8_JOGS = [
  { name: 'Stage8Jog.far', position: [-128.70920058786868, WALL_Y, 1014.5561444759369], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
  { name: 'Stage8Jog.near', position: [-128.70920058786868, WALL_Y, 991.5620195865631], size: [JOG_DEPTH, WALL_HEIGHT, 2.879965305328369] },
]

// Roof pieces — one Z-oriented piece over the Z-run (matching NORMAL_ROOF_WIDTH),
// one X-oriented piece over the wide part of the X-run (matching the
// X-run's own z-span, outer to inner wall outer faces), and one narrow
// X-oriented piece over the final connector + jogs (matching
// NORMAL_ROOF_WIDTH again, since that's the same magnitude). The Z-run
// piece is extended 1m past the X-run's own edge at the corner the same
// way the walls are, so the two flat caps overlap solidly instead of just
// sharing an x/z range.
const NORMAL_Z_ROOF_WIDTH = 22.11415958404541 // same magnitude as NORMAL_ROOF_WIDTH — (NORMAL_HALF + 1) * 2

export const STAGE8_ROOFS = [
  { name: 'Stage8Roof.zRun', position: [NORMAL_ROOF_X, ROOF_Y, 1003.0501706525683], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 27.891912952065468] },
  { name: 'Stage8Roof.xRunWide', position: [-58.61593433171511, ROOF_Y, 1003.05908203125], size: [139.31812278330327, ROOF_HEIGHT, 27.87409019470215] },
  { name: 'Stage8Roof.xRunNarrow', position: [-129.70920058786868, ROOF_Y, 1003.05908203125], size: [2.8684097290039006, ROOF_HEIGHT, NORMAL_Z_ROOF_WIDTH] }, // final connectors + both jogs
]

// No STAGE8_DOOR_FILLS export — StageWall.008 and StageWall.009 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
