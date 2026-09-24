import { player } from './playerState.js'
import { health, die } from './playerHealth.js'
import { CRUSHER_UP, CRUSHER_UP_SIZE } from '../data/crusherUp.js'
import { currentY } from './crusherUpAnim.js'

// Stage10's CrusherUp: touching it while it's punched up through the floor
// kills the player outright — same death/respawn flow as CrusherWall/
// CrusherSide's own crush checks (systems/crusherCrush.js,
// crusherSideCrush.js), just moving vertically instead of horizontally, and
// yawed about Y so the horizontal footprint test undoes that yaw first (same
// cosY/sinY local-frame projection as playerMovement.js's
// resolveGroundBlocks, since CRUSHER_UP's `rotationY` isn't 0).
const [WIDTH, HEIGHT, DEPTH] = CRUSHER_UP_SIZE
const { position, rotationY } = CRUSHER_UP
const cosY = Math.cos(rotationY)
const sinY = Math.sin(rotationY)

export function step() {
  if (health.dead) return

  const wy = currentY()
  const playerBottom = player.position.y
  const playerTop = player.position.y + player.dims.height
  if (playerTop <= wy - HEIGHT / 2 || playerBottom >= wy + HEIGHT / 2) return

  const dx = player.position.x - position[0]
  const dz = player.position.z - position[2]
  const lx = dx * cosY - dz * sinY
  const lz = dx * sinY + dz * cosY
  const hx = WIDTH / 2 + player.dims.radius
  const hz = DEPTH / 2 + player.dims.radius
  if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) return

  die()
}
