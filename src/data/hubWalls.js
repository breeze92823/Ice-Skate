// Hub container — walls + roof sealing the entire main island (Ground.jsx,
// data/hub.js's ISLAND_WIDTH/ISLAND_DEPTH footprint) into one room, the same
// guard-wall/roof treatment GuardWallContainers.md describes for the
// corridors between two StageWall.NNN panels, just wrapped around the whole
// hub instead of a lane between two panels. StageWall.001 (data/stageWalls.js)
// is the room's only opening — the north wall is split into two flanking
// segments that stop flush at the door's own near face, leaving exactly its
// footprint open; west/east/south are solid runs hugging the island's raw
// edges (Step 1's "floor-hugging fit" rule: wall center inset by a 0.5m
// margin plus the wall's own 1m half-thickness, same formula as every other
// container in this project).
//
// Everything on top of the island (the Treadmills row, data/treadmill.js) is
// well inside this footprint and well under the roof (see ROOM_TOP below),
// so no bulge/jog is needed the way GLOW_FLOOR_PANEL clearance sometimes
// forces one in the stage corridors (data/sideWalls.js).
import { GROUND_Y, ISLAND_WIDTH, ISLAND_DEPTH, ISLAND_X, ISLAND_Z } from './hub.js'
import { STAGE_WALLS } from './stageWalls.js'

const DOOR = STAGE_WALLS.find((w) => w.name === 'StageWall.001')

const WALL_THICK = 2
const WALL_HALF = WALL_THICK / 2
const MARGIN = 0.5 // clearance the wall's own outer face keeps off the island's raw edge

const HALF_W = ISLAND_WIDTH / 2
const HALF_D = ISLAND_DEPTH / 2
const WEST_EDGE = ISLAND_X - HALF_W
const EAST_EDGE = ISLAND_X + HALF_W
const SOUTH_EDGE = ISLAND_Z - HALF_D

// Perimeter wall centerlines — Step 1's floor-hugging fit, applied to all
// three solid sides.
const EAST_X = EAST_EDGE - MARGIN - WALL_HALF
const WEST_X = WEST_EDGE + MARGIN + WALL_HALF
const SOUTH_Z = SOUTH_EDGE + MARGIN + WALL_HALF

// StageWall.001's own footprint — the north wall's only opening.
const DOOR_HALF_WIDTH = DOOR.size[0] / 2
const DOOR_NEAR_FACE = DOOR.position[2] - DOOR.size[2] / 2 // face on the island side
const DOOR_LEFT = DOOR.position[0] - DOOR_HALF_WIDTH
const DOOR_RIGHT = DOOR.position[0] + DOOR_HALF_WIDTH

// North wall segments run flush to the door's own near face (Step 2's
// "connect at the panels" rule) rather than stopping short at the island's
// raw edge, so there's no sliver of open island between the room and the
// door threshold.
const NORTH_Z = DOOR_NEAR_FACE - WALL_HALF

// No hard physical constraint inside the hub (Step 4) — height is a fixed
// 20m of headroom above the island floor, set by hand rather than derived
// from StageWall.001's own top.
const WALL_HEIGHT = 20
export const ROOM_TOP = GROUND_Y + WALL_HEIGHT
const WALL_Y = GROUND_Y + WALL_HEIGHT / 2

const ROOF_HEIGHT = 1.5
const ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2

const NORTH_WEST_WIDTH = DOOR_LEFT - WEST_X
const NORTH_WEST_X = (WEST_X + DOOR_LEFT) / 2
const NORTH_EAST_WIDTH = EAST_X - DOOR_RIGHT
const NORTH_EAST_X = (DOOR_RIGHT + EAST_X) / 2

// Every piece is a plain flat unrotated box — same AABB push
// (resolveSideWalls in playerMovement.js) as every other container.
export const HUB_WALLS = [
  {
    name: 'HubWall.west',
    position: [WEST_X, WALL_Y, (SOUTH_Z + NORTH_Z) / 2],
    size: [WALL_THICK, WALL_HEIGHT, NORTH_Z - SOUTH_Z],
  },
  {
    name: 'HubWall.east',
    position: [EAST_X, WALL_Y, (SOUTH_Z + NORTH_Z) / 2],
    size: [WALL_THICK, WALL_HEIGHT, NORTH_Z - SOUTH_Z],
  },
  {
    name: 'HubWall.south',
    position: [ISLAND_X, WALL_Y, SOUTH_Z],
    size: [EAST_X - WEST_X, WALL_HEIGHT, WALL_THICK],
  },
  {
    name: 'HubWall.north.west',
    position: [NORTH_WEST_X, WALL_Y, NORTH_Z],
    size: [NORTH_WEST_WIDTH, WALL_HEIGHT, WALL_THICK],
  },
  {
    name: 'HubWall.north.east',
    position: [NORTH_EAST_X, WALL_Y, NORTH_Z],
    size: [NORTH_EAST_WIDTH, WALL_HEIGHT, WALL_THICK],
  },
]

// One roof spanning the room's full outer footprint — the walls' own outer
// faces (EAST_X/WEST_X/SOUTH_Z ± WALL_HALF), through to DOOR_NEAR_FACE
// (flush with the north wall segments' own far face), so it overlaps solidly
// into the existing corridor's own roof (data/sideWalls.js's SIDE_WALL_ROOF,
// which starts at z 20.238) rather than leaving a gap over the doorway.
export const HUB_ROOF = {
  name: 'HubRoof',
  position: [ISLAND_X, ROOF_Y, (SOUTH_Z - WALL_HALF + DOOR_NEAR_FACE) / 2],
  size: [EAST_X - WEST_X + WALL_THICK, ROOF_HEIGHT, DOOR_NEAR_FACE - (SOUTH_Z - WALL_HALF)],
}

// Door-top infill (Step 4) — ROOM_TOP (26) is now well above StageWall.001's
// own top (~16.84), so the gap above the glass panel needs a solid fill up
// to the ceiling, same as any other boundary panel shorter than its
// container. Width is the door's own span plus a 0.3m OVERLAP into each
// flanking wall segment (not just the door's bare width — Gotcha #2, a fill
// sized to only the glass panel's own footprint would float without
// touching HubWall.north.west/.east in x); depth is the panel's own
// thickness plus the same 0.3m OVERLAP into it in z.
const DOOR_TOP = DOOR.position[1] + DOOR.size[1] / 2
const DOOR_FILL_OVERLAP = 0.3
export const HUB_DOOR_FILL = {
  name: 'HubDoorFill.001',
  position: [DOOR.position[0], (DOOR_TOP + ROOM_TOP) / 2, DOOR.position[2]],
  size: [DOOR.size[0] + DOOR_FILL_OVERLAP * 2, ROOM_TOP - DOOR_TOP, DOOR.size[2] + DOOR_FILL_OVERLAP * 2],
}
