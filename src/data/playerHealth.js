// PVP player health balance constants. This project has no PVP zone yet
// (data/pvpZone.js's isInPvpZone always returns false), so systems/
// playerHealth.js's health singleton never actually takes damage — these
// stay wired for when a PVP zone is added.
export const PLAYER_MAX_HP = 100

// Time the "You Died" prompt holds before Water.jsx's drowning respawns the
// player at data/hub.js's SPAWN.
export const RESPAWN_DELAY_MS = 2000

// HUD health bar, just above the "N Power" caption (components/hud/
// LevelBar.jsx). Shown only while the local player is in the PVP zone.
export const HUD_HEALTH_BAR = {
  WIDTH: 130,
  HEIGHT: 8,
  BORDER: 2,
  BG_COLOR: '#3a0000',
  FILL_COLOR: '#3ddc55',
}
