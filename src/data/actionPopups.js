// Speed-gain popup tunables. Every walking tick that raises Speed spawns
// one of these — the public/ui/action_popup.png badge with a "+N" readout —
// near the player. Simulated by systems/actionPopups.js, drawn by
// components/hud/ActionPopups.jsx as DOM siblings of the canvas.

// Fixed pool — the DOM nodes are created once at this capacity and recycled
// round-robin.
export const ACTION_POPUP_POOL_SIZE = 14

// Seconds a popup stays on screen, from spawn to fully gone.
export const ACTION_POPUP_LIFETIME = 0.95

// Seconds spent fading in from 0 -> 1 opacity at the very start.
export const ACTION_POPUP_FADE_IN = 0.09

// --- Pop-in flourish ---
export const ACTION_POPUP_POP_T = 0.24
export const ACTION_POPUP_POP_SCALE_FROM = 0.25
export const ACTION_POPUP_POP_OVERSHOOT = 2.4
export const ACTION_POPUP_HOP = 0.05

export const ACTION_POPUP_FADE_OUT_START = 0.55

// World anchor: the player's feet position raised this many metres.
export const ACTION_POPUP_ANCHOR_HEIGHT = 1.3

// Random scatter applied once at spawn, in normalized-viewport units.
export const ACTION_POPUP_SPREAD_X = 0.16
export const ACTION_POPUP_SPREAD_Y = 0.12

// --- Travel ---
export const ACTION_POPUP_TARGET_Y = -0.95
export const ACTION_POPUP_CENTER_PULL = 0.7

export const ACTION_POPUP_IMAGE_SIZE = 120
export const ACTION_POPUP_FONT_SIZE = 40

export const ACTION_POPUP_IMAGE_URL = '/ui/action_popup.png'
