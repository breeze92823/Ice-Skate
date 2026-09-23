// Guard-wall container for the Stage4 -> Stage5 corridor (StageWall.004's
// far face through StageWall.005's near face), continuing the pattern from
// data/stage2Walls.js/data/stage3Walls.js. Checked against Blender: right
// after StageWall.004 the floor isn't a corridor at all — it's
// GroundBlock.003's Ground.016-023 cluster, 8 disconnected platforms at
// alternating x-offsets (a jump/gap section, not a walkable lane), spanning
// roughly x [-21.10, 22.01] / z [408.42, 478.49] — then Ground.024 (a wide
// slab, same 33.651187896728516m width as Ground.010/.013/.015), then
// StageWall.005. No "SideWall" collection here either, so this whole file
// is hand-authored.
//
// For the jump section, this doesn't try to wall in each platform (there's
// no single lane — the gaps between platforms are presumably the
// challenge). Instead it's one wide "room" perimeter sized to the whole
// cluster's combined footprint plus a 3m clearance margin (deliberately
// more generous than the 0.5m floor-edge margin used elsewhere in this
// project, since this is "give the player room to jump," not "hug a
// slab's edge") — confirmed with the user. The walls only stop the player
// flying off the outer edge; falling into a gap between platforms is
// unaffected (SIDE_WALL_COLLIDERS in playerMovement.js has never modeled
// the floor itself, only lateral boundaries).
//
// WALL_HEIGHT/WALL_Y: no Giant_Ball-style hard constraint drives this
// container's height the way it did data/stage3Walls.js, so it's sized to
// StageWall.004's own panel top instead (data/stageWalls.js, y
// 25.05631446838379 + half-height 5.72229528427124 = 30.77860975265503) —
// the taller of this container's two boundary panels (StageWall.005's own
// top is 29.16122007369995, 1.62m short of that), still spanning down to
// WATER_Y (0) with no bottom cap, same principle as every other container.
// Since StageWall.004's own panel top IS this container's ceiling, there's
// no gap to fill approaching it from this side (unlike data/stage3Walls.js's
// STAGE3_DOOR_FILLS, which exists because Stage3's own room is far taller
// than either of its boundary panels) — but StageWall.005's shorter panel
// still falls short of this ceiling by 1.62m, so STAGE4_DOOR_FILLS below
// closes that one gap.
const WATER_Y = 0
const ROOM_TOP = 30.77860975265503
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const NORMAL_LEFT = -10.071032524108887 // same lane as every other container
const NORMAL_RIGHT = 10.043127059936523
const WIDE_LEFT = -15.325593948364258 // fit to Ground.024's own 33.651187896728516m-wide floor, same value as data/stage2Walls.js's WIDE lane (Ground.010/.015 share this width)
const WIDE_RIGHT = 15.325593948364258
const PERIM_LEFT = -25.010193347930908 // Ground.016-023's combined footprint (max half-extent 22.010193347930908) + 3m clearance margin
const PERIM_RIGHT = 25.010193347930908

// Straight runs. seg0/jogK mirror data/stage3Walls.js's seg0/jogG (a short
// 2m normal-lane connector right at StageWall.004's far face, so this
// container's opening there matches the panel's own space, then widens);
// the final segment/jogM mirror data/stage3Walls.js's final segment/jogJ
// the same way approaching StageWall.005.
export const STAGE4_SEGMENTS = [
  // Short connector right after StageWall.004, flush with the panel's own space.
  { name: 'Stage4Wall.seg0.right', position: [NORMAL_RIGHT, WALL_Y, 403.0296292155981], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage4Wall.seg0.left', position: [NORMAL_LEFT, WALL_Y, 403.0296292155981], size: [2, WALL_HEIGHT, 2] },
  // Perimeter room around Ground.016-023's jump platforms.
  { name: 'Stage4Wall.perimeter.right', position: [PERIM_RIGHT, WALL_Y, 442.0729040309785], size: [2, WALL_HEIGHT, 74.34973017275297] },
  { name: 'Stage4Wall.perimeter.left', position: [PERIM_LEFT, WALL_Y, 442.0729040309785], size: [2, WALL_HEIGHT, 74.34973017275297] },
  // Ground.024's wide lane, hugging its own edges (same treatment as Ground.010/.015) — this also naturally clears WinPad.005 (x -10.69305419921875, well inside this lane's ~14.3 inner face) without needing a separate bulge.
  { name: 'Stage4Wall.g024.right', position: [WIDE_RIGHT, WALL_Y, 494.23712170869095], size: [2, WALL_HEIGHT, 28.24188572466403] },
  { name: 'Stage4Wall.g024.left', position: [WIDE_LEFT, WALL_Y, 494.23712170869095], size: [2, WALL_HEIGHT, 28.24188572466403] },
  // Final normal-lane connector, flush with StageWall.005's near face.
  { name: 'Stage4Wall.final.right', position: [NORMAL_RIGHT, WALL_Y, 510.2264743000269], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage4Wall.final.left', position: [NORMAL_LEFT, WALL_Y, 510.2264743000269], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same perpendicular-stub idea as every other
// container's jogs. jogK: normal lane -> perimeter, right after seg0.
// jogL: perimeter -> Ground.024's wide lane, at the jump cluster's own far
// edge. jogM: wide -> normal lane, before the final connector.
export const STAGE4_JOGS = [
  { name: 'Stage4Jog.K.right', position: [17.526660203933716, WALL_Y, 404.46383408010007], size: [14.967066287994385, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage4Jog.K.left', position: [-17.540612936019897, WALL_Y, 404.46383408010007], size: [14.939160823822021, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage4Jog.L.right', position: [20.167893648147583, WALL_Y, 479.68197398185697], size: [9.68459939956665, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage4Jog.L.left', position: [-20.167893648147583, WALL_Y, 479.68197398185697], size: [9.68459939956665, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage4Jog.M.right', position: [12.68436050415039, WALL_Y, 508.79226943552493], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage4Jog.M.left', position: [-12.698313236236572, WALL_Y, 508.79226943552493], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
]

// Roof pieces — merged with their adjoining jog(s) wherever the jog's own
// max outer extent matches the wider neighbor's width exactly (same
// approach as every other container's roof list).
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // same as data/stage2Walls.js's WIDE_ROOF_WIDTH
const WIDE_ROOF_X = 0
const PERIM_ROOF_WIDTH = 52.020386695861816 // PERIM_LEFT/.RIGHT outer faces
const PERIM_ROOF_X = 0

export const STAGE4_ROOFS = [
  { name: 'Stage4Roof.0', position: [NORMAL_ROOF_X, ROOF_Y, 403.0296292155981], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // seg0
  { name: 'Stage4Roof.perimeter', position: [PERIM_ROOF_X, ROOF_Y, 442.0729040309785], size: [PERIM_ROOF_WIDTH, ROOF_HEIGHT, 76.08576877075406] }, // jogK + perimeter + jogL
  { name: 'Stage4Roof.g024', position: [WIDE_ROOF_X, ROOF_Y, 494.6713265731929], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 29.11029545366797] }, // jogL far edge (jogL merges into the wider perimeter roof) + Ground.024 + jogM
  { name: 'Stage4Roof.final', position: [NORMAL_ROOF_X, ROOF_Y, 510.2264743000269], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // final segment
]

// Door-top infill above StageWall.005's own glass panel — same idea as
// data/stage3Walls.js's STAGE3_DOOR_FILLS: this container's ceiling
// (ROOM_TOP, matched to StageWall.004's own panel top) is 1.6173896789550781m
// taller than StageWall.005's own panel top (29.16122007369995), so a gap
// would otherwise sit above that door up to the ceiling. Sized/overlapped
// the same corrected way as the Stage3 fills (NORMAL_ROOF_WIDTH/.X, the
// door's own 0.22710511088371277m depth plus a 0.3m OVERLAP into the
// neighboring wall on each side) rather than just the door's own width, so
// it actually connects to the walls in 3D instead of floating in the same
// x-range as an unconnected slab. No matching fill needed at StageWall.004
// — this container's ceiling already sits exactly at that panel's own top.
const DOOR_FILL_WIDTH = NORMAL_ROOF_WIDTH
const DOOR_FILL_X = NORMAL_ROOF_X
const DOOR_FILL_DEPTH = 0.22710511088371277 + 0.3 * 2

export const STAGE4_DOOR_FILLS = [
  { name: 'Stage4DoorFill.005', position: [DOOR_FILL_X, 29.96991491317749, 511.34002685546875], size: [DOOR_FILL_WIDTH, 1.6173896789550781, DOOR_FILL_DEPTH] },
]
