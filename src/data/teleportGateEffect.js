// Swirling mote field layered in front of each teleport gate's baked
// nebula face (systems/teleportGateTexture.js) — gives the portal actual
// depth/motion instead of relying only on a flat rotating texture. Palette
// matches the bake's CLOUD_PALETTE/SPARK_PALETTE so the two read as one
// effect. Radii below are fractions of a gate's own `size` (data/teleportGate.js),
// not absolute metres, since gates can be sized differently.
export const GATE_PARTICLES = {
  count: 260,
  maxRadiusFrac: 0.46, // fraction of gate size, keeps motes inside the disc
  minRadiusFrac: 0.03,
  depthJitter: 0.05, // metres, local Z scatter so coincident motes don't z-fight
  particleSize: 0.045, // metres, base disc radius
  sizeJitter: 0.5, // +/- fraction of particleSize
  spinSpeed: 0.5, // rad/sec, swirl around the gate's local Z
  driftSpeed: 0.18, // rad/sec, per-particle radial breathing
  driftAmount: 0.35, // fraction of a particle's own radius
  flickerSpeed: 3.5, // rad/sec, phase-shifted per particle
}

export const GATE_PARTICLE_PALETTE = ['#ffffff', '#c9a6ff', '#9fd0ff', '#b98bff', '#6f5cff']
