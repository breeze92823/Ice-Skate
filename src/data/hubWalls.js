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

// Door-frame light strips — an unlit emissive trim around StageWall.001's
// own opening, echoing Laser-Escape's podium_stage neon sign face (an unlit,
// untone-mapped MeshBasicMaterial shape; see CLAUDE.md's "fake it with an
// emissive-looking MeshBasicMaterial shape, not a bloom pass"). HubWall.
// north.west/.east's own far face and the door panel's own near face are
// already coplanar at DOOR_NEAR_FACE (NORTH_Z = DOOR_NEAR_FACE - WALL_HALF,
// so the walls' +Z face lands exactly there) — the strips sit proud of that
// shared plane, toward the room, so they read as a lit frame around the
// doorway to a player standing inside the hub.
const DOOR_STRIP_THICK = 0.5 // width of the visible trim band
const DOOR_STRIP_PROUD = 0.12 // how far it stands off the flush wall/door plane
const DOOR_STRIP_Z = DOOR_NEAR_FACE - DOOR_STRIP_PROUD / 2
// Overlaps both side strips at the corners, same mitring as TRIM boxes
// elsewhere in this project (frame/lip borders) — one wide top bar rather
// than three separately-jointed pieces.
const DOOR_STRIP_TOP_WIDTH = DOOR_RIGHT - DOOR_LEFT + DOOR_STRIP_THICK * 2
export const DOOR_LIGHT_STRIP_COLOR = '#37e6ff'
export const HUB_DOOR_LIGHT_STRIPS = [
  {
    name: 'HubDoorLightStrip.top',
    position: [DOOR.position[0], DOOR_TOP, DOOR_STRIP_Z],
    size: [DOOR_STRIP_TOP_WIDTH, DOOR_STRIP_THICK, DOOR_STRIP_PROUD],
  },
  {
    name: 'HubDoorLightStrip.left',
    position: [DOOR_LEFT, DOOR_TOP / 2, DOOR_STRIP_Z],
    size: [DOOR_STRIP_THICK, DOOR_TOP, DOOR_STRIP_PROUD],
  },
  {
    name: 'HubDoorLightStrip.right',
    position: [DOOR_RIGHT, DOOR_TOP / 2, DOOR_STRIP_Z],
    size: [DOOR_STRIP_THICK, DOOR_TOP, DOOR_STRIP_PROUD],
  },
]

// Vertical wall beams flanking the door — structural pilasters mounted
// flush on HubWall.north.west/.east's own room-facing face (studded
// SIDE_WALL material, via HubWalls.jsx's generic per-size material cache;
// same "protrude proud of the wall's face into the room" treatment as
// HUB_DOOR_LIGHT_STRIPS above, just a solid beam instead of unlit glow
// trim). Centered at the door's own left/right edge (DOOR_LEFT/DOOR_RIGHT,
// same x as HubDoorLightStrip.left/.right) so each beam frames the opening
// the way a doorway pilaster would. Initially just the 2 flanking the door;
// more can be added along the other walls following this same pattern.
// Solid (registered as a collider in data/wallColliders.js) — unlike its
// lookalike SIDE_WALL_BEAMS (data/sideWalls.js), which only re-skins a seam
// already backed by solid wall, these pilasters stand proud into otherwise-
// open room space next to the doorway, so the player would walk straight
// through them without their own AABB.
const WALL_BEAM_WIDTH = 3 // 2x the original 1.5m pilaster width
const WALL_BEAM_PROTRUSION = 0.6 // how far it stands proud of the wall's room-facing face
const WALL_BEAM_Z = NORTH_Z - WALL_HALF - WALL_BEAM_PROTRUSION / 2
export const HUB_WALL_BEAMS = [
  {
    name: 'HubWallBeam.door.left',
    position: [DOOR_LEFT, WALL_Y, WALL_BEAM_Z],
    size: [WALL_BEAM_WIDTH, WALL_HEIGHT, WALL_BEAM_PROTRUSION],
  },
  {
    name: 'HubWallBeam.door.right',
    position: [DOOR_RIGHT, WALL_Y, WALL_BEAM_Z],
    size: [WALL_BEAM_WIDTH, WALL_HEIGHT, WALL_BEAM_PROTRUSION],
  },
]

// Horizontal beam capping the door — same pilaster cross-section as the
// vertical beams above (WALL_BEAM_WIDTH thickness, WALL_BEAM_PROTRUSION
// depth, same WALL_BEAM_Z proud plane), just rotated to run along X instead
// of Y. Straddles DOOR_TOP the same way HUB_DOOR_LIGHT_STRIPS.top straddles
// it (position y = DOOR_TOP, size y = its own thickness). Width is the
// door's own span minus WALL_BEAM_WIDTH so its ends stop flush at
// HubWallBeam.door.left/.right's own inner face instead of overlapping the
// vertical beams' own half-width. Its own collider (data/wallColliders.js),
// same reasoning as HUB_WALL_BEAMS: it stands proud into open room space
// above the door, not backed by solid wall behind it.
export const HUB_WALL_BEAM_TOP = {
  name: 'HubWallBeam.door.top',
  position: [DOOR.position[0], DOOR_TOP, WALL_BEAM_Z],
  size: [DOOR.size[0] - WALL_BEAM_WIDTH, WALL_BEAM_WIDTH, WALL_BEAM_PROTRUSION],
}

// Beam edge light strips — same unlit, untone-mapped glow trim as
// HUB_DOOR_LIGHT_STRIPS above (DOOR_LIGHT_STRIP_COLOR, CLAUDE.md's "fake it
// with an emissive-looking MeshBasicMaterial shape, not a bloom pass"),
// applied to each HUB_WALL_BEAMS pilaster's own two vertical (X) edges, proud
// of its own room-facing (south) face — so each beam reads as a lit doorway
// pilaster instead of a bare studded column. Generated straight from
// HUB_WALL_BEAMS so a beam move/resize carries the strips along
// automatically; nothing here is hand-tuned per beam.
const WALL_BEAM_STRIP_THICK = 0.35 // matches the door's own trim width
const WALL_BEAM_STRIP_PROUD = 0.12 // matches the door's own protrusion
export const WALL_BEAM_STRIP_COLOR = '#ffffff'
const HUB_WALL_BEAM_VERTICAL_LIGHT_STRIPS = HUB_WALL_BEAMS.flatMap(({ name, position, size }) => {
  const [width, , depth] = size
  const roomFaceZ = position[2] - depth / 2 // beam's own south, room-facing face
  const stripZ = roomFaceZ - WALL_BEAM_STRIP_PROUD / 2
  return [-1, 1].map((edgeSign) => ({
    name: `${name}.edge.${edgeSign < 0 ? 'left' : 'right'}`,
    position: [position[0] + (edgeSign * width) / 2, position[1], stripZ],
    size: [WALL_BEAM_STRIP_THICK, WALL_HEIGHT, WALL_BEAM_STRIP_PROUD],
  }))
})

// Same edge-glow treatment along HUB_WALL_BEAM_TOP's own bottom edge — the
// underside a player actually sees walking beneath it, echoing
// HUB_DOOR_LIGHT_STRIPS.top's own placement one level up.
const HUB_WALL_BEAM_TOP_LIGHT_STRIP = (() => {
  const [width, height, depth] = HUB_WALL_BEAM_TOP.size
  const roomFaceZ = HUB_WALL_BEAM_TOP.position[2] - depth / 2
  return {
    name: `${HUB_WALL_BEAM_TOP.name}.edge.bottom`,
    position: [
      HUB_WALL_BEAM_TOP.position[0],
      HUB_WALL_BEAM_TOP.position[1] - height / 2,
      roomFaceZ - WALL_BEAM_STRIP_PROUD / 2,
    ],
    size: [width, WALL_BEAM_STRIP_THICK, WALL_BEAM_STRIP_PROUD],
  }
})()

export const HUB_WALL_BEAM_LIGHT_STRIPS = [...HUB_WALL_BEAM_VERTICAL_LIGHT_STRIPS, HUB_WALL_BEAM_TOP_LIGHT_STRIP]
