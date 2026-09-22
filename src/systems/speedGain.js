// Speed-from-walking (a framework-free, mutable module, stepped once per
// frame from GameLoop — Tech.md §5.1 style). This project's equivalent of
// Laser-Escape's laser-triggered Power gain: continuous movement input
// re-fires a Speed gain every WALK_GAIN_INTERVAL seconds, the same cadence
// systems/actionTracker.js used for a held laser there. Releasing every
// movement key (or dying) resets the timer, so only unbroken walking counts
// — tapping a direction key on and off doesn't accumulate toward a gain.
import { inputState } from './input.js'
import { health as playerHealth } from './playerHealth.js'
import { useGameStore } from '../store/useGameStore.js'
import { spawnActionPopup } from './actionPopups.js'
import { WALK_GAIN_INTERVAL } from '../data/progression.js'

let walkElapsed = 0

export function step(dt) {
  const walking = inputState.move.x !== 0 || inputState.move.z !== 0

  if (playerHealth.dead || !walking) {
    walkElapsed = 0
    return
  }

  walkElapsed += dt
  while (walkElapsed >= WALK_GAIN_INTERVAL) {
    walkElapsed -= WALK_GAIN_INTERVAL
    spawnActionPopup(useGameStore.getState().gainSpeed(1))
  }
}
