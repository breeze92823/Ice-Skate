import { TREADMILL_POSITION } from './hub.js'
import { TREADMILLS } from './treadmill.js'
import { SKATE_RACK_POSITION } from './skateRack.js'
import { LEADERBOARD_INSTANCES } from './leaderboard.js'

// Road overlay across the elevated island (level layout is code, not a
// Blender file — see hub.js). Modeled on Laser-Escape's data/road.js +
// components/Road.jsx: each path below is a hand-edited polyline, and
// Road.jsx walks consecutive pairs to draw one straight ribbon segment per
// pair, merging every path into a single BufferGeometry (one draw call).
// This is the one place to change the route:
//   - Bend/extend the main road: add, move, or remove a waypoint in
//     ROAD_WAYPOINTS.
//   - Add a branch/spur: export a new `NAME_WAYPOINTS` array (2+ points,
//     same shape) below, then add it to ROAD_PATHS — no component change
//     needed. Keep a spur as its own array rather than appending it to
//     ROAD_WAYPOINTS, so it doesn't draw a stray segment jumping back to the
//     main road's next waypoint. If a spur must land exactly on another
//     prop's edge (a doorway, a stair landing), derive that point from the
//     other prop's data file instead of hand-guessing the coordinate.
//   - Taper width or tint color along a stretch: set width/color on the
//     endpoints of interest; leave interior points unset to lerp between
//     them.
//   - Instant (non-lerped) switch: repeat an {x, z} pair with a different
//     width/color — Road.jsx skips the resulting zero-length segment.
//
// Each waypoint is {x, z, width?, color?} in world metres. width/color
// default to ROAD_WIDTH/ROAD_COLOR below when omitted.
export const ROAD_WAYPOINTS = [
  { x: 0, z: -17 },
  { x: 0, z: 21 },
]

export const ROAD_WIDTH = 10 // metres, kerb to kerb — default; see waypoint width override
export const ROAD_SPUR_WIDTH = 5 // metres — narrower feeder width for branches off the main road
export const ROAD_Y_OFFSET = 0.02 // above Ground.jsx's plane, avoids z-fighting
export const ROAD_CELL = 1 // metres per tread-pad cell

// Shared branch reference for the south-side spurs below — the main road's
// own south end. The ribbon-extrusion technique has no miter joints, so a
// spur whose centerline starts exactly on the main road's own centerline
// would double-draw the area where the two ribbons' half-widths overlap
// (visible as z-fighting / a texture-direction seam). ROAD_SPUR_JOIN_Z
// offsets that shared start south by half a spur's width so each spur's
// ribbon begins flush against the main road's south cap edge instead —
// touching it exactly, with neither a gap nor an overlap.
const ROAD_SOUTH_END = ROAD_WAYPOINTS[0]
const ROAD_SPUR_JOIN_Z = ROAD_SOUTH_END.z - ROAD_SPUR_WIDTH / 2

// Targets derived from each prop's own data file (not hand-guessed), so a
// spur keeps landing on its prop if that prop's position/layout ever moves.
const TREADMILL_ROW_X = TREADMILLS.reduce((sum, t) => sum + t.position[0], 0) / TREADMILLS.length
const TREADMILL_ROW_Z = TREADMILL_POSITION[2]
const LEADERBOARD_TARGET = LEADERBOARD_INSTANCES[Math.floor(LEADERBOARD_INSTANCES.length / 2)].position // centered on the middle board
// +1/-1 for which side of the main road the rack sits on, so the spur's
// start flushes against that edge regardless of which side it's ever moved to.
const SKATE_RACK_SIDE = Math.sign(SKATE_RACK_POSITION[0]) || 1

// Skate rack's own Z already falls inside the main road's straight run
// (x=0, z from -17 to 17), so this spur branches straight off that ribbon's
// side with no bend — one segment out to the rack. Starting at the main
// road's own edge (± half its width), not its centerline, keeps the two
// ribbons flush instead of overlapping (see ROAD_SPUR_JOIN_Z above).
export const ROAD_SPUR_SKATE_RACK_WAYPOINTS = [
  { x: SKATE_RACK_SIDE * (ROAD_WIDTH / 2), z: SKATE_RACK_POSITION[2], width: ROAD_SPUR_WIDTH },
  { x: SKATE_RACK_POSITION[0], z: SKATE_RACK_POSITION[2], width: ROAD_SPUR_WIDTH },
]

// Treadmill row sits south of the main road's own span, so this spur bends
// once at the south end: east to the row's own (derived) center X, then
// south to the row's Z.
export const ROAD_SPUR_TREADMILL_WAYPOINTS = [
  { x: ROAD_SOUTH_END.x, z: ROAD_SPUR_JOIN_Z, width: ROAD_SPUR_WIDTH },
  { x: TREADMILL_ROW_X, z: ROAD_SPUR_JOIN_Z, width: ROAD_SPUR_WIDTH },
  { x: TREADMILL_ROW_X, z: TREADMILL_ROW_Z, width: ROAD_SPUR_WIDTH },
]

// Leaderboard row sits west and south of the main road, so this spur bends
// once at the south end: west to the boards' own X, then south to the
// middle board's Z.
export const ROAD_SPUR_LEADERBOARD_WAYPOINTS = [
  { x: ROAD_SOUTH_END.x, z: ROAD_SPUR_JOIN_Z, width: ROAD_SPUR_WIDTH },
  { x: LEADERBOARD_TARGET[0], z: ROAD_SPUR_JOIN_Z, width: ROAD_SPUR_WIDTH },
  { x: LEADERBOARD_TARGET[0], z: LEADERBOARD_TARGET[2], width: ROAD_SPUR_WIDTH },
]

// All paths Road.jsx renders, main route first. Push a new NAME_WAYPOINTS
// array here to add a branch.
export const ROAD_PATHS = [
  ROAD_WAYPOINTS,
  ROAD_SPUR_SKATE_RACK_WAYPOINTS,
  ROAD_SPUR_TREADMILL_WAYPOINTS,
  ROAD_SPUR_LEADERBOARD_WAYPOINTS,
]

export const ROAD_COLOR = '#f0900f' // base orange plate — default; see waypoint color override
export const ROAD_COLOR_DARK = '#c56d0a' // tread-pad outline shade
export const ROAD_CURB_LIGHT = '#c9cdd2' // kerb strip, light segment
export const ROAD_CURB_DARK = '#797f87' // kerb strip, dark segment
export const ROAD_CURB_WIDTH = 0.6 // metres, each kerb strip — baked at ROAD_WIDTH's proportion, so a waypoint's width override scales it along with the road
