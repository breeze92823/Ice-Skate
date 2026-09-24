import { player } from './playerState.js'
import { health, die } from './playerHealth.js'
import { CRUSHER_WALLS, CRUSHER_WALL_SIZE } from '../data/crusherWall.js'
import { currentZ } from './crusherAnim.js'

// Stage9's CrusherWall pair: touching either slab while it's sliding closed
// kills the player outright — same death/respawn flow as Hammer's crush
// (systems/hammerCrush.js), just box-vs-capsule instead of
// cylinder-vs-capsule. Horizontal test reuses the same expand-by-radius AABB
// check as resolveSideWalls (playerMovement.js), just to detect overlap
// instead of push-resolving out of it.
const [WIDTH, HEIGHT, DEPTH] = CRUSHER_WALL_SIZE

export function step() {
  if (health.dead) return

  const playerBottom = player.position.y
  const playerTop = player.position.y + player.dims.height

  for (const { position } of CRUSHER_WALLS) {
    const wy = position[1]
    if (playerTop <= wy - HEIGHT / 2 || playerBottom >= wy + HEIGHT / 2) continue

    const wz = currentZ(position)
    const hx = WIDTH / 2 + player.dims.radius
    const hz = DEPTH / 2 + player.dims.radius
    const dx = player.position.x - position[0]
    const dz = player.position.z - wz
    if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue

    die()
    return
  }
}
