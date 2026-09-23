// Decorative pair of ice skates sitting on the hub island's ground, near
// spawn — Bloxity/LEGO-block build (boxes only), same convention as
// Treadmill.jsx and SkateRackItem.jsx's pads. Not a pickup/collider, just
// set dressing.
import { GROUND_Y } from './hub.js'

export const ICE_SKATE_POSITION = [4, GROUND_Y-5, 4]
export const ICE_SKATE_ROTATION_Y = 0

// Center-to-center gap between the two skates along local X.
export const ICE_SKATE_PAIR_GAP = 0.55

// One skate's side profile, built front-to-back along local Z: blade under
// a sole plate, a toe box (front, lower) and an ankle cuff (back, taller)
// forming the boot, with a lace strip across the toe box.
export const ICE_SKATE_SHAPE = {
  bladeWidth: 0.04,
  bladeHeight: 0.1,
  bladeLength: 0.95,
  bladeY: 0.05,

  soleWidth: 0.4,
  soleHeight: 0.06,
  soleLength: 0.82,

  toeWidth: 0.42,
  toeHeight: 0.28,
  toeLength: 0.5,
  toeZOffset: 0.14,

  cuffWidth: 0.38,
  cuffHeight: 0.46,
  cuffLength: 0.32,
  cuffZOffset: -0.28,

  laceWidth: 0.34,
  laceHeight: 0.05,
  laceLength: 0.1,
  laceZOffset: 0.1,
  laceClearance: 0.02, // gap above the toe box top
}

export const ICE_SKATE_COLORS = {
  boot: '#2b6fe0',
  sole: '#20242b',
  blade: '#c9ced6',
  lace: '#eef1f5',
}
