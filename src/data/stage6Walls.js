// Guard-wall container for the Stage6 -> Stage7 corridor (StageWall.006's
// far face through StageWall.007's near face), continuing the pattern from
// data/stage2Walls.js through data/stage5Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows. Checked against Blender/world.blend: GroundBlock.005
// (Stage6) holds Ground.028 (already covered by data/stage5Walls.js's own
// wide lane), then a central path — Ground.031 (narrow, 13.8 wide) ->
// Ground.032/.034 (medium, 23.47 wide, both centered near x -1.7) ->
// Ground.035 (narrow-ish, 12.4 wide) -> Ground.030 (medium-wide, 24.47
// wide) -> Ground.042 (wide, the same 33.651187896728516m width as
// Ground.010/.013/.015/.024/.028) leading up to StageWall.007 — plus two
// side platforms well off that central path: Ground.029 (x ~21-38) and
// Ground.033 (x ~-44 to -21), overlapping the central path's z-range but
// not aligned with it. No "SideWall" collection here either, so this
// whole file is hand-authored like the others.
//
// Ground.029/.033 don't get their own bulge or get walled out — per the
// user, this container uses one wide PERIMETER room (like data/
// stage4Walls.js's jump-section room) spanning the combined footprint of
// Ground.029, .032, .033 and .034 (x roughly -44.4 to +37.6) plus the
// usual 3m clearance margin, applied symmetrically (sized to the larger
// of the two extents) rather than an asymmetric fit — same approach as
// Stage4's own perimeter, for consistency.
//
// On request, that PERIMETER width also carries straight through
// Ground.031 and Ground.035's own z-ranges rather than pinching down to
// their own (much narrower) footprint right before/after the perimeter
// zone proper — both sit immediately adjacent to it, so the walls just
// stay at PERIMETER width the whole way from StageWall.006's far face
// through to where Ground.030 begins, rather than narrow-then-widen-
// then-narrow again for two short stretches sandwiched right next to the
// already-wide room. Ground.030/Ground.042 (further out, not adjacent to
// the perimeter zone) still get their own snugly-fit lanes, same "hug the
// floor, 0.5m margin" treatment as every other non-perimeter lane in this
// project.
//
// No WinPad in this stretch — Blender's Stage7 collection has a
// "WinPad.001" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory), so there's
// nothing here needing a clearance bulge.
//
// No flat "connect at the panel" segment right after StageWall.006 —
// Ground.031's own floor starts at z 628.149, essentially at (very
// slightly before) StageWall.006's far face (628.300), the same situation
// data/stage3Walls.js's ramp was in: jogQ sits right at the panel and
// immediately widens into the perimeter lane. Approaching StageWall.007
// there's room again (Ground.042 runs well past containerEnd), so the
// final segment reuses the usual short 2m normal-lane connector.
//
// WALL_HEIGHT/WALL_Y: StageWall.006 and StageWall.007 share the exact
// same y (23.43892478942871) — same situation as data/stage5Walls.js — so
// both panels' own tops are identical (29.16122007369995), no
// Giant_Ball-style hard constraint in this stretch, and neither boundary
// needs a STAGE N_DOOR_FILLS entry. Still spans down to WATER_Y (0), no
// bottom cap, same as every other container.
const WATER_Y = 0
const ROOM_TOP = 29.16122007369995
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const NORMAL_LEFT = -10.071032524108887 // same lane as every other container
const NORMAL_RIGHT = 10.043127059936523
const WIDE_LEFT = -15.325593948364258 // fit to Ground.042's own 33.651187896728516m-wide floor, same value as data/stage2Walls.js's WIDE lane
const WIDE_RIGHT = 15.325593948364258
const MEDIUM_HALF = 10.733611106872559 // fit to Ground.030's own 24.467222213745117m-wide floor: 24.467222213745117/2 - 0.5 - 1
const MEDIUM_LEFT = -MEDIUM_HALF
const MEDIUM_RIGHT = MEDIUM_HALF
const PERIM_HALF = 47.447004318237305 // Ground.029/.032/.033/.034's combined footprint (max half-extent 44.447004318237305, from Ground.033) + 3m clearance margin
const PERIM_LEFT = -PERIM_HALF
const PERIM_RIGHT = PERIM_HALF

export const STAGE6_SEGMENTS = [
  // Perimeter room — carries through Ground.031, Ground.029/.032/.033/.034, and Ground.035 at one constant width (see header comment).
  { name: 'Stage6Wall.perimeter.right', position: [PERIM_RIGHT, WALL_Y, 686.7917946740986], size: [2, WALL_HEIGHT, 115.24710618555548] },
  { name: 'Stage6Wall.perimeter.left', position: [PERIM_LEFT, WALL_Y, 686.7917946740986], size: [2, WALL_HEIGHT, 115.24710618555548] },
  // Ground.030's medium lane.
  { name: 'Stage6Wall.medium.right', position: [MEDIUM_RIGHT, WALL_Y, 754.4095375537872], size: [2, WALL_HEIGHT, 18.2515601158143] },
  { name: 'Stage6Wall.medium.left', position: [MEDIUM_LEFT, WALL_Y, 754.4095375537872], size: [2, WALL_HEIGHT, 18.2515601158143] },
  // Ground.042's wide lane, hugging its own edges (same treatment as Ground.010/.015/.024/.028) — no WinPad to clear here.
  { name: 'Stage6Wall.g042.right', position: [WIDE_RIGHT, WALL_Y, 777.9270080164074], size: [2, WALL_HEIGHT, 27.046561351418518] },
  { name: 'Stage6Wall.g042.left', position: [WIDE_LEFT, WALL_Y, 777.9270080164074], size: [2, WALL_HEIGHT, 27.046561351418518] },
  // Final normal-lane connector, flush with StageWall.007's near face.
  { name: 'Stage6Wall.final.right', position: [NORMAL_RIGHT, WALL_Y, 793.3186984211206], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage6Wall.final.left', position: [NORMAL_LEFT, WALL_Y, 793.3186984211206], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same perpendicular-stub idea as every other
// container's jogs, lettered on from data/stage5Walls.js's O/P (R/S are
// retired — they used to bracket the now-removed Ground.031/Ground.035
// narrow lanes; Q/T absorbed their jobs once those lanes widened into the
// perimeter). jogQ: normal lane -> perimeter, right at StageWall.006's far
// face. jogT: perimeter -> medium, at the Ground.035/Ground.030 seam. jogU:
// medium -> wide, at the Ground.030/Ground.042 overlap. jogV: wide ->
// normal, before the final connector.
export const STAGE6_JOGS = [
  { name: 'Stage6Jog.Q.right', position: [28.745065689086914, WALL_Y, 628.7340367168188], size: [37.40387725830078, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.Q.left', position: [-28.759018421173096, WALL_Y, 628.7340367168188], size: [37.37597179412842, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.T.right', position: [29.09030771255493, WALL_Y, 744.8495526313782], size: [36.713393211364746, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.T.left', position: [-29.09030771255493, WALL_Y, 744.8495526313782], size: [36.713393211364746, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.U.right', position: [13.029602527618408, WALL_Y, 763.9695224761963], size: [4.591982841491699, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.U.left', position: [-13.029602527618408, WALL_Y, 763.9695224761963], size: [4.591982841491699, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.V.right', position: [12.68436050415039, WALL_Y, 791.8844935566187], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage6Jog.V.left', position: [-12.698313236236572, WALL_Y, 791.8844935566187], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
]

// Roof pieces — merged with their adjoining jog(s) wherever the jog's own
// max outer extent matches the wider neighbor's width exactly (same
// approach as every other container's roof list). jogQ and jogT both now
// reach widest toward PERIMETER (wider than either NORMAL or MEDIUM on
// their other side), so both merge into that one roof piece, which now
// spans all the way from StageWall.006's far face to the Ground.035/
// Ground.030 seam. jogU/jogV still reach widest toward WIDE.
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // same as data/stage2Walls.js's WIDE_ROOF_WIDTH
const WIDE_ROOF_X = 0
const MEDIUM_ROOF_WIDTH = 23.467222213745117 // MEDIUM_LEFT/.RIGHT outer faces
const MEDIUM_ROOF_X = 0
const PERIM_ROOF_WIDTH = 96.89400863647461 // PERIM_LEFT/.RIGHT outer faces
const PERIM_ROOF_X = 0

export const STAGE6_ROOFS = [
  { name: 'Stage6Roof.perimeter', position: [PERIM_ROOF_X, ROOF_Y, 686.7917946740985], size: [PERIM_ROOF_WIDTH, ROOF_HEIGHT, 116.98392564356323] }, // jogQ + perimeter (incl. Ground.031/.035) + jogT
  { name: 'Stage6Roof.medium', position: [MEDIUM_ROOF_X, ROOF_Y, 754.4095375537872], size: [MEDIUM_ROOF_WIDTH, ROOF_HEIGHT, 18.2515601158143] }, // Ground.030's lane
  { name: 'Stage6Roof.g042', position: [WIDE_ROOF_X, ROOF_Y, 777.9270080164075], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 28.783380809426262] }, // jogU + Ground.042 + jogV
  { name: 'Stage6Roof.final', position: [NORMAL_ROOF_X, ROOF_Y, 793.3186984211206], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // final segment
]

// No STAGE6_DOOR_FILLS export — StageWall.006 and StageWall.007 share the
// same panel top, and ROOM_TOP is set to exactly that, so there's no gap
// to fill at either end of this container (see the WALL_HEIGHT comment
// above).
