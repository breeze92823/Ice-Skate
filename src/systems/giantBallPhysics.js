import { GIANT_BALL } from '../data/giantBall.js'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'

// Rigid-ball loop: free-fall from its authored spawn point, land on
// Slope_Block, let gravity's component along the tilted surface roll it
// downhill, and once it passes GIANT_BALL.resetZ, reset back to the spawn
// point and fall again. This project has no physics engine — collision is
// hand-rolled the same way playerMovement.js's bandedBlockTopAt does it
// (GROUND_BLOCKS' `bands`/`topLocalZ` local-depth lookup for Slope_Block's
// tapered footprint), just for one free-rolling sphere instead of the
// player capsule.
const SLOPE = GROUND_BLOCKS.find((b) => b.name === 'Slope_Block')
const RADIUS = GIANT_BALL.radius

const GRAVITY = -22 // m/s^2, matches playerMovement.js

// Mutated in place, never reallocated — GiantBall.jsx reads this every
// frame without a React subscription (same convention as playerState.js).
export const giantBall = {
  position: { x: GIANT_BALL.position[0], y: GIANT_BALL.position[1], z: GIANT_BALL.position[2] },
  velocity: { x: 0, y: 0, z: 0 },
  spin: 0, // accumulated roll angle about world X, radians (visual only)
}

function resetGiantBall() {
  const [x, y, z] = GIANT_BALL.position
  giantBall.position.x = x
  giantBall.position.y = y
  giantBall.position.z = z
  giantBall.velocity.x = 0
  giantBall.velocity.y = 0
  giantBall.velocity.z = 0
  giantBall.spin = 0
}

// Same local-depth lookup as playerMovement.js's bandedBlockTopAt.
function slopeContactAt(x, z) {
  const [bx, by, bz] = SLOPE.position
  const cos = Math.cos(SLOPE.rotationX)
  const sin = Math.sin(SLOPE.rotationX)
  const ly = (SLOPE.topLocalZ * sin - (z - bz)) / cos
  const band = SLOPE.bands.find((b) => ly >= b.y[0] && ly <= b.y[1])
  const top = by + ly * sin + SLOPE.topLocalZ * cos
  const inFootprint = !!band && Math.abs(x - bx) <= band.halfWidth
  return { top, inFootprint }
}

export function step(dt) {
  if (dt <= 0) return

  const v = giantBall.velocity
  const p = giantBall.position

  v.y += GRAVITY * dt
  p.x += v.x * dt
  p.y += v.y * dt
  p.z += v.z * dt

  const { top, inFootprint } = slopeContactAt(p.x, p.z)
  // Sphere-on-tilted-plane rest height: the surface point plus one radius
  // along the surface normal, whose vertical component is radius*cos(tilt).
  const restHeight = top + RADIUS * Math.cos(SLOPE.rotationX)

  if (inFootprint && p.y <= restHeight) {
    p.y = restHeight
    v.y = 0
    // Gravity's component along the incline (d(height)/dz = -tan(rotationX),
    // so the downhill tangential accel is -GRAVITY * tan(rotationX)).
    v.z -= GRAVITY * Math.tan(SLOPE.rotationX) * dt
  }

  // Roll without slipping about world X: omega = v.z / radius.
  giantBall.spin += (v.z / RADIUS) * dt

  // Reached the configured bottom trigger, or somehow missed the ramp
  // entirely — either way, loop back to the start.
  if (p.z <= GIANT_BALL.resetZ || p.y < -20) {
    resetGiantBall()
  }
}
