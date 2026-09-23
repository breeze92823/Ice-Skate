// The player singleton. Mutated in place, never reallocated, so the frame
// loop can read it without a React subscription.
export const player = {
  // Capsule base (feet) in world space, +Y up.
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  grounded: true,
  facing: Math.PI, // yaw the character model faces, radians
  // Current target ground speed (m/s) — fixed (data/progression.js's
  // WALK_SPEED_BASE), not tied to the store's Speed stat. Read by
  // PlayerAvatar.jsx to normalize the run-cycle rate.
  moveSpeed: 6,
  // Live collider dimensions. Seeded from the defaults below, but the
  // avatar's height/shoulderWidth proportions rescale them.
  dims: { radius: 0.4, height: 1.8 },
}

export const PLAYER_RADIUS = 0.4
export const PLAYER_HEIGHT = 1.8 // total capsule height, metres (1u = 1m)

// Rescale the collider to match the drawn avatar.
export function setDims(radius, height) {
  player.dims.radius = radius
  player.dims.height = height
}

export function resetDims() {
  setDims(PLAYER_RADIUS, PLAYER_HEIGHT)
}

export function resetPlayer(spawn = { x: 0, y: 0, z: 0 }) {
  player.position.x = spawn.x
  player.position.y = spawn.y
  player.position.z = spawn.z
  player.velocity.x = 0
  player.velocity.y = 0
  player.velocity.z = 0
  player.grounded = true
  player.facing = Math.PI / 2
}
