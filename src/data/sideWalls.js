// Boundary guard walls imported from Blender/world.blend's "SideWall"
// collection (nested under Stage1, alongside "GroundBlock") — four plain
// unit-cube duplicates (no modifiers, unparented, no rig), flanking the
// road/spawn corridor on Ground.001 in two left/right pairs (Side_Wall/
// .001 at the near end, Side_Wall.002/.003 further down at the same X
// offsets). Each object carries a raw 180°-Z rotation + mirrored X scale in
// Blender, but that's a no-op on a box centered at its own origin, so it's
// not represented here — only position/size. Only transform is imported
// from Blender; geometry/material come from the game's own boxGeometry + a
// studded CanvasTexture (components/SideWalls.jsx), not from Blender — see
// feedback-blender-material-ownership memory.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js —
// same formula as groundBlocks.js (see project-blender-previz-rig memory):
//   three.position = (blender.x, blender.z, -blender.y)
//   three.size     = (blender.dimensions.x, blender.dimensions.z, blender.dimensions.y)
// Re-run this conversion by hand any time an object in "SideWall" is
// added/moved/resized in Blender — this file is not auto-synced. All four
// share one size, so components/SideWalls.jsx derives its shared textures
// from SIDE_WALLS[0] alone.
export const SIDE_WALLS = [
  {
    name: 'Side_Wall',
    position: [10.043127059936523, 8.4904203414917, 37.748512268066406],
    size: [2, 16.74774742126465, 35.020660400390625], // width, height, depth
  },
  {
    name: 'Side_Wall.001',
    position: [-10.071032524108887, 8.4904203414917, 37.748512268066406],
    size: [2, 16.74774742126465, 35.020660400390625],
  },
  {
    name: 'Side_Wall.002',
    position: [-10.071032524108887, 8.4904203414917, 73.03758239746094],
    size: [2, 16.74774742126465, 35.020660400390625],
  },
  {
    name: 'Side_Wall.003',
    position: [10.043127059936523, 8.4904203414917, 73.03758239746094],
    size: [2, 16.74774742126465, 35.020660400390625],
  },
]

// Connector beam closing the ~0.27m gap left between Side_Wall's far end
// (z 20.238-55.259) and Side_Wall.003's near end (z 55.527-90.548) — both
// sit at the same x (10.043127059936523), one Blender-authored segment
// short of touching. Not a Blender object; derived from the two adjacent
// SIDE_WALLS entries above (see the gap/center math in that comment).
//
// Sized to read as a real structural pilaster rather than an invisible
// seam-filler:
//   - width: the 2m wall thickness plus a 0.5m PROTRUSION bulging out on
//     BOTH ±X faces (centered on the same x as the walls it connects), so
//     it stands proud on the outward face and also on the track-facing
//     side — a protrusion only on the outward face would sit behind the
//     wall from the player's view and never actually read as a beam
//     in-game.
//   - depth: the raw 0.268m gap plus a 0.3m OVERLAP into each adjoining
//     wall, so it reads as a distinct chunky beam spanning the seam rather
//     than a sliver exactly the gap's width.
// Height matches SIDE_WALLS (full span, same as a pilaster bridging both
// segments top to bottom).
//
// Own width/height/depth (not SIDE_WALLS' shared size) — components/
// SideWalls.jsx gives it its own stud-texture repeat sized to these
// dimensions rather than reusing SIDE_WALLS' shared materials, which are
// sized for the much longer/thinner wall segments.
export const SIDE_WALL_BEAMS = [
  {
    name: 'SideWallBeam.001-003',
    position: [10.043127059936523, 8.4904203414917, 55.39304733276367],
    size: [3, 16.74774742126465, 0.8684097290039062],
  },
]
