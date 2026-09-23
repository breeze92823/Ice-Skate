// Road overlay across the elevated island (level layout is code, not a
// Blender file — see hub.js). Modeled on Laser-Escape's data/road.js +
// components/Road.jsx: ROAD_WAYPOINTS is a hand-edited polyline, and
// Road.jsx walks consecutive pairs to draw one straight ribbon segment per
// pair, merged into a single BufferGeometry. This is the one place to
// change the route — add a waypoint to bend the road or branch it, move one
// to reshape a stretch. The default two points below reproduce the old
// single straight strip through the spawn point (34m along Z, centered on
// SPAWN), sized to fit inside Ground.jsx's island footprint with a margin
// of open water at each end.
//
// Each waypoint is {x, z, width?, color?} in world metres. width/color
// default to ROAD_WIDTH/ROAD_COLOR below when omitted; Road.jsx lerps
// either across a segment when a waypoint sets one, so the road can taper
// and/or tint gradually — repeat an {x, z} pair with a different
// width/color to switch instantly instead of lerping.
export const ROAD_WAYPOINTS = [
  { x: 0, z: -17 },
  { x: 0, z: 17 },
]

export const ROAD_WIDTH = 10 // metres, kerb to kerb — default; see waypoint width override
export const ROAD_Y_OFFSET = 0.02 // above Ground.jsx's plane, avoids z-fighting
export const ROAD_CELL = 1 // metres per tread-pad cell

export const ROAD_COLOR = '#f0900f' // base orange plate — default; see waypoint color override
export const ROAD_COLOR_DARK = '#c56d0a' // tread-pad outline shade
export const ROAD_CURB_LIGHT = '#c9cdd2' // kerb strip, light segment
export const ROAD_CURB_DARK = '#797f87' // kerb strip, dark segment
export const ROAD_CURB_WIDTH = 0.6 // metres, each kerb strip — baked at ROAD_WIDTH's proportion, so a waypoint's width override scales it along with the road
