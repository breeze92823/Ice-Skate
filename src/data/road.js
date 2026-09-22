// Road overlay across the elevated island (level layout is code, not a
// Blender file — see hub.js). A single straight strip through the spawn
// point, sized to fit inside Ground.jsx's island footprint with a margin of
// open water at each end, giving the skater a lane to follow.
export const ROAD_WIDTH = 10 // metres, kerb to kerb
export const ROAD_LENGTH = 34 // metres, along Z, centered on SPAWN
export const ROAD_Y_OFFSET = 0.02 // above Ground.jsx's plane, avoids z-fighting
export const ROAD_CELL = 1 // metres per tread-pad cell

export const ROAD_COLOR = '#f0900f' // base orange plate
export const ROAD_COLOR_DARK = '#c56d0a' // tread-pad outline shade
export const ROAD_CURB_LIGHT = '#c9cdd2' // kerb strip, light segment
export const ROAD_CURB_DARK = '#797f87' // kerb strip, dark segment
export const ROAD_CURB_WIDTH = 0.6 // metres, each kerb strip
