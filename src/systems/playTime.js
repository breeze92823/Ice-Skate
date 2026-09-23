// Total wall-clock time this account has spent in the game (store's
// timePlayed) — stepped once per frame from GameLoop, same "framework-free
// module stepped from the loop" shape as every other systems/*.js step().
// Unlike speedGain.js, this isn't gated on walking/activity: any unpaused
// frame counts, matching what a player would call "time played". Guests
// accumulate it locally like every other stat; only a signed-in save
// persists it (systems/net.js's progressPayload()).
//
// Buffered here and flushed to the store roughly once a second rather than
// every frame — store/useGameStore.js has no subscribeWithSelector
// middleware, so a plain .subscribe(fn) (systems/net.js's debounce triggers)
// fires on ANY set(), and committing every single frame would turn a
// once-a-session stat into 60 store notifications/sec for no visible gain —
// a "time played" readout only ever needs second-level granularity anyway.
import { useGameStore } from '../store/useGameStore.js'

const FLUSH_INTERVAL = 1 // seconds
let buffered = 0

export function step(dt) {
  if (!(dt > 0)) return
  buffered += dt
  if (buffered < FLUSH_INTERVAL) return
  const toCommit = buffered
  buffered = 0
  useGameStore.getState().addPlayTime(toCommit)
}
