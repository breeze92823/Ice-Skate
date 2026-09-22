// Solid ground-block props imported from Blender/world.blend's "GroundBlock"
// through "GroundBlock.005" collections (Stage1-Stage6 — Blender
// auto-suffixed each later one on name collision) — each object there is a
// plain duplicate of Ground (no modifiers), placed independently with its
// own transform, and unparented (no rig, no local counter-rotation). Note:
// most blocks sit at Blender x=0, but the Ground.016-023 cluster and a few
// GroundBlock.005 blocks have nonzero x — don't assume x=0 when re-syncing.
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
    position: [0, 2.990000009536743, 31.020584106445312],
    size: [33.651187896728516, 6, 21.64034080505371], // width, thickness (height), depth
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.002',
    position: [0, 2.990000009536743, 47.146671295166016],
    size: [33.651187896728516, 6, 8.800000190734863],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.003',
    position: [0, 2.990000009536743, 57.83223342895508],
    size: [33.651187896728516, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.004',
    position: [0, 2.990000009536743, 69.50313568115234],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.005',
    position: [0, 2.990000009536743, 79.20074462890625],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.006',
    position: [0, 2.990000009536743, 90.82257080078125],
    size: [33.651187896728516, 6, 12.363219261169434],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.007',
    position: [0, 2.990000009536743, 105.62158966064453],
    size: [33.651187896728516, 6, 9],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.008',
    position: [0, 2.990000009536743, 116.97642517089844],
    size: [33.651187896728516, 6, 12.363219261169434],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.009',
    position: [0, 2.990000009536743, 140.448486328125],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.010',
    position: [0, 2.990000009536743, 198.6915283203125],
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
    position: [0, 2.990000009536743, 257.0271301269531],
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
    position: [0, 16.895078659057617, 386.8052978515625],
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
    position: [0, 15.110108375549316, 592.5717163085938],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.026',
    position: [0, 15.10010814666748, 557.5137329101562],
    size: [13.5, 6, 60.146907806396484],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.027',
    position: [0, 15.110108375549316, 517.062255859375],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.028',
    position: [0, 15.10010814666748, 612.6755981445312],
    size: [33.651187896728516, 6, 31.338233947753906],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.029',
    position: [0, 15.10010814666748, 653.318115234375],
    size: [13.5, 6, 16.560832977294922],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.030',
    position: [0, 15.110108375549316, 736.4758911132812],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.031',
    position: [0, 15.110108375549316, 633.1935424804688],
    size: [13.800000190734863, 6, 10],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.032',
    position: [-19.8444881439209, 15.10010814666748, 676.94482421875],
    size: [33.70528793334961, 6, 19.598655700683594],
    ...GROUND_BLOCK_COLOR,
  },
  {
    // Note: identical position/size to Ground.034 (verified in Blender,
    // not a conversion bug) — looks like an accidental exact-duplicate
    // object in the source file rather than an intentional overlap.
    name: 'Ground.033',
    position: [9.023165702819824, 15.10010814666748, 699.4234008789062],
    size: [27.421344757080078, 6, 16.560832977294922],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.034',
    position: [9.023165702819824, 15.10010814666748, 699.4234008789062],
    size: [27.421344757080078, 6, 16.560832977294922],
    ...GROUND_BLOCK_COLOR,
  },
  {
    name: 'Ground.035',
    position: [-2.89853572845459, 15.10010814666748, 720.2020874023438],
    size: [21.780887603759766, 6, 16.560832977294922],
    ...GROUND_BLOCK_COLOR,
  },
]

// Slope_Block's own render transform (see header comment above) — used to
// place public/models/slope_block.glb via components/SlopeBlock.jsx.
export const SLOPE_BLOCK_TRANSFORM = {
  position: SLOPE_BLOCK_POSITION,
  rotation: [SLOPE_BLOCK_ROTATION_X, 0, 0],
}
