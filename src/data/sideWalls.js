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
// Side_Wall through Side_Wall.003 below are the actual Blender objects.
// SideWallExt.right/.left are NOT Blender objects — the corridor's guard
// walls only run through Ground.001 in Blender, but the same guard-wall
// treatment needs to continue further down the track, through to
// StageWall.002 (data/stageWalls.js — the Stage2 transition panel).
// SideWallExt continues the exact same pattern by hand: same width/height/
// depth as the Blender segments and the same GAP (0.26840972900390625,
// SIDE_WALL_BEAMS' gap below) after Side_Wall.003/.002's far edge
// (90.54791259765625). A second, shorter pair (SIDE_WALL_END_CAPS below)
// picks up where this one ends and runs flush to StageWall.002 — it's a
// different depth, so it can't share this array's one-size-fits-all
// texture batch (see components/SideWalls.jsx) and lives separately.
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
  {
    name: 'SideWallExt.right',
    position: [10.043127059936523, 8.4904203414917, 108.32665252685547],
    size: [2, 16.74774742126465, 35.020660400390625],
  },
  {
    name: 'SideWallExt.left',
    position: [-10.071032524108887, 8.4904203414917, 108.32665252685547],
    size: [2, 16.74774742126465, 35.020660400390625],
  },
]

// Final, shorter pair that closes the run out to StageWall.002 — same
// GAP after SideWallExt's far edge (125.83698272705078), then sized to
// land its own far edge exactly on StageWall.002's near face
// (155.8538360595703 - its own half-depth 0.22710511088371277 / 2 =
// 155.74028350412846), so the guard wall ends flush at the stage
// transition instead of overlapping it or falling short. Depth differs
// from SIDE_WALLS' shared 35.020660400390625, so components/SideWalls.jsx
// gives this pair its own stud-texture repeat (same treatment as
// SIDE_WALL_BEAMS/SIDE_WALL_ROOF) rather than reusing SIDE_WALLS' batch.
// Still registered in playerMovement.js's collision alongside SIDE_WALLS —
// it's a boundary wall like the rest, just a different depth.
//
// Final pair that closes the run out to StageWall.002 — back at SIDE_WALLS'
// normal x (this used to be where the bulge stayed all the way to
// StageWall.002; see SIDE_WALL_BULGES below for why it now bends back in
// first). Sized to land its own far edge exactly on StageWall.002's near
// face (155.8538360595703 - its own half-depth 0.22710511088371277 / 2 =
// 155.74028350412846), starting right after SIDE_WALL_JOGS' outbound
// elbow (146.81097869873048) — so the corridor is back to its normal
// width by the time it reaches the stage transition, and the only opening
// left there is StageWall.002's own footprint (its glass panel spans x
// roughly ±9.23, close to the normal corridor's own ±9.0-9.1 inner faces),
// not the wider bulge. Depth differs from SIDE_WALLS' shared
// 35.020660400390625, so components/SideWalls.jsx gives this pair its own
// stud-texture repeat (same treatment as SIDE_WALL_BEAMS/SIDE_WALL_ROOF)
// rather than reusing SIDE_WALLS' batch. Still registered in
// playerMovement.js's collision alongside SIDE_WALLS — it's a boundary
// wall like the rest, just a different depth.
export const SIDE_WALL_END_CAPS = [
  {
    name: 'SideWallEndCap.right',
    position: [10.043127059936523, 8.4904203414917, 151.27563110142947],
    size: [2, 16.74774742126465, 8.929304805397976],
  },
  {
    name: 'SideWallEndCap.left',
    position: [-10.071032524108887, 8.4904203414917, 151.27563110142947],
    size: [2, 16.74774742126465, 8.929304805397976],
  },
]

// The alcove that actually clears WinPad.002 — bent outward, symmetrically,
// by the same 5.122021675109863m offset on both sides (left:
// -10.071032524108887 to -15.19305419921875; right: 10.043127059936523 to
// 15.165148735046387), centered in z exactly on the panel
// (data/glowFloorPanel.js's GLOW_FLOOR_PANEL_POSITIONS[0], x
// -10.69305419921875, z 136.17398071289062 — WinPad.002, on Ground.009,
// 124.779-156.118). The straight wall used to stay bulged all the way to
// StageWall.002, but that left a wide gap flanking the stage-transition
// panel (its edges only span x ~±9.23, far short of the ~±15.1-15.2 bulge)
// — this alcove now only bulges around the panel itself and SIDE_WALL_JOGS'
// second (outbound) elbow bends it back to the normal line well before
// StageWall.002, so the panel's own footprint is the only opening left at
// the transition. Bent-out inner face (-14.19305419921875 / 14.19305419921875)
// clears the panel by exactly GLOW_FLOOR_PANEL_RANGE (3.5m) in the x-only
// case directly beside it, and by a wide margin everywhere else since both
// elbows sit ~10.2m away from the panel in z. The right side mirrors it
// purely for visual symmetry (no panel over there). Different depth than
// SIDE_WALLS' shared 35.020660400390625, so it gets its own stud-texture
// repeat like SIDE_WALL_END_CAPS, and is registered in playerMovement.js's
// collision alongside SIDE_WALLS/SIDE_WALL_END_CAPS — it's a boundary wall,
// not a decorative pilaster.
export const SIDE_WALL_BULGES = [
  {
    name: 'SideWallBulge.right',
    position: [15.165148735046387, 8.4904203414917, 136.17398071289062],
    size: [2, 16.74774742126465, 19.537176513671866],
  },
  {
    name: 'SideWallBulge.left',
    position: [-15.19305419921875, 8.4904203414917, 136.17398071289062],
    size: [2, 16.74774742126465, 19.537176513671866],
  },
]

// Elbow connectors bending each side between its normal line and its
// SIDE_WALL_BULGES alcove — perpendicular wall stubs (long axis along X
// instead of Z, still axis-aligned boxes like everything else here; see
// resolveSideWalls in playerMovement.js, which only handles unrotated
// boxes), each spanning the full x-distance between its two lines
// (right: 10.043127059936523 to 15.165148735046387; left:
// -10.071032524108887 to -15.19305419921875). Two per side — .in bends out
// from SideWallExt into the bulge, .out bends back from the bulge into
// SIDE_WALL_END_CAPS — placed symmetrically around the panel's z
// (125.97118759155273 and 146.37677383422852, each exactly
// 10.202793121337892 away from WinPad.002's own z). Same 0.3m-per-side
// OVERLAP depth (0.8684097290039062) as the old single-elbow version so
// each overlaps solidly into its neighbors rather than leaving a seam.
// Functional wall segments (what actually blocks the player from cutting
// through the corner of each bend), not decorative pilasters like
// SIDE_WALL_BEAMS — registered in playerMovement.js's collision alongside
// SIDE_WALLS/SIDE_WALL_END_CAPS/SIDE_WALL_BULGES.
export const SIDE_WALL_JOGS = [
  {
    name: 'SideWallJog.right.in',
    position: [12.604137897491455, 8.4904203414917, 125.97118759155273],
    size: [5.122021675109863, 16.74774742126465, 0.8684097290039062], // width spans the two wall lines, depth matches SIDE_WALL_BEAMS
  },
  {
    name: 'SideWallJog.left.in',
    position: [-12.632043361663818, 8.4904203414917, 125.97118759155273],
    size: [5.122021675109863, 16.74774742126465, 0.8684097290039062],
  },
  {
    name: 'SideWallJog.right.out',
    position: [12.604137897491455, 8.4904203414917, 146.37677383422852],
    size: [5.122021675109863, 16.74774742126465, 0.8684097290039062],
  },
  {
    name: 'SideWallJog.left.out',
    position: [-12.632043361663818, 8.4904203414917, 146.37677383422852],
    size: [5.122021675109863, 16.74774742126465, 0.8684097290039062],
  },
]

// Connector beams closing the ~0.27m gaps left at every seam where one
// full-length segment meets the next — Side_Wall/.003 to SideWallExt (the
// original pattern), then SideWallExt to SideWallEndCap. Same gap
// (0.26840972900390625) at each seam since SideWallExt/SIDE_WALL_END_CAPS
// continue that exact spacing by hand (see SIDE_WALLS/SIDE_WALL_END_CAPS
// comments above). No beam at the final SideWallEndCap -> StageWall.002
// joint — that one's sized to land flush (0 gap), not a gap to fill. No
// SideWallBeam.right.3/.left.3 either — on both sides, that seam is now the
// bend (SideWallEndCap no longer lines up in x with SideWallExt), so
// SIDE_WALL_JOGS' elbow connectors close it instead of straight pilasters.
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
// segments top to bottom). All four beams share one size, same as SIDE_WALLS.
//
// Own width/height/depth (not SIDE_WALLS' shared size) — components/
// SideWalls.jsx gives it its own stud-texture repeat sized to these
// dimensions rather than reusing SIDE_WALLS' shared materials, which are
// sized for the much longer/thinner wall segments.
export const SIDE_WALL_BEAMS = [
  {
    name: 'SideWallBeam.right.1',
    position: [10.043127059936523, 8.4904203414917, 55.39304733276367],
    size: [3, 16.74774742126465, 0.8684097290039062],
  },
  {
    name: 'SideWallBeam.left.1',
    position: [-10.071032524108887, 8.4904203414917, 55.39304733276367],
    size: [3, 16.74774742126465, 0.8684097290039062],
  },
  {
    name: 'SideWallBeam.right.2',
    position: [10.043127059936523, 8.4904203414917, 90.68211746215820],
    size: [3, 16.74774742126465, 0.8684097290039062],
  },
  {
    name: 'SideWallBeam.left.2',
    position: [-10.071032524108887, 8.4904203414917, 90.68211746215820],
    size: [3, 16.74774742126465, 0.8684097290039062],
  },
]

// Roof/lintel joining the two SIDE_WALLS pairs — covers the whole
// corridor, not just the seam. Split into three pieces because
// SIDE_WALL_BULGES widens the corridor for only a middle stretch (around
// WinPad.002), narrow again before and after: a single constant-width roof
// would either leave the bulge's outer edges uncovered, or (if sized to
// the bulge) overhang past both walls' outer faces everywhere it's not
// needed, including over SIDE_WALL_END_CAPS' now-narrow run out to
// StageWall.002.
//   - position.y (all three pieces): SIDE_WALLS' shared top (wallY +
//     wallHeight/2 = 16.864294052124023) plus half the roof's own 1.5m
//     thickness = 17.614294052124023.
//   - SIDE_WALL_ROOF (normal width): Side_Wall's near end
//     (20.238182067871094) through SIDE_WALL_JOGS' .in near edge
//     (125.53698272705078, where the bend starts) — width spans
//     Side_Wall.001's outer (-X) face to Side_Wall/.003's outer (+X) face
//     (-11.071032524108887 to 11.043127059936523).
//   - SIDE_WALL_ROOF_WIDE: SIDE_WALL_JOGS' .in near edge through its .out
//     far edge (146.81097869873048), covering both .in/.out elbow pairs
//     and both SIDE_WALL_BULGES — width spans the bulged
//     SideWallBulge.left's outer face (-16.19305419921875) to
//     SideWallBulge.right's outer face (16.165148735046387), centered on
//     the same x as SIDE_WALL_ROOF (~-0.014) since the bend is symmetric.
//   - SIDE_WALL_ROOF_END (normal width again, same width as SIDE_WALL_ROOF):
//     SIDE_WALL_JOGS' .out far edge through SIDE_WALL_END_CAPS' far edge
//     (155.74028350412846, flush with StageWall.002) — so the roof narrows
//     back down over the same stretch the walls do, and only StageWall.002's
//     own footprint is left open at the transition.
// Own width/height/depth per piece — components/SideWalls.jsx gives each
// its own stud-texture repeat, same treatment as SIDE_WALL_BEAMS.
export const SIDE_WALL_ROOF = {
  name: 'SideWallRoof',
  position: [-0.01395273208618164, 17.614294052124023, 72.88758239746093],
  size: [22.11415958404541, 1.5, 105.29880065917969],
}

export const SIDE_WALL_ROOF_WIDE = {
  name: 'SideWallRoofWide',
  position: [-0.01395273208618164, 17.614294052124023, 136.17398071289062],
  size: [32.35820293426514, 1.5, 21.273995971679696],
}

export const SIDE_WALL_ROOF_END = {
  name: 'SideWallRoofEnd',
  position: [-0.01395273208618164, 17.614294052124023, 151.27563110142947],
  size: [22.11415958404541, 1.5, 8.929304805397976],
}
