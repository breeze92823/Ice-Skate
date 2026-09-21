import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'

// Kinematic capsule, stepped once per frame: apply input -> gravity ->
// integrate -> clamp to the flat ground plane. No collider list — this
// project has nothing to collide with but the ground.
export const SPEED = 6 // m/s target ground speed (the avatar gait reads this)
const ACCEL = 45 // m/s^2 approach toward target velocity
const GRAVITY = -22 // m/s^2
const JUMP_SPEED = 7.5 // m/s
const GROUND_Y = 0 // flat ground plane height

function approach(v, key, target, maxDelta) {
  const d = target - v[key]
  if (d > maxDelta) v[key] += maxDelta
  else if (d < -maxDelta) v[key] -= maxDelta
  else v[key] = target
}

export function step(dt) {
  if (dt <= 0) return

  // Camera-relative ground basis.
  const yaw = getYaw()
  const fwdX = -Math.sin(yaw)
  const fwdZ = -Math.cos(yaw)
  const rightX = Math.cos(yaw)
  const rightZ = -Math.sin(yaw)

  const mv = inputState.move
  const wishX = fwdX * mv.z + rightX * mv.x
  const wishZ = fwdZ * mv.z + rightZ * mv.x

  approach(player.velocity, 'x', wishX * SPEED, ACCEL * dt)
  approach(player.velocity, 'z', wishZ * SPEED, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  player.velocity.y += GRAVITY * dt

  const p = player.position
  p.x += player.velocity.x * dt
  p.z += player.velocity.z * dt
  p.y += player.velocity.y * dt

  // Flat ground plane.
  if (p.y <= GROUND_Y) {
    p.y = GROUND_Y
    if (player.velocity.y < 0) player.velocity.y = 0
    player.grounded = true
  }

  // Face the direction of travel.
  if (Math.hypot(wishX, wishZ) > 0.01) {
    player.facing = Math.atan2(wishX, wishZ)
  }
}
