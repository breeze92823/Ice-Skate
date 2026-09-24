import { player } from './playerState.js'

// Recenters the shadow-casting key light on the player every frame instead
// of leaving it fixed at the origin — the guard-wall corridors now extend
// far past the ±45-unit shadow frustum, so a static light left most of the
// level's shadow-map sampling outside the frustum (patchy lit/unlit faces).
const OFFSET = { x: 30, y: 45, z: 20 }

export const sunTarget = { x: 0, y: 0, z: 0 }
export const sunPosition = { x: OFFSET.x, y: OFFSET.y, z: OFFSET.z }

export function step() {
  sunTarget.x = player.position.x
  sunTarget.y = player.position.y
  sunTarget.z = player.position.z
  sunPosition.x = player.position.x + OFFSET.x
  sunPosition.y = player.position.y + OFFSET.y
  sunPosition.z = player.position.z + OFFSET.z
}
