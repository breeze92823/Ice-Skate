// Guard-wall container for the Stage7 -> Stage8 corridor (StageWall.007's
// far face through StageWall.008's near face), continuing the pattern from
// data/stage2Walls.js through data/stage6Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows. Checked against Blender/world.blend: GroundBlock.006
// (Stage7) is a cluster of rotated pillar platforms (Ground.037/.038/.039/
// .041/.043/.044/.045, each 19x19, yawed at various angles — this is the
// same collection whose header comment in data/groundBlocks.js documents
// the rotationY convention) plus two larger unrotated blocks (Ground.036,
// Ground.040), combined footprint x roughly -32.5 to +21.5, z roughly
// 794.87-957.90 (essentially the entire container, right from
// StageWall.007's far face) — then Ground.046 (a wide slab, the same
// 33.651187896728516m width as Ground.010/.013/.015/.024/.028/.042)
// leading up to StageWall.008. No "SideWall" collection here either, so
// this whole file is hand-authored like the others.
//
// Same "outer perimeter room" treatment as data/stage4Walls.js's jump
// section and data/stage6Walls.js's side platforms — by this point that's
// the established default for a scattered/rotated platform cluster with
// no single lane to hug, rather than re-asking each time: one wide room
// sized to the cluster's combined footprint (max half-extent
// 32.49771926418187, from Ground.039) plus the usual 3m clearance margin,
// applied symmetrically. Ground.046, past the cluster, gets its own
// snugly-fit wide lane instead, same "hug the floor, 0.5m margin"
// treatment as every other non-perimeter lane in this project.
//
// No WinPad in this stretch — Blender's Stage8 collection has a
// "WinPad.007" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory), so
// there's nothing here needing a clearance bulge.
//
// No flat "connect at the panel" segment right after StageWall.007 —
// the pillar cluster starts at z 794.873, essentially right at
// StageWall.007's far face (794.546, only ~0.33m of clearance) — same
// situation as data/stage3Walls.js's ramp and data/stage6Walls.js's
// Ground.031: jogW sits right at the panel and immediately widens into
// the perimeter lane. Approaching StageWall.008 there's room again
// (Ground.046 runs well past containerEnd), so the final segment reuses
// the usual short 2m normal-lane connector.
//
// WALL_HEIGHT/WALL_Y: StageWall.007 and StageWall.008 share the exact
// same y (23.43892478942871) — same situation as data/stage5Walls.js and
// data/stage6Walls.js — so both panels' own tops are identical
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
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const NORMAL_LEFT = -10.071032524108887 // same lane as every other container
const NORMAL_RIGHT = 10.043127059936523
const WIDE_LEFT = -15.325593948364258 // fit to Ground.046's own 33.651187896728516m-wide floor, same value as data/stage2Walls.js's WIDE lane
const WIDE_RIGHT = 15.325593948364258
const PERIM_HALF = 35.49771926418187 // pillar cluster's combined footprint (max half-extent 32.49771926418187, from Ground.039) + 3m clearance margin
const PERIM_LEFT = -PERIM_HALF
const PERIM_RIGHT = PERIM_HALF

export const STAGE7_SEGMENTS = [
  // Perimeter room around the Ground.036-045 pillar cluster (minus Ground.042, already covered by data/stage6Walls.js).
  { name: 'Stage7Wall.perimeter.right', position: [PERIM_RIGHT, WALL_Y, 876.3117436334492], size: [2, WALL_HEIGHT, 161.79506074488165] },
  { name: 'Stage7Wall.perimeter.left', position: [PERIM_LEFT, WALL_Y, 876.3117436334492], size: [2, WALL_HEIGHT, 161.79506074488165] },
  // Ground.046's wide lane, hugging its own edges (same treatment as Ground.010/.015/.024/.028) — no WinPad to clear here.
  { name: 'Stage7Wall.g046.right', position: [WIDE_RIGHT, WALL_Y, 972.0431915357708], size: [2, WALL_HEIGHT, 27.93101560175421] },
  { name: 'Stage7Wall.g046.left', position: [WIDE_LEFT, WALL_Y, 972.0431915357708], size: [2, WALL_HEIGHT, 27.93101560175421] },
  // Final normal-lane connector, flush with StageWall.008's near face.
  { name: 'Stage7Wall.final.right', position: [NORMAL_RIGHT, WALL_Y, 987.8771090656519], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage7Wall.final.left', position: [NORMAL_LEFT, WALL_Y, 987.8771090656519], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same perpendicular-stub idea as every other
// container's jogs, lettered on from data/stage6Walls.js's Q/T/U/V.
// jogW: normal lane -> perimeter, right at StageWall.007's far face. jogX:
// perimeter -> Ground.046's wide lane, at the cluster/Ground.046 seam.
// jogY: wide -> normal, before the final connector.
export const STAGE7_JOGS = [
  { name: 'Stage7Jog.W.right', position: [22.770423162059195, WALL_Y, 794.9800083965063], size: [25.454592204245344, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage7Jog.W.left', position: [-22.784375894145377, WALL_Y, 794.9800083965063], size: [25.42668674007298, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage7Jog.X.right', position: [25.411656606273063, WALL_Y, 957.6434788703918], size: [20.17212531581761, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage7Jog.X.left', position: [-25.411656606273063, WALL_Y, 957.6434788703918], size: [20.17212531581761, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage7Jog.Y.right', position: [12.68436050415039, WALL_Y, 986.44290420115], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage7Jog.Y.left', position: [-12.698313236236572, WALL_Y, 986.44290420115], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
]

// Roof pieces — merged with their adjoining jog(s) wherever the jog's own
// max outer extent matches the wider neighbor's width exactly (same
// approach as every other container's roof list). jogW/jogX both reach
// widest toward PERIMETER, so both merge into that one roof piece
// (spanning from StageWall.007's far face straight through to the
// Ground.046 seam); jogY reaches widest toward WIDE.
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // same as data/stage2Walls.js's WIDE_ROOF_WIDTH
const WIDE_ROOF_X = 0
const PERIM_ROOF_WIDTH = 72.99543852836374 // PERIM_LEFT/.RIGHT outer faces
const PERIM_ROOF_X = 0

export const STAGE7_ROOFS = [
  { name: 'Stage7Roof.perimeter', position: [PERIM_ROOF_X, ROOF_Y, 876.311743633449], size: [PERIM_ROOF_WIDTH, ROOF_HEIGHT, 163.5318802028894] }, // jogW + perimeter + jogX
  { name: 'Stage7Roof.g046', position: [WIDE_ROOF_X, ROOF_Y, 972.4773964002728], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 28.79942533075814] }, // Ground.046 + jogY
  { name: 'Stage7Roof.final', position: [NORMAL_ROOF_X, ROOF_Y, 987.8771090656519], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // final segment
]

// No STAGE7_DOOR_FILLS export — StageWall.007 and StageWall.008 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
