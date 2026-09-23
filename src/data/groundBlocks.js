// Solid ground-block props imported from Blender/world.blend's "GroundBlock"
// through "GroundBlock.012" collections (Stage1-Stage13 — Blender
// auto-suffixed each later one on name collision) — each object there is a
// plain duplicate of Ground (no modifiers), placed independently with its
// own transform, and unparented (no rig, no local counter-rotation). Note:
// most blocks sit at Blender x=0, but the Ground.016-023 cluster, a few
// GroundBlock.005 blocks, and the GroundBlock.006 (Stage7) cluster have
// nonzero x — don't assume x=0 when re-syncing.
// Only transform is imported from Blender;
// geometry/material come from the game's own GroundBlock helper (Ground.jsx,
// same stud-textured GLB as the main island) — see
// feedback-blender-material-ownership memory. `size` here also doubles as
// the collision AABB used by playerMovement.js's groundBlockTopAt.
//
// Conversion from Blender's raw (unparented) Z-up transform to three.js:
//   three.position = (blender.x, blender.z, -blender.y)
//   three.size     = (blender.dimensions.x, blender.dimensions.z, blender.dimensions.y)
// (see project-blender-previz-rig memory). Note: Blender's `dimensions` is
// always positive even when an object has a negative-scale axis (mirrored),
// so mirrored boxes still convert correctly here. Re-run this conversion by
// hand any time an object in any of these collections is added/moved/resized
// in Blender — this file is not auto-synced.
//
// `rotationX` (optional, three.js radians, default 0) supports ramp-style
// blocks tilted about the world X axis — e.g. Stage3's `Slope_Block`, a
// sibling of the flat `GroundBlock.002` collection rather than a member of
// it, bridging the height jump from Ground.013 up to the elevated
// Ground.014. Because a rotation about Blender's local X axis is invariant
// under the axis-swap above (X maps straight through), `rotationX` here
// equals the object's raw `rotation_euler.x` — no extra conversion needed.
//
// `rotationY` (optional, three.js radians, default 0) supports the
// GroundBlock.006 (Stage7) pillar cluster, which is yawed about Blender's
// vertical Z axis rather than tilted — verified algebraically (and against
// this cluster) that a Blender Z-axis rotation maps straight through to a
// three.js Y-axis rotation of the same signed angle under the axis-swap
// above, so `rotationY` here equals the object's raw `rotation_euler.z`, no
// extra conversion needed either. Rendered in GroundBlocks.jsx via
// `rotation={[rotationX, rotationY, 0]}` and collided against in
// playerMovement.js's `groundBlockTopAt` (which yaw-rotates the test point
// into the block's local frame before the existing rotationX projection).
//
// Slope_Block is NOT a duplicate of Ground like every other entry here —
// it's a genuinely custom-edited mesh (a tapered, beveled ramp shape, not a
// plain box), so it can't be represented as a scaled copy of ground.glb, and
// its collision can't be one rectangle either: the mesh's own footprint
// (its bottom/top face outline, read straight off Ground_Cube.026's
// vertices) is 13m wide for most of its run and only flares to the full
// 31m in two short bands nearer the Ground.013 end — see `bands` below.
// GroundBlocks.jsx skips rendering a box for any `customMesh: true` entry;
// rendering instead uses the real geometry, exported once to
// public/models/slope_block.glb (object transform reset to identity before
// export, so the GLB's local frame matches the object's own origin) and
// drawn by components/SlopeBlock.jsx.
//
// Both rendering and collision below share the object's own raw transform
// (SLOPE_BLOCK_POSITION/_ROTATION_X — the converted `location`/
// `rotation_euler.x`, no bbox-center adjustment needed, since collision now
// works directly in the mesh's own local frame): `bands` are ranges of the
// object's local Y (its depth axis) with that band's own half-width, and
// `topLocalZ` is the flat main body's local Z (height) — all three are
// exactly the raw numbers in Ground_Cube.026's vertex data (its 6 flat-top
// vertices per band edge are all at local z=3, see mesh dump). The bevel
// end caps just past each end (past local y=±41, tapering the ramp's top
// down/up to meet its neighbour) are folded into their nearest band's width
// rather than modelled exactly — a minor height approximation right at
// each tip, in the zone that already overlaps the neighbouring block's own
// collision box. Re-derive `bands`/`topLocalZ` by hand from the mesh's
// vertices (and re-export the GLB) any time Slope_Block changes in
// Blender — neither is auto-synced.
//
// All blocks share one checker-tile color, same contrast ratio as Ground's
// DARK/LIGHT but shifted blue — Ground.jsx defaults to its own tones unless
// overridden, so this doesn't touch the main island's look.
const GROUND_BLOCK_COLOR = { light: '#34bac9', dark: '#34bac9' }

// Slope_Block's own raw transform — shared by its GROUND_BLOCKS collision
// entry below and SLOPE_BLOCK_TRANSFORM (used by components/SlopeBlock.jsx
// to place the exported mesh), so the two can't drift apart.
const SLOPE_BLOCK_POSITION = [0, 10, 318.777099609375]
const SLOPE_BLOCK_ROTATION_X = -0.1745329201221466

export const GROUND_BLOCKS = [
  {
    name: 'Ground.001',
    position: [0, 3, 31.020584106445312],
    size: [33.651187896728516, 6, 21.64034080505371], // width, thickness (height), depth
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.002',
    position: [0, 3, 47.146671295166016],
    size: [33.651187896728516, 6, 8.800000190734863],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.003',
    position: [0, 3, 57.83223342895508],
    size: [33.651187896728516, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.004',
    position: [0, 3, 69.50313568115234],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.005',
    position: [0, 3, 79.20074462890625],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.006',
    position: [0, 3, 90.82257080078125],
    size: [33.651187896728516, 6, 12.363219261169434],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.007',
    position: [0, 3, 105.62158966064453],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.008',
    position: [0, 3, 116.97642517089844],
    size: [33.651187896728516, 6, 12.363219261169434],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.009',
    position: [0, 3, 140.448486328125],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.010',
    position: [0, 3, 198.6915283203125],
    size: [33.651187896728516, 6, 65.76907348632812],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.011',
    position: [0, 3, 236.47592163085938],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.012',
    position: [0, 3, 160.96649169921875],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.013',
    position: [0, 3, 257.0271301269531],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Slope_Block',
    customMesh: true, // rendered by components/SlopeBlock.jsx, not a box here
    position: SLOPE_BLOCK_POSITION,
    rotationX: SLOPE_BLOCK_ROTATION_X,
    topLocalZ: 3,
    bands: [
      { y: [-43.694034576416016, -30], halfWidth: 6.5 }, // Ground.014 (high) end
      { y: [-30, -11], halfWidth: 15.5 },
      { y: [-11, 10], halfWidth: 6.5 },
      { y: [10, 29], halfWidth: 15.5 },
      { y: [29, 47.396663665771484], halfWidth: 6.5 }, // Ground.013 (low) end
    ],
  },
  {
    name: 'Ground.014',
    position: [0, 16.957406997680664, 366.2790832519531],
    size: [13.828740119934082, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.015',
    position: [0, 16.957406997680664, 386.8052978515625],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.016',
    position: [15.110193252563477, 7.961326599121094, 415.66265869140625],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.017',
    position: [-7.956676483154297, 7.961326599121094, 415.66265869140625],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.018',
    position: [-13.883580207824707, 7.961326599121094, 435.5257873535156],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.019',
    position: [10.785155296325684, 7.961326599121094, 435.5257873535156],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.020',
    position: [-13.883580207824707, 7.961326599121094, 454.107421875],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.021',
    position: [5.018437385559082, 7.961326599121094, 454.107421875],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.022',
    position: [5.018437385559082, 7.961326599121094, 471.24737548828125],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.023',
    position: [-14.203953742980957, 7.961326599121094, 471.24737548828125],
    size: [13.800000190734863, 19.435138702392578, 14.482516288757324],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.024',
    position: [0, 15.10010814666748, 496.5442810058594],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.025',
    position: [0, 15.110108375549320, 592.5717163085938],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.026',
    position: [0, 15.110108375549320, 557.5137329101562],
    size: [13.5, 6, 60.146907806396484],
    // Loops through solid -> fade-out -> fully hidden -> fade-in -> solid on
    // a shared timer (systems/groundPhase.js) — GroundBlocks.jsx animates
    // its material opacity/visibility from it, playerMovement.js skips
    // collision against it whenever that timer says not collidable.
    phasing: true,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.027',
    position: [0, 15.10010814666748, 517.062255859375],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.028',
    position: [0, 8.676575660705570, 612.6755981445312],
    size: [33.651187896728516, 18.8670654296875, 31.338232040405273],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.029',
    position: [29.151721954345703, 8.726423263549805, 671.8711547851562],
    size: [16.845552444458008, 18.8670654296875, 36.526329040527344],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.030',
    position: [-2.039417266845703, 1.1438677310943604, 755.3882446289062],
    size: [24.467222213745117, 33.45106506347656, 17.72987174987793],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.031',
    position: [0, 8.676575660705570, 641.974365234375],
    size: [13.800000190734863, 18.8670654296875, 27.650508880615234],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.032',
    position: [-1.7163410186767578, 8.726423263549805, 670.2883911132812],
    size: [23.474353790283203, 18.8670654296875, 19.598655700683594],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.033',
    position: [-32.7098274230957, 8.726423263549805, 708.041015625],
    size: [23.474353790283203, 18.8670654296875, 19.598655700683594],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.034',
    position: [-1.7163400650024414, 8.726423263549805, 708.041015625],
    size: [23.474353790283203, 18.8670654296875, 19.598655700683594],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.035',
    position: [-1.7163400650024414, 8.726423263549805, 732.5452880859375],
    size: [12.398195266723633, 18.8670654296875, 21.261016845703125],
    ...GROUND_BLOCK_COLOR,
  },
  // Ground.050/051 — GroundBlock.005 (Stage6) members as of the 2026-09-23
  // resync (Blender renamed the former Ground.044/045 to these numbers;
  // transforms are unchanged from the prior sync).
  {
    name: 'Ground.050',
    position: [-32.7098274230957, 8.726423263549805, 670.2883911132812],
    size: [23.474353790283203, 18.8670654296875, 19.598655700683594],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.051',
    position: [-59.26808547973633, 8.726423263549805, 689.4653930664062],
    size: [19.164268493652344, 18.8670654296875, 59.038753509521484],
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.006 (Stage7) — a cluster of tall yawed pillars zigzagging
  // between two flat landings, re-synced 2026-09-23: Blender renumbered
  // several of these objects since the last sync (names below reflect
  // current Blender names, not necessarily the same object identity as
  // whatever previously held that number — see project-stage-layout memory,
  // always re-read fresh rather than trusting old names).
  {
    name: 'Ground.036',
    position: [0, -2.2282285690307617, 949.9338989257812],
    size: [41.74809646606445, 40.98118591308594, 15.934730529785156],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.037',
    position: [-15.936171531677246, -4.0180983543396, 886.31689453125],
    size: [19, 44.64799499511719, 19],
    rotationY: -0.1025393158197403,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.038',
    position: [9.023165702819824, -4.0180983543396, 875.3388671875],
    size: [19, 44.64799499511719, 19],
    rotationY: -0.012672558426856995,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.039',
    position: [-19.8444881439209, -4.0180983543396, 843.6242065429688],
    size: [19, 44.64799499511719, 19],
    rotationY: 0.44257375597953796,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.040',
    position: [0, -2.2282285690307617, 799.8729248046875],
    size: [41.74809646606445, 40.98118591308594, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.041',
    position: [-21.360549926757812, -4.0180983543396, 816.9404296875],
    size: [19, 44.64799499511719, 19],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.042',
    position: [0, -2.29653263092041, 779.35498046875],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.043',
    position: [9.023165702819824, -4.0180983543396, 849.5947875976562],
    size: [19, 44.64799499511719, 19],
    rotationY: -0.40961167216300964,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.044',
    position: [7.173346519470215, -4.0180983543396, 905.5481567382812],
    size: [19, 44.64799499511719, 19],
    rotationY: 0.16562804579734802,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.045',
    position: [-2.4556198120117188, -4.0180983543396, 928.8983764648438],
    size: [19, 44.64799499511719, 19],
    rotationY: -0.1926269382238388,
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.007 (Stage8) — synced 2026-09-23.
  {
    name: 'Ground.046',
    position: [0, -2.29653263092041, 973.0548095703125],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.047',
    position: [-28.392040252685547, -2.4787490367889404, 1003.05908203125],
    size: [142.8367919921875, 40.98118591308594, 28.87409019470215],
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.008 (Stage9) — synced 2026-09-23.
  {
    name: 'Ground.048',
    position: [-201.19317626953125, -2.4787490367889404, 1003.05908203125],
    size: [142.8367919921875, 40.98118591308594, 28.87409019470215],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.049',
    position: [-115.45283508300781, -2.29653263092041, 1003.1856689453125],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.009 (Stage10) — synced 2026-09-23.
  {
    name: 'Ground.052',
    position: [-287.9387512207031, -2.29653263092041, 1003.1856689453125],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.053',
    position: [-314.2426452636719, -2.4787490367889404, 1003.05908203125],
    size: [21.41473388671875, 40.98118591308594, 2.5],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.054',
    position: [-325.5093688964844, 63.45986557006836, 1003.05908203125],
    size: [1.1285537481307983, 96.1390609741211, 2.5],
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.010 (Stage11) — re-synced 2026-09-23 (Blender edited
  // Ground.053-055 again after the same-day sync above: .053/.054 moved in
  // x and .053/.054 narrowed, .055 also moved in x and grew in local depth
  // (raw z-dimension 31.34 -> 40.45)). Re-synced again same day: .055 grew
  // much taller (thickness 40.98 -> 163.34) and dropped in y (90.87 ->
  // 29.57) — Stage11's spawn (blockSpawn('Ground.055')) moves with it.
  {
    name: 'Ground.055',
    position: [-346.31671142578125, 29.574045181274414, 1003.1856689453125],
    size: [33.651187896728516, 163.34149169921875, 40.45344924926758],
    rotationY: -1.5707963705062866,
    // Uses the guard-wall Side_Wall material/color instead of the usual
    // ground checker, on request — GroundBlocks.jsx reads this flag.
    sideWallMaterial: true,
  },
  // GroundBlock.011 (Stage12) — synced 2026-09-23.
  {
    name: 'Ground.056',
    position: [-651.2061767578125, 90.87358093261719, 1003.1856689453125],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.057',
    position: [-742.4451904296875, 90.87358093261719, 1003.1856689453125],
    size: [136.59722900390625, 40.98118591308594, 151.28765869140625],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
  // GroundBlock.012 (Stage13) — synced 2026-09-23.
  {
    name: 'Ground.058',
    position: [-860.792724609375, 90.87358093261719, 1003.1856689453125],
    size: [51.315826416015625, 40.98118591308594, 24.302705764770508],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.059',
    position: [-832.9556274414062, 90.87358093261719, 1003.1856689453125],
    size: [33.651187896728516, 40.98118591308594, 31.338232040405273],
    rotationY: -1.5707963705062866,
    ...GROUND_BLOCK_COLOR,
  },
]

// Slope_Block's own render transform (see header comment above) — used to
// place public/models/slope_block.glb via components/SlopeBlock.jsx.
export const SLOPE_BLOCK_TRANSFORM = {
  position: SLOPE_BLOCK_POSITION,
  rotation: [SLOPE_BLOCK_ROTATION_X, 0, 0],
}
