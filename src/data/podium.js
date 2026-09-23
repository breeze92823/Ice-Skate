// Empty stepped display podium — one solid tier block (no centre gap/ramp)
// flanked by a sloped slide down to the ground on each outer side, styled
// after the reference: dark-gray, subtly checkered, no signage/pads/props
// resting on it. Placed beside the road near spawn (data/road.js spans x
// [-5, 5]) so it reads as scenery a player passes on their way down the
// track. Hand-placed, not synced from Blender — see
// feedback-blender-material-ownership memory for why props like this one are
// built and placed in code rather than imported.
import { GROUND_Y } from './hub.js'

// Pushed well clear of the road, since PODIUM_SCALE (8x) grows the plinth's
// own half-width to ~29.6m (TOTAL_WIDTH = 2*sideWidth + 2*rampWidth = 7.4m,
// halved and scaled) — at the old, pre-scale x (-9.5) the scaled-up plinth
// would swallow the road (data/road.js spans x [-5, 5]). -36 keeps a ~1m gap
// between the plinth's near edge and the road's kerb. Re-check this gap
// (plinth half-width, from components/DisplayPodium.jsx's TOTAL_WIDTH, times
// PODIUM_SCALE) after changing sideWidth, rampWidth, baseMargin or the scale.
export const PODIUM_POSITION = [-36, GROUND_Y, 0]
// Local +Z is the podium's own "front" (the low, open tier end) — Math.PI/2
// turns that to face world +X, toward the road.
export const PODIUM_ROTATION_Y = Math.PI / 2

// Uniform scale applied to the whole prop (components/DisplayPodium.jsx),
// on top of PODIUM_SHAPE's own real-world-metre dimensions below — keeps
// the shape numbers themselves readable instead of baking the 8x into each
// one individually.
export const PODIUM_SCALE = 8

export const PODIUM_SHAPE = {
  numTiers: 1,

  tierRise: 0.3, // metres, height gained per tier
  tierDepth: 0.55, // metres, depth each tier's front recedes by
  sideWidth: 2.4, // metres, half the tier block's own width (block is 2x this, no centre gap)
  rampWidth: 1.3, // metres, width of each of the two outer slides
  rampThickness: 0.15,
  baseHeight: 0.3, // plinth the tiers/ramp sit on
  // Flush with the tiers/ramp footprint (0 overhang) — any overhang here
  // exposes a lip in front of tier 0 that reads as an extra, unwanted step.
  baseMargin: 0,
}
