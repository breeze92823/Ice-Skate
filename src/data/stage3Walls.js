// Guard-wall container for the Stage3 -> Stage4 corridor (StageWall.003's
// far face through StageWall.004's near face), continuing the same pattern
// as data/stage2Walls.js. Checked against Blender/world.blend: the floor
// between the two stage walls is Ground.013's tail (already flush at
// StageWall.003 via data/stage2Walls.js's seg4b — nothing to add there),
// the tilted, hourglass-shaped Slope_Block ramp (Stage3 collection, bridges
// Ground.013 up to the elevated Ground.014), Ground.014 (a narrow "gate"
// slab, Stage3's GroundBlock.002), and Ground.015 (a wide slab, Stage4's
// GroundBlock.003 — this is where the game's own "Stage 4" spawn point is,
// data/stages.js, even though it's still short of StageWall.004). No
// "SideWall" collection for any of this, so — same as Stage2 — every piece
// here is hand-authored, not Blender-synced.
//
// Slope_Block's own collision entry (data/groundBlocks.js) models 5
// alternating narrow/wide bands (halfWidth 6.5/15.5) along the ramp's
// tilted local axis. Rather than mirroring every band, the guard walls
// here run one constant WIDE lane the whole way across the ramp, sized to
// its widest band (15.5) plus a small 0.3m clipping margin — simpler than
// tracking all 5 transitions, at the cost of not hugging the ramp's own
// narrower sections as tightly (deliberate simplification, confirmed with
// the user).
//
// No bottom cap and no floor-hugging tilt: every wall/jog/roof in this
// container is a plain flat (untilted) box spanning WALL_Y's full range,
// same as every other guard-wall container — see WALL_Y/WALL_HEIGHT below
// for why. This includes the ramp wall, which was originally tilted to
// match Slope_Block's own rise (SLOPE_BLOCK_ROTATION_X, same constant as
// data/groundBlocks.js) and visual-only (resolveSideWalls in
// playerMovement.js only handles unrotated AABBs). Once the walls had to
// grow tall enough to clear Giant_Ball's spawn (see WALL_HEIGHT), that
// 47.5m span already dwarfs the ramp's own ~18m rise at every point along
// its length, so hugging the ramp's surface no longer adds anything
// visually — dropping the tilt is a strict win: same coverage, simpler
// geometry, and the ramp wall now gets real AABB collision like everything
// else instead of being visual-only.
//
// WALL_Y/WALL_HEIGHT: the container's guard walls span from WATER_Y (data/
// hub.js, 0 — no need to go any lower, since falling below that is already
// the drowning case) up to just above Giant_Ball's own spawn point (data/
// giantBall.js, position.y 42.02785110473633 + radius 5.494345664978027 =
// 47.522196769714355, i.e. clearing the ball's full height, not just its
// center) — tall enough that the ball can't bounce/roll over the top
// anywhere along this corridor. Every wall/jog/roof height in this file
// derives from these two constants so the whole container stays one
// uniform height, same principle as every other container in this game.
const WATER_Y = 0
const GIANT_BALL_TOP_Y = 47.522196769714355
const WALL_HEIGHT = GIANT_BALL_TOP_Y - WATER_Y
const WALL_Y = (GIANT_BALL_TOP_Y + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2
const JOG_DEPTH = 0.8684097290039062 // matches data/sideWalls.js / data/stage2Walls.js's jog depth

const NORMAL_LEFT = -10.071032524108887 // same lane as data/sideWalls.js/data/stage2Walls.js
const NORMAL_RIGHT = 10.043127059936523
const NARROW_LEFT = -5.414370059967041 // fit to Ground.014's own 13.828740119934082m-wide floor: 13.828740119934082/2 - 0.5 - 1
const NARROW_RIGHT = 5.414370059967041
const WIDE_LEFT = -15.325593948364258 // fit to Ground.015's own 33.651187896728516m-wide floor, same formula/value as data/stage2Walls.js's WIDE lane (Ground.010 is the same width)
const WIDE_RIGHT = 15.325593948364258
const RAMP_WIDE_LEFT = -16.8 // ramp's widest band (15.5) + 0.3m clipping margin + 1m wall half-thickness
const RAMP_WIDE_RIGHT = 16.8

// Straight runs. z-ranges come from the floor seams (Ground.014<->
// Ground.015), the jogs bracketing the ramp (STAGE3_RAMP_JOGS below), and
// StageWall.003/.004's own faces.
//
// There's no flat "connect at the panel" segment before the ramp (unlike
// stage2Walls.js's seg0/jogF) — Slope_Block's own mesh already starts at
// z 272.441, essentially right at StageWall.003's far face (273.385), so
// there's no flat ground to put one on; STAGE3_RAMP_JOGS' jogG sits right
// at the panel instead and immediately begins widening into the ramp lane.
// On the StageWall.004 end there's no such constraint (Ground.015 runs
// well past containerEnd), so the final segment reuses the same short 2m
// normal-lane connector pattern as stage2Walls.js to keep the opening at
// StageWall.004 matching the panel's own space.
export const STAGE3_SEGMENTS = [
  // The ramp lane, between jogG (at StageWall.003's far face) and jogH (at Ground.014's own start).
  { name: 'Stage3Wall.ramp.right', position: [RAMP_WIDE_RIGHT, WALL_Y, 317.54919304102657], size: [2, WALL_HEIGHT, 86.59137069284913] },
  { name: 'Stage3Wall.ramp.left', position: [RAMP_WIDE_LEFT, WALL_Y, 317.54919304102657], size: [2, WALL_HEIGHT, 86.59137069284913] },
  // Ground.014's narrow gate, between the ramp lane's jogH and Ground.015's jogI.
  { name: 'Stage3Wall.g014.right', position: [NARROW_RIGHT, WALL_Y, 366.24335765838623], size: [2, WALL_HEIGHT, 9.060139083862282] },
  { name: 'Stage3Wall.g014.left', position: [NARROW_LEFT, WALL_Y, 366.24335765838623], size: [2, WALL_HEIGHT, 9.060139083862282] },
  // Ground.015's wide lane, hugging its own edges (same treatment as Ground.010 in data/stage2Walls.js) — this also naturally clears WinPad.004 (x -10.69305419921875, well inside this lane's ~14.3 inner face) without needing a separate bulge.
  { name: 'Stage3Wall.g015.right', position: [WIDE_RIGHT, WALL_Y, 385.28797565251587], size: [2, WALL_HEIGHT, 27.292277446389164] },
  { name: 'Stage3Wall.g015.left', position: [WIDE_LEFT, WALL_Y, 385.28797565251587], size: [2, WALL_HEIGHT, 27.292277446389164] },
  // Final normal-lane connector, flush with StageWall.004's near face.
  { name: 'Stage3Wall.final.right', position: [NORMAL_RIGHT, WALL_Y, 400.8025241047144], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage3Wall.final.left', position: [NORMAL_LEFT, WALL_Y, 400.8025241047144], size: [2, WALL_HEIGHT, 2] },
]

// Elbow connectors — same perpendicular-stub idea as data/sideWalls.js's
// SIDE_WALL_JOGS / data/stage2Walls.js's STAGE2_JOGS.
// jogG: right at StageWall.003's far face, normal lane -> ramp-wide.
// jogH: at Ground.014's own start, ramp-wide -> Ground.014's narrow lane.
// jogI: at the Ground.014/Ground.015 floor seam, narrow -> wide.
// jogJ: before the final segment, wide -> normal lane (approaching StageWall.004).
export const STAGE3_RAMP_JOGS = [
  { name: 'Stage3Jog.G.right', position: [13.421563529968262, WALL_Y, 273.8193028301001], size: [6.756872940063477, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.G.left', position: [-13.435516262054444, WALL_Y, 273.8193028301001], size: [6.728967475891114, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.H.right', position: [11.10718502998352, WALL_Y, 361.2790832519531], size: [11.38562994003296, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.H.left', position: [-11.10718502998352, WALL_Y, 361.2790832519531], size: [11.38562994003296, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.I.right', position: [10.36998200416565, WALL_Y, 371.20763206481934], size: [9.911223888397217, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.I.left', position: [-10.36998200416565, WALL_Y, 371.20763206481934], size: [9.911223888397217, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.J.right', position: [12.68436050415039, WALL_Y, 399.36831924021243], size: [5.282466888427734, WALL_HEIGHT, JOG_DEPTH] },
  { name: 'Stage3Jog.J.left', position: [-12.698313236236572, WALL_Y, 399.36831924021243], size: [5.254561424255371, WALL_HEIGHT, JOG_DEPTH] },
]

// Roof pieces — merged with their adjoining jog(s) wherever the jog's own
// max outer extent matches the wider neighbor's width exactly (same
// approach as data/stage2Walls.js's Stage2Roof.2), which cuts this down
// from 8 candidate pieces to 4.
const NARROW_ROOF_WIDTH = 12.828740119934082 // NARROW_LEFT/.RIGHT outer faces
const NARROW_ROOF_X = 0
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // same as data/stage2Walls.js's WIDE_ROOF_WIDTH (Ground.010/.015 share a width)
const WIDE_ROOF_X = 0
const RAMP_ROOF_WIDTH = 35.6 // RAMP_WIDE_LEFT/.RIGHT outer faces

export const STAGE3_ROOFS = [
  { name: 'Stage3Roof.ramp', position: [0, ROOF_Y, 317.54919304102657], size: [RAMP_ROOF_WIDTH, ROOF_HEIGHT, 88.32819015085698] }, // jogG + ramp lane + jogH
  { name: 'Stage3Roof.0', position: [NARROW_ROOF_X, ROOF_Y, 366.24335765838623], size: [NARROW_ROOF_WIDTH, ROOF_HEIGHT, 9.060139083862282] }, // Ground.014
  { name: 'Stage3Roof.1', position: [WIDE_ROOF_X, ROOF_Y, 385.28797565251587], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 29.02909690439703] }, // jogI + Ground.015 + jogJ
  { name: 'Stage3Roof.2', position: [NORMAL_ROOF_X, ROOF_Y, 400.8025241047144], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2] }, // final segment
]

// Door-top infill above StageWall.003/.004's own glass panels (data/
// stageWalls.js — both only 11.44459056854248m tall, sitting at y
// 11.1223726272583 / 25.05631446838379 respectively) — this container's
// room is now 47.5m tall (WALL_HEIGHT, for Giant_Ball), so the panels
// alone leave a large open gap above them, from each panel's own top up to
// the room's ceiling. StageWall.002 (Stage1/Stage2's boundary) doesn't
// need this: those containers kept their original ~16.75m height, which
// already lands almost exactly on that panel's own top. Solid (not glass,
// unlike the panel it sits above) so it actually reads as sealing the gap
// rather than more see-through door — same studded guard-wall material as
// the rest of this container.
//
// First pass sized this to just the panel's own width/depth
// (18.4655818939209 / 0.22710511088371277) and left a real gap: the
// neighboring guard walls don't reach into that thin 0.227m z-slice at
// all (data/stage2Walls.js's final segment ends at StageWall.003's near
// face, 273.158; this container's own jogG only starts at its far face,
// 273.385) — so a fill sized to just the door leaves an actual hole in
// 3D space between its own edges and wherever wall coverage picks back up
// again, above the glass panel's ~16.84m top where nothing else covers it.
// Fixed the same way every other seam in this container is closed:
//   - width: widened to NORMAL_ROOF_WIDTH/.X (the walls' own outer-face
//     span, same constants the roof pieces use), rather than the door's
//     own slightly-narrower width, so the fill's edges land past both
//     neighboring walls' inner faces.
//   - depth: widened to the door's own 0.22710511088371277 plus a 0.3m
//     OVERLAP into each neighbor (same convention as every jog/beam in
//     this project), so it genuinely intersects the neighboring wall
//     geometry in z instead of just sitting in the same x-range as an
//     unconnected slab.
// Registered in playerMovement.js's collision alongside STAGE3_SEGMENTS/
// STAGE3_RAMP_JOGS, same as everything else solid here.
const DOOR_FILL_WIDTH = NORMAL_ROOF_WIDTH
const DOOR_FILL_X = NORMAL_ROOF_X
const DOOR_FILL_DEPTH = 0.22710511088371277 + 0.3 * 2

export const STAGE3_DOOR_FILLS = [
  { name: 'Stage3DoorFill.003', position: [DOOR_FILL_X, 32.18343234062195, 273.27154541015625], size: [DOOR_FILL_WIDTH, 30.677528858184814, DOOR_FILL_DEPTH] },
  { name: 'Stage3DoorFill.004', position: [DOOR_FILL_X, 39.15040326118469, 401.91607666015625], size: [DOOR_FILL_WIDTH, 16.743587017059326, DOOR_FILL_DEPTH] },
]
