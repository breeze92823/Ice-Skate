// Fire/spark halo flourish for the top skate rack tier only (index 9 —
// "SkateRackTier10", the last/rarest item, speed 2000 / 250000 wins). Pure
// display, unrelated to owned/equipped state — SkateRackItem always renders
// it for this one tier, same as itemColor now always showing regardless of
// ownership. Modeled after a reference image of a tilted swirling ring of
// flame motes with a few longer sparks streaking outward.
export const FIRE_EFFECT_TIER_INDEX = 9

// Small flame-colored motes swirling around a tilted ring.
export const FIRE_RING = {
  count: 14,
  radius: 0.32,
  radiusJitter: 0.05,
  particleSize: 0.055,
  yJitter: 0.05,
  swirlSpeed: 2.2, // rad/sec around the ring's local Y
  flickerSpeed: 7, // rad/sec, phase-shifted per particle
}

// Longer thin shards streaking outward through/past the ring, same spin.
export const FIRE_SPARKS = {
  count: 6,
  minRadius: 0.28,
  maxRadius: 0.62,
  length: 0.22,
  width: 0.025,
  travelSpeed: 0.35, // radius units/sec, loops minRadius -> maxRadius
  spinSpeed: 1.4, // rad/sec around the ring's local Y
}

// Fixed diagonal tilt on the whole effect group, matching the reference
// image's off-axis ring rather than a flat horizontal halo.
export const FIRE_TILT = { x: Math.PI / 5, z: Math.PI / 9 }

// Height above the pad the effect is centered at — roughly the equipped
// skate's own mid-height at SkateRackItem's ITEM_SCALE.
export const FIRE_CENTER_Y = 0.22

export const FIRE_PALETTE = ['#ff6a00', '#ff9d1f', '#ffcf3f', '#ff2d1a', '#ffb347']
export const FIRE_SPARK_COLOR = '#ffb020'
