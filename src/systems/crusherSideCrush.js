import { player } from './playerState.js'
import { health, die } from './playerHealth.js'
import { CRUSHER_SIDE, CRUSHER_SIDE_SIZE } from '../data/crusherSide.js'
import { currentX } from './crusherSideAnim.js'

// Stage8's CrusherSide: touching it while it's punched inward kills the
// player outright — same death/respawn flow and box-vs-capsule AABB test as
// CrusherWall's own crush check (systems/crusherCrush.js), just a single
// object on the X axis instead of a pair on Z.
const [WIDTH, HEIGHT, DEPTH] = CRUSHER_SIDE_SIZE
const { position } = CRUSHER_SIDE

export function step() {
  if (health.dead) return

  const playerBottom = player.position.y
  const playerTop = player.position.y + player.dims.height

  const wy = position[1]
  if (playerTop <= wy - HEIGHT / 2 || playerBottom >= wy + HEIGHT / 2) return

  const wx = currentX()
  const hx = WIDTH / 2 + player.dims.radius
  const hz = DEPTH / 2 + player.dims.radius
  const dx = player.position.x - wx
  const dz = player.position.z - position[2]
  if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) return

  die()
}
