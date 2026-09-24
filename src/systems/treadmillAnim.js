import { player } from './playerState.js'
import { TREADMILLS } from '../data/treadmill.js'
import { useGameStore } from '../store/useGameStore.js'

// Per-treadmill belt-scroll state — mutated in place, read every frame by
// components/TreadmillProp.jsx (belt texture's V offset) without a React
// subscription, same convention as groundPhase.js's singleton. `offset` is
// UV space (wraps every 1.0); it only advances while the player's feet are
// within that treadmill's own deck footprint, so the belt "runs" only once
// someone actually steps on it, like a real machine. Keyed by name, and
// iterates TREADMILLS generically so any number of treadmills just works.
export const treadmillAnim = new Map(TREADMILLS.map((t) => [t.name, { occupied: false, offset: 0 }]))

// True while the player is standing on any occupied deck — read every frame
// by PlayerAvatar.jsx to force the walking gait even if the player isn't
// pressing a move key, same mutable-singleton convention as `treadmillAnim`
// above, kept as its own plain object (rather than derived by scanning the
// map) so that read costs nothing.
export const anyTreadmillOccupied = { value: false }

// The `speed` tier (1/2/3, matching data/treadmill.js's per-instance `speed`)
// of whichever deck the player is currently occupying, else 1 — read by
// speedGain.js so standing on Treadmill2/Treadmill3 gains Speed at that
// deck's own multiplier instead of the flat walking rate.
export const occupiedTreadmillSpeed = { value: 1 }

const FEET_MARGIN = 0.35 // metres inset from the deck's outer edge before it counts as "on"
const DECK_Y_TOLERANCE = 1 // metres above/below the treadmill's own base — covers either model's belt height

// Undoes the treadmill's own yaw the same way playerMovement.js's
// groundBlockTopAt does, then tests the player's feet against the deck's
// half-extents.
function isOnDeck({ position, rotationY, deckWidth, deckDepth }) {
  const [tx, ty, tz] = position
  const dx = player.position.x - tx
  const dz = player.position.z - tz
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  const localX = dx * cos - dz * sin
  const localZ = dx * sin + dz * cos
  if (Math.abs(localX) > deckWidth / 2 - FEET_MARGIN) return false
  if (Math.abs(localZ) > deckDepth / 2 - FEET_MARGIN) return false
  return Math.abs(player.position.y - ty) < DECK_Y_TOLERANCE
}

export function step(dt) {
  let occupied = false
  let occupiedSpeed = 1
  const rebirth = useGameStore.getState().rebirth
  for (const treadmill of TREADMILLS) {
    const state = treadmillAnim.get(treadmill.name)
    // Below the deck's own rebirthRequired, it never registers as occupied —
    // no belt scroll, no forced walk gait, no treadmill-walking Speed gain.
    state.occupied = rebirth >= treadmill.rebirthRequired && isOnDeck(treadmill)
    if (state.occupied) {
      occupied = true
      occupiedSpeed = treadmill.speed
      state.offset = (state.offset + (treadmill.beltSpeed / treadmill.deckDepth) * dt) % 1
    }
  }
  anyTreadmillOccupied.value = occupied
  occupiedTreadmillSpeed.value = occupiedSpeed
}
