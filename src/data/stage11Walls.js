// Guard-wall container for the Stage11 -> Stage12 corridor (StageWall.011's
// far face through StageWall.012's near face), continuing the pattern from
// data/stage2Walls.js through data/stage10Walls.js — see
// GuardWallContainers.md at the repo root for the full build playbook this
// file follows.
//
// No new turn here (StageWall.012 shares StageWall.011's z, 1003.2493286132812,
// and the same rotationY, -1.5707963705062866) — the corridor keeps
// heading -X, same as data/stage9Walls.js/data/stage10Walls.js. Checked
// against Blender/world.blend (world-space vertex bounding boxes, same
// method as Gotcha #1): this whole container is the curved switchback
// Stage11 skate ramp (the "Ramp" collection, data/ramp.js — Ramp through
// Ramp.005 combined span x [-614.181, -366.464], z [987.512, 1018.637],
// y [103.097, 123.196]), starting right at StageWall.011, followed by
// GroundBlock.011/Stage12's Ground.056 (a rotated waypoint slab, x
// [-666.875, -635.537], z [986.360, 1020.011]) leading up to
// StageWall.012. There's a genuine ~21m stretch (x roughly -614 to -635)
// with no floor object in either collection — same "not built yet" status
// as data/stage10Walls.js's climb, not something these guard walls need to
// solve; they only bound the corridor, not the floor under it.
//
// Same "outer perimeter room" treatment as data/stage4Walls.js's jump
// section, data/stage6Walls.js's side platforms, and data/stage7Walls.js's
// pillar cluster — established default for a stretch with no single lane
// to hug (here, a curved multi-segment ramp whose own combined z-sweep,
// half-width 16.9522094726562, is already wider than this project's usual
// NORMAL_HALF). One wide room, constant the whole container length, sized
// to the wider of the ramp's or Ground.056's combined footprint (Ground.056
// is the binding constraint, its far edge 16.9522094726562 from the shared
// Z_CENTER) plus the usual 3m clearance margin, applied symmetrically —
// same margin formula as data/stage7Walls.js's PERIM_HALF.
//
// Both StageWall.011 and StageWall.012 (verified via Blender) share the
// same own half-width, 9.232788085937505 — much narrower than PERIM_HALF,
// and with almost no clearance in front of either one (~0.145m before
// StageWall.011, ~0.226m before StageWall.012), same "starts right at the
// panel" situation as data/stage7Walls.js's pillar cluster. Gotcha #6:
// staying PERIM_HALF-wide all the way to each panel would leave the room
// floating past the panel's own narrower edges on both sides — a visible
// gap next to the door, not a connection. So each end gets a jog (same
// perpendicular-stub idea as every other container's, just sized to taper
// PANEL_HALF -> PERIM_HALF) sitting right at its panel, same as jogW in
// data/stage7Walls.js; no separate flat connector segment on either end,
// since there's no room for one.
//
// No WinPad clearance needed — Blender's Stage12 collection has a
// "WinPad.011" (not yet synced into data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS, per project-stage-layout memory) sitting on
// Ground.056's top, well inside this room's z-range (983.107-1023.011 vs
// the pad's own ~991.5-993.5), nowhere near a wall.
//
// WALL_HEIGHT/WALL_Y: the ramp's own peak (123.19618225097656, verified
// via Blender) pokes ~0.626m above StageWall.011's/StageWall.012's own top
// (122.5697455406189/122.56974792480469) — the original hard constraint,
// same situation as data/stage3Walls.js's Giant_Ball clearance. On
// request, ROOM_TOP is raised a further +20m on top of that (not just for
// an initial stretch — the whole container, panel to panel) for extra
// headroom the whole length. STAGE11_DOOR_FILLS closes the resulting
// (~20.626m) gap above StageWall.011's own top; StageWall.012 stays blank
// on request regardless of height (see the door-fill comment below).
// Still spans down to WATER_Y (0), no bottom cap, same as every other
// container.
const WATER_Y = 0
const ROOM_TOP = 123.19618225097656 + 20 // ramp-peak clearance + 20m extra headroom, on request, the whole container length
const WALL_HEIGHT = ROOM_TOP - WATER_Y
const WALL_Y = (ROOM_TOP + WATER_Y) / 2
const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2

const Z_CENTER = 1003.05908203125 // shared z-center for this whole X-run, same reference data/stage8Walls.js through data/stage10Walls.js used
const PERIM_HALF = 19.95220947265625 // Ground.056's combined footprint (max half-extent 16.9522094726562 from Z_CENTER) + 3m clearance margin
const PANEL_HALF = 9.232788085937505 // StageWall.011's/StageWall.012's own shared half-width, verified via Blender
const JOG_DEPTH = 0.8684097290039062 // matches every other container's jog depth

const NEAR_Z = Z_CENTER - PERIM_HALF
const FAR_Z = Z_CENTER + PERIM_HALF

// Main run, pulled back JOG_DEPTH from each panel to leave room for the
// tapering jog right at that panel.
const RUN_X = -516.4840545654297
const RUN_DEPTH = 298.59280090332027

export const STAGE11_SEGMENTS = [
  { name: 'Stage11Wall.near', position: [RUN_X, WALL_Y, NEAR_Z], size: [RUN_DEPTH, WALL_HEIGHT, 2] },
  { name: 'Stage11Wall.far', position: [RUN_X, WALL_Y, FAR_Z], size: [RUN_DEPTH, WALL_HEIGHT, 2] },
]

// Elbow connectors tapering PANEL_HALF -> PERIM_HALF, sitting right at
// each panel — same idea as data/stage7Walls.js's jogW, rotated to run
// along Z like every X-oriented container's jogs.
export const STAGE11_JOGS = [
  { name: 'Stage11Jog.011.near', position: [-366.7534492492676, WALL_Y, 988.4665832519531], size: [JOG_DEPTH, WALL_HEIGHT, 10.719421386718745] },
  { name: 'Stage11Jog.011.far', position: [-366.7534492492676, WALL_Y, 1017.6515808105469], size: [JOG_DEPTH, WALL_HEIGHT, 10.719421386718745] },
  { name: 'Stage11Jog.012.near', position: [-666.2146598815918, WALL_Y, 988.4665832519531], size: [JOG_DEPTH, WALL_HEIGHT, 10.719421386718745] },
  { name: 'Stage11Jog.012.far', position: [-666.2146598815918, WALL_Y, 1017.6515808105469], size: [JOG_DEPTH, WALL_HEIGHT, 10.719421386718745] },
]

// Roof stays PERIM_ROOF_WIDTH the whole way, including over both jogs —
// same as data/stage7Walls.js's Stage7Roof.perimeter (jogW + perimeter +
// jogX merged into one piece); the roof doesn't need to taper down to
// PANEL_HALF since nothing collides with it, and STAGE11_DOOR_FILLS
// already closes the height gap above StageWall.011.
const PERIM_ROOF_WIDTH = 41.9044189453125 // (PERIM_HALF + 1) * 2
const ROOF_RUN_X = -516.4840545654297
const ROOF_RUN_DEPTH = 300.3296203613281 // full container span, panel to panel (RUN_DEPTH + 2 * JOG_DEPTH)

export const STAGE11_ROOFS = [
  { name: 'Stage11Roof', position: [ROOF_RUN_X, ROOF_Y, Z_CENTER], size: [ROOF_RUN_DEPTH, ROOF_HEIGHT, PERIM_ROOF_WIDTH] },
]

// Door-top infill above StageWall.011's own glass — ROOM_TOP sits
// ~20.626m above the panel's own top now, so the fill is sized to that
// full gap. StageWall.012 stays blank on request (it's also the near end
// of data/stage12Walls.js, where the ceiling drops back to the panel's
// own height anyway, so the sliver of open space right at that seam is
// deliberate, not an oversight). Sized/overlapped the same corrected way
// as data/stage3Walls.js/data/stage4Walls.js's fills (own width matching
// the room's outer-face span, own depth = the door's 0.22710511088371277m
// thickness plus a 0.3m OVERLAP into the neighboring wall on each side).
const DOOR_FILL_WIDTH = 41.9044189453125 // same as PERIM_ROOF_WIDTH
const DOOR_FILL_DEPTH = 0.8271051108837127 // 0.22710511088371277 + 0.3 * 2

export const STAGE11_DOOR_FILLS = [
  { name: 'Stage11DoorFill.011', position: [-366.3192443847656, 132.88296389579773, Z_CENTER], size: [DOOR_FILL_DEPTH, 20.626436710357666, DOOR_FILL_WIDTH] },
]
