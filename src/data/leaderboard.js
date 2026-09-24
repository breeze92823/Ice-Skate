// "SPEED — Global Leaderboard" standee, styled after the reference mock (a
// dark scoreboard with a red crown/frame trim, an orange "SPEED" title, tab
// filters and a ranked list of players). Same board shape as
// SkateRackSign.jsx/SkateRack.js — all three boards are live now:
// components/LeaderboardSign.jsx reads real ranked rows off systems/net.js's
// getLeaderboard(stat, limit) for any instance whose METRICS entry below has
// a `stat`. `stat === null` (kept as a fallback, not reachable today) still
// renders the fixed ENTRIES roster further down.
import { TREADMILL_POSITION, TREADMILL_ROTATION_Y } from './hub.js'

// Board + stand shape, same "bezel box + inset face plane" split as
// SkateRackSign.jsx, just sized to hold a title, tab row and rank list
// instead of one line of text.
export const LEADERBOARD_SHAPE = {
  boardWidth: 3.0,
  boardHeight: 3.9,
  boardThick: 0.16,
  footWidth: 1.5,
  footHeight: 0.12,
  footDepth: 0.7,
  postWidth: 0.26,
  postHeight: 0.85,
}

// Standing near the hub's own south guard wall (HubWall.south, data/
// hubWalls.js — the room's south perimeter, not one of the stage-corridor
// guard-wall containers), off to the side of the treadmill row rather than
// centered on it. Turned 90° from the treadmills' own facing (+Z) — see
// data/hub.js's TREADMILL_ROTATION_Y — which points the board's front face
// (and its local +X "width" axis) along world +Z, not +X.
const BASE_POSITION = [-60, TREADMILL_POSITION[1],-40]
const BASE_ROTATION_Y = TREADMILL_ROTATION_Y + Math.PI / 2
// Uniformly resizes each board (LeaderboardSign.jsx's outer <group scale>),
// same convention as data/treadmill.js's per-instance `scale`.
const BASE_SCALE = 3.5

// Two duplicates stood to the right of the original, in the direction a
// player facing the board's front (+X, see BASE_ROTATION_Y above) would call
// their own right hand — world +Z. Spaced edge-to-edge with a flat 5m gap
// between neighboring boards, not 5m between centers, so the boards don't
// overlap once LEADERBOARD_SCALE has grown them past their raw boardWidth.
const ROW_GAP = 5
const BOARD_SPAN = LEADERBOARD_SHAPE.boardWidth * BASE_SCALE
const ROW_STEP = BOARD_SPAN + ROW_GAP

// Each board tracks a different stat, its title/trim colored to match —
// red/yellow/green reused from colors already established elsewhere in the
// project (MEDAL_COLORS' gold and the "Equipped"/SkateRackLabel green) so
// the palette stays consistent rather than inventing new hexes. `stat` is
// the store/useGameStore.js field (also what systems/net.js's getLeaderboard
// ranks by) each board reads live; `null` means no such field exists and the
// board keeps rendering the fixed ENTRIES roster below instead. `timePlayed`
// (systems/playTime.js) is in seconds — components/LeaderboardSign.jsx
// formats it with data/format.js's formatDuration instead of formatShort.
const METRICS = [
  { title: 'Speed', color: '#e8484f', stat: 'speed' },
  { title: 'Wins', color: '#ffd21e', stat: 'wins' },
  { title: 'Most Time', color: '#5fe37a', stat: 'timePlayed' },
]

export const LEADERBOARD_INSTANCES = METRICS.map((metric, i) => ({
  name: `LeaderboardSign${i + 1}`,
  title: metric.title,
  color: metric.color,
  stat: metric.stat,
  position: [BASE_POSITION[0], BASE_POSITION[1], BASE_POSITION[2] + i * ROW_STEP],
  rotationY: BASE_ROTATION_Y,
  scale: BASE_SCALE,
}))

// Filter tabs across the reference mock's header row — decorative only (no
// interaction), "All" shown selected/highlighted same as the source image.
export const LEADERBOARD_TABS = [
  { label: 'All', color: '#4b5262', selected: true },
  { label: 'Month', color: '#e558c4' },
  { label: 'Week', color: '#8b5bff' },
  { label: 'Day', color: '#4fce6e' },
]

// Rank medal colors for the top 3 rows; everything past that reads in plain
// white, same "gold/silver/bronze then white" convention as most in-game
// leaderboards. Exported as rankColorFor() so components/LeaderboardSign.jsx
// can apply the same scheme to LIVE rows (rank computed at render time from
// systems/net.js's getLeaderboard() ordering), not just this fixed roster.
const MEDAL_COLORS = ['#ffd21e', '#c9d3dc', '#d98a4b']
export function rankColorFor(rank) {
  return MEDAL_COLORS[rank - 1] ?? '#e9edf1'
}

// A live board's own row (systems/net.js getLeaderboard()'s `isSelf` flag)
// tints its name this color — a small "that's you" cue, same idea as
// Laser-Escape's leaderboardBoard.js selfNameColor.
export const LEADERBOARD_SELF_NAME_COLOR = '#8dffb0'

// The self row's full-width background stripe (unlit glow strip behind the
// rank/name/value text, components/LeaderboardSign.jsx) — a stronger,
// glance-visible highlight than the name-color tint alone, same idea as
// Laser-Escape's leaderboardBoard.js panelStripeSelf, just an unlit glow
// plane here rather than a lit panel material.
export const LEADERBOARD_SELF_ROW_COLOR = '#39ff88'

// Fictional roster — not the real handles from the reference screenshot,
// just styled the same way (rank, @handle, avatarColor swatch, speed value).
// Only the Most Time board (no live `stat`, see METRICS above) still renders
// this; Speed/Wins pull real ranked rows from systems/net.js's
// getLeaderboard() instead. `speed` is a plain number, run through
// data/format.js's formatShort at render time (project convention, see
// SkateRackLabel.jsx) rather than the source image's own "Qi" suffix.
const ENTRIES = [
  { name: '@frostbyte_rk', speed: 482_000_000, avatarColor: '#ff7a3d' },
  { name: '@glaciergrind', speed: 417_000_000, avatarColor: '#4fce6e' },
  { name: '@nova.skates', speed: 398_500_000, avatarColor: '#4fa9ff' },
  { name: '@zephyr_lace', speed: 356_000_000, avatarColor: '#e558c4' },
  { name: '@polar_dash99', speed: 331_200_000, avatarColor: '#ffd21e' },
  { name: '@icebound_kai', speed: 309_700_000, avatarColor: '#8b5bff' },
  { name: '@shardrunner', speed: 288_900_000, avatarColor: '#ff5f6d' },
]

export const LEADERBOARD_ENTRIES = ENTRIES.map((entry, i) => ({
  ...entry,
  rank: i + 1,
  rankColor: rankColorFor(i + 1),
}))
