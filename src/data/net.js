// Multiplayer / netcode tunables (src/data/* owns every tunable number, same
// convention as data/progression.js/data/bloxity.js). The game is
// single-player-complete: nothing below gates gameplay. The netcode only
// adds *presence* — an in-world leaderboard fed by other players' live
// stats — and every path through systems/net.js is built so a slow or
// absent server degrades to solo play, never a stall (same stance as
// systems/bloxity.js).

// Ice-skate-backend (../Ice-skate-backend) deploys to two separate Bloxity
// Legion channels — a `dev` branch push goes to the `dev` channel, `main`
// goes to `prod` — and each channel gets its own hostname once deployed.
// Bloxity gives the running frontend no runtime signal for which channel
// it's serving, so the two server URLs are read from two separately-named
// env vars rather than one, and this project's own deploy.yml picks the
// active one at BUILD time via Vite's `--mode` flag (`npm run build:dev` ->
// `.env.development`/MODE 'development', `npm run build` -> MODE
// 'production'). A local `npm start` in Ice-skate-backend listens on
// ws://localhost:2567 by default (its own README), so that's the DEV
// fallback — zero .env setup needed for local dev against a local server.
export const SERVER_URL_DEV = import.meta.env.VITE_SERVER_URL_DEV || 'ws://localhost:2567'
// No sane fallback for a real deployed hostname — set VITE_SERVER_URL_MAIN
// (repo variable SERVER_URL_MAIN in Ice-Skate's own deploy.yml) once the
// game is registered and deployed on Bloxity Legion. Empty means "no prod
// server configured yet"; systems/net.js treats that exactly like an
// unreachable server (stays solo, never throws).
export const SERVER_URL_MAIN = import.meta.env.VITE_SERVER_URL_MAIN || ''

export const SERVER_URL = import.meta.env.MODE === 'production' ? SERVER_URL_MAIN : SERVER_URL_DEV

// Room handler name registered in Ice-skate-backend's src/app.config.ts.
export const ROOM_NAME = 'rink'

// One join attempt is abandoned after this long. A cold host normally
// answers well inside this; a dead host never will, and we must not hang on it.
export const JOIN_TIMEOUT_MS = 45_000

// Backoff between connect attempts. The index clamps to the last entry, so
// after a handful of tries it settles at one quiet attempt per 30s forever —
// enough to pick the server back up when it wakes, without hammering it.
export const RETRY_BACKOFF_MS = [3_000, 6_000, 12_000, 20_000, 30_000]

// From attempt #2 onward the HUD banner flips from "connecting" to "server
// is waking up — playing solo meanwhile", because by then a cold start is
// the likely cause and the player should know they can just play.
export const SOLO_NOTICE_AFTER_ATTEMPT = 2

// A mid-game socket drop is ridden out by the @colyseus/sdk Room's own
// reconnection (message buffering + exponential backoff). systems/net.js
// only takes over — dropping to solo and running the retry loop above —
// once that built-in recovery has exhausted its attempts and fires
// room.onLeave.

// Local player -> server: cadence of the `move` relay. Sent at MOVE_SEND_HZ
// while the transform is changing, and once every MOVE_IDLE_MS at rest so a
// player who joins after us still sees where we're stood.
export const MOVE_SEND_HZ = 12
export const MOVE_IDLE_MS = 1_000

// Smallest change worth a packet (metres / radians / gait fraction). Below
// all of these and not moving, we're "at rest" and fall back to the idle
// cadence.
export const MOVE_EPSILON_POS = 0.02
export const MOVE_EPSILON_YAW = 0.01

// Remote bodies ease toward their last reported transform at this fraction
// per second, smoothing the MOVE_SEND_HZ packets into continuous motion.
export const REMOTE_LERP_RATE = 16

// A remote whose last packet is older than this is treated as gone even if
// the server never sent onRemove (covers a silently dropped socket): its
// body fades and is culled.
export const REMOTE_STALE_MS = 8_000

// Remote players, if RemotePlayers.jsx ever ships, must be capped rather
// than each paying the full multi-mesh Bloxity-avatar cost. Past this
// count, extra players simply aren't tracked.
export const MAX_REMOTE_BODIES = 8

// Cap on our serialised avatar JSON ({e:<equipped>,p:<proportions>}) —
// matches the server's AVATAR_MAX_LEN. A full set serialises to a few
// hundred bytes.
export const AVATAR_MAX_LEN = 4096

// Debounce on re-sending our avatar after the portal reports a change
// (customizer edits fire a burst of proportion updates).
export const AVATAR_RESEND_DEBOUNCE_MS = 600

// Debounce on re-sending our own speed/rebirth/wins after any of them
// change. An actively-grinding AFK player can gain Speed many times a
// second (systems/speedGain.js), and an in-world leaderboard only needs a
// roughly-current rank, not a per-gain packet.
export const STATS_RESEND_DEBOUNCE_MS = 1_000

// Debounce on re-sending the signed-in player's durable save (server's
// Mongo `players` collection, via RinkRoom.ts's `saveProgress`) — longer
// than STATS_RESEND_DEBOUNCE_MS since this hits Mongo, not just an
// in-memory schema field, and a save a few seconds behind is harmless (the
// next change reschedules it, and teardown() flushes one final time on the
// way out).
export const PROGRESS_RESEND_DEBOUNCE_MS = 3_000

// Wait up to this long for the Bloxity auth state to settle before the
// first connect, so a signed-in player joins under their real name rather
// than the "Player" fallback. Not waited on reconnects.
export const USERNAME_WAIT_MS = 2_500

// --- Remote body look (if RemotePlayers.jsx ever ships) --------------------
export const REMOTE_BODY = {
  RADIUS: 0.4,
  HEIGHT: 1.8,
  COLOR: '#4aa3ff',
  NAME_HEIGHT: 2.35,
  NAME_COLOR: '#ffffff',
  NAME_OUTLINE: '#000000',
  NAME_SIZE: 0.32,
  FADE_RATE: 3, // opacity/sec the whole body fades in on spawn / out when stale
}
