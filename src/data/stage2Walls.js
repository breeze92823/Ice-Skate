// Guard-wall container for the Stage2 -> Stage3 corridor (StageWall.002's
// far face through StageWall.003's near face), matching the pattern
// established in sideWalls.js for Stage1's corridor. Checked against
// Blender/world.blend's "Stage2" collection: it holds StageWall.002,
// WinPad.002, the GroundBlock.001 floor (Ground.009-012, already in
// data/groundBlocks.js), and the sahur_3d rig (components/Sahur.jsx,
// unrelated to walls) — no "SideWall" sub-collection at all, same as the
// Stage1 extension case, so this whole file is hand-authored, not
// Blender-synced.
//
// Unlike Stage1's corridor, the floor here isn't one constant width:
// GroundBlock.001/GroundBlock.002 alternate between wide slabs (Ground.010,
// Ground.013 — 33.651187896728516 wide, same as Stage1's Ground.008/.009)
// and narrow "gate" slabs (Ground.011, Ground.012 — only
// 13.800000190734863 wide). The normal ~9m-half-width lane used throughout
// Stage1 (data/sideWalls.js's SIDE_WALLS) would hang off the edge of those
// narrow slabs, so the walls here pinch inward to fit whenever the floor
// narrows. Over Ground.010 specifically the walls widen further still, out
// to a WIDE lane hugging that slab's own edges (rather than the normal
// lane, which would leave bare floor exposed on both sides), so Ground.010
// stays fully contained within the walls — mirroring the bend machinery
// already built for WinPad.002 (Stage1's side of the same StageWall.002
// gate), just narrowing/widening to match the floor instead of a panel.
// WinPad.003 (Stage3's reward panel, data/glowFloorPanel.js's
// GLOW_FLOOR_PANEL_POSITIONS[1], x -10.69305419921875, z
// 250.5469512939453) sits on this corridor's floor too (Ground.013) and
// would be embedded in a normal-lane wall the same way WinPad.002 was, so
// the last wide stretch also bulges outward around it before returning to
// normal for the final run to StageWall.003.
//
// All positions/sizes computed by hand from StageWall.002/.003 (data/
// stageWalls.js) and the floor blocks' own z-ranges (data/groundBlocks.js)
// — not read off a Blender transform, since none of this geometry exists
// as Blender objects. y/height (8.4904203414917 / 16.74774742126465) match
// SIDE_WALLS throughout so everything lines up with Stage1's walls.
const WALL_Y = 8.4904203414917
const WALL_HEIGHT = 16.74774742126465
const ROOF_Y = 17.614294052124023
const ROOF_HEIGHT = 1.5

// The normal lane (same x as data/sideWalls.js's SIDE_WALLS), the pinched
// "gate" lane (fit to Ground.011/.012's 13.8m-wide floor, inset 0.5m
// margin + the 1m wall half-thickness: 13.8/2 - 0.5 - 1 = 5.4), the WIDE
// lane (fit to Ground.010's own 33.651187896728516m-wide floor the same
// way: 33.651187896728516/2 - 0.5 - 1 = 15.325593948364258 — unlike the
// normal lane, which sits well inside Ground.010's edges leaving bare
// floor exposed on both sides, this hugs the slab's actual width so
// Ground.010 stays fully contained within the walls), and the
// WinPad.003-clearing bulge (same +/-5.122021675109863 offset from normal
// as WinPad.002's bulge in data/sideWalls.js, since both panels share the
// same x).
const NORMAL_LEFT = -10.071032524108887
const NORMAL_RIGHT = 10.043127059936523
const NARROW_LEFT = -5.400000095367432
const NARROW_RIGHT = 5.400000095367432
const WIDE_LEFT = -15.325593948364258
const WIDE_RIGHT = 15.325593948364258
const BULGE_LEFT = -15.19305419921875
const BULGE_RIGHT = 15.165148735046387

// Straight runs between bends. z-ranges come from the floor seams: jogA/B/C
// sit at the narrow/wide slab overlaps (Ground.012<->Ground.010,
// Ground.010<->Ground.011, Ground.011<->Ground.013), and jogD/E bracket
// WinPad.003 by the same clearance logic as WinPad.002 (GLOW_FLOOR_PANEL_
// RANGE, 3.5m) — though with a smaller symmetric half-gap (5m vs WinPad.002's
// ~10.2m) since Ground.013 leaves less room before StageWall.003; distance
// from each elbow's near corner to the panel is still ~4.85m, comfortably
// past the 3.5m minimum.
//
// seg0/jogF: narrowing straight to NARROW_LEFT/RIGHT right at StageWall.002's
// far face left the guard-wall opening there (10.8m, NARROW_LEFT to
// NARROW_RIGHT) narrower than the panel itself (18.4655818939209m) — the
// walls had already pinched in past the panel's own edges, so a visible
// chunk of the glass sat outside the collidable boundary and the two
// containers didn't read as connected across the panel's thickness. seg0
// keeps the same NORMAL_LEFT/RIGHT line as data/sideWalls.js's
// SIDE_WALL_END_CAPS for a short 2m run right after the panel — so both
// containers meet at the same x, with no jump at the seam — then jogF
// narrows to the gate lane just like jogA/B/C. This does mean seg0/jogF's
// outer edges briefly stand proud of Ground.012's actual 13.8m-wide
// footprint (Ground.009's wider slab undershoots the panel by only ~0.15m),
// but that's a small, deliberate trade for keeping the opening at
// StageWall.002 itself matching the panel's own space.
export const STAGE2_SEGMENTS = [
  // seg0: normal lane, connecting flush to SIDE_WALL_END_CAPS across StageWall.002.
  { name: 'Stage2Wall.seg0.right', position: [NORMAL_RIGHT, WALL_Y, 156.96738861501217], size: [2, WALL_HEIGHT, 2] },
  { name: 'Stage2Wall.seg0.left', position: [NORMAL_LEFT, WALL_Y, 156.96738861501217], size: [2, WALL_HEIGHT, 2] },
  // seg1: narrow, spanning the rest of Ground.012 after jogF.
  { name: 'Stage2Wall.seg1.right', position: [NARROW_RIGHT, WALL_Y, 162.14416755884884], size: [2, WALL_HEIGHT, 6.61673842966556] },
  { name: 'Stage2Wall.seg1.left', position: [NARROW_LEFT, WALL_Y, 162.14416755884884], size: [2, WALL_HEIGHT, 6.61673842966556] },
  // seg2: WIDE lane, hugging Ground.010's own edges so the slab stays fully within the walls.
  { name: 'Stage2Wall.seg2.right', position: [WIDE_RIGHT, WALL_Y, 198.70636749267578], size: [2, WALL_HEIGHT, 64.77084197998045] },
  { name: 'Stage2Wall.seg2.left', position: [WIDE_LEFT, WALL_Y, 198.70636749267578], size: [2, WALL_HEIGHT, 64.77084197998045] },
  // seg3: narrow again, spanning Ground.011.
  { name: 'Stage2Wall.seg3.right', position: [NARROW_RIGHT, WALL_Y, 236.47148036956787], size: [2, WALL_HEIGHT, 9.022564315795876] },
  { name: 'Stage2Wall.seg3.left', position: [NARROW_LEFT, WALL_Y, 236.47148036956787], size: [2, WALL_HEIGHT, 9.022564315795876] },
  // seg4a: normal lane again, spanning the start of Ground.013 up to WinPad.003's approach.
  { name: 'Stage2Wall.seg4a.right', position: [NORMAL_RIGHT, WALL_Y, 243.48195934295654], size: [2, WALL_HEIGHT, 3.26157417297361] },
  { name: 'Stage2Wall.seg4a.left', position: [NORMAL_LEFT, WALL_Y, 243.48195934295654], size: [2, WALL_HEIGHT, 3.26157417297361] },
  // bulge2: WinPad.003's alcove, centered exactly on the panel.
  { name: 'Stage2Wall.bulge2.right', position: [BULGE_RIGHT, WALL_Y, 250.5469512939453], size: [2, WALL_HEIGHT, 9.131590270996071] },
  { name: 'Stage2Wall.bulge2.left', position: [BULGE_LEFT, WALL_Y, 250.5469512939453], size: [2, WALL_HEIGHT, 9.131590270996071] },
  // seg4b: normal lane, final run out to StageWall.003's near face (flush, 0 gap).
  { name: 'Stage2Wall.seg4b.right', position: [NORMAL_RIGHT, WALL_Y, 264.5695745065808], size: [2, WALL_HEIGHT, 17.176836696267117] },
  { name: 'Stage2Wall.seg4b.left', position: [NORMAL_LEFT, WALL_Y, 264.5695745065808], size: [2, WALL_HEIGHT, 17.176836696267117] },
]

// Elbow connectors bending each side between two STAGE2_SEGMENTS lines —
// same perpendicular-stub idea as data/sideWalls.js's SIDE_WALL_JOGS (long
// axis along X, still an axis-aligned box; see resolveSideWalls in
// playerMovement.js), each overlapping 0.3m-per-side into its neighbors
// (JOG_DEPTH 0.8684097290039062, matching SIDE_WALL_JOGS' depth). jogF and
// jogC bend the normal<->narrow lane transition (jogF right after seg0, at
// the top of Ground.012; jogC at Ground.011's far seam); jogA/B bend the
// wider narrow<->WIDE transition instead, since seg2 (Ground.010) hugs the
// floor's own edges rather than the normal lane; jogD/E bend the
// normal<->bulge transition around WinPad.003.
export const STAGE2_JOGS = [
  { name: 'Stage2Jog.F.right', position: [7.7215635776519775, WALL_Y, 158.40159347951413], size: [4.643126964569092, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.F.left', position: [-7.735516309738159, WALL_Y, 158.40159347951413], size: [4.671032428741455, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.A.right', position: [10.362797021865845, WALL_Y, 165.8867416381836], size: [9.925593852996826, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.A.left', position: [-10.362797021865845, WALL_Y, 165.8867416381836], size: [9.925593852996826, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.B.right', position: [10.362797021865845, WALL_Y, 231.52599334716797], size: [9.925593852996826, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.B.left', position: [-10.362797021865845, WALL_Y, 231.52599334716797], size: [9.925593852996826, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.C.right', position: [7.7215635776519775, WALL_Y, 241.41696739196777], size: [4.643126964569092, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.C.left', position: [-7.735516309738159, WALL_Y, 241.41696739196777], size: [4.671032428741455, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.D.right', position: [12.604137897491455, WALL_Y, 245.5469512939453], size: [5.122021675109863, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.D.left', position: [-12.632043361663818, WALL_Y, 245.5469512939453], size: [5.122021675109863, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.E.right', position: [12.604137897491455, WALL_Y, 255.5469512939453], size: [5.122021675109863, WALL_HEIGHT, 0.8684097290039062] },
  { name: 'Stage2Jog.E.left', position: [-12.632043361663818, WALL_Y, 255.5469512939453], size: [5.122021675109863, WALL_HEIGHT, 0.8684097290039062] },
]

// Roof pieces, each matching the width of whatever wall footprint sits
// beneath it (narrow roof only over the narrow segments, normal-width roof
// over the normal segments + their adjoining jogs, extra-wide roof over
// the WinPad.003 bulge + its jogs) — same "roof must only leave its space"
// discipline used for the StageWall.002 approach in data/sideWalls.js.
const NARROW_ROOF_WIDTH = 12.800000190734863 // NARROW_RIGHT/.LEFT outer faces, symmetric about x=0
const NARROW_ROOF_X = 0
const NORMAL_ROOF_WIDTH = 22.11415958404541 // same as data/sideWalls.js's SIDE_WALL_ROOF
const NORMAL_ROOF_X = -0.01395273208618164
const WIDE_ROOF_WIDTH = 32.651187896728516 // WIDE_LEFT/.RIGHT outer faces, matches Ground.010's own width
const WIDE_ROOF_X = 0
const BULGE_ROOF_WIDTH = 32.35820293426514 // same as data/sideWalls.js's SIDE_WALL_ROOF_WIDE
const BULGE_ROOF_X = -0.01395273208618164

export const STAGE2_ROOFS = [
  { name: 'Stage2Roof.0', position: [NORMAL_ROOF_X, ROOF_Y, 157.40159347951413], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 2.8684097290039006] }, // seg0 + jogF
  { name: 'Stage2Roof.1', position: [NARROW_ROOF_X, ROOF_Y, 162.14416755884884], size: [NARROW_ROOF_WIDTH, ROOF_HEIGHT, 6.61673842966556] }, // seg1
  { name: 'Stage2Roof.2', position: [WIDE_ROOF_X, ROOF_Y, 198.70636749267578], size: [WIDE_ROOF_WIDTH, ROOF_HEIGHT, 66.50766143798831] }, // jogA + seg2 + jogB
  { name: 'Stage2Roof.3', position: [NARROW_ROOF_X, ROOF_Y, 236.47148036956787], size: [NARROW_ROOF_WIDTH, ROOF_HEIGHT, 9.022564315795876] }, // seg3
  { name: 'Stage2Roof.4', position: [NORMAL_ROOF_X, ROOF_Y, 243.04775447845458], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 4.129983901977539] }, // jogC + seg4a
  { name: 'Stage2Roof.5', position: [BULGE_ROOF_X, ROOF_Y, 250.5469512939453], size: [BULGE_ROOF_WIDTH, ROOF_HEIGHT, 10.868409729003929] }, // jogD + bulge2 + jogE
  { name: 'Stage2Roof.6', position: [NORMAL_ROOF_X, ROOF_Y, 264.5695745065808], size: [NORMAL_ROOF_WIDTH, ROOF_HEIGHT, 17.176836696267117] }, // seg4b
]
