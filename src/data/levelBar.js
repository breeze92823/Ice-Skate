// HUD level-bar tunables. The bar sits bottom-centre of the screen: a
// "<Speed> Speed" caption, a rounded track that fills yellow -> orange -> red
// as Speed climbs toward the next level, and "Level N" / "<into> / <span>"
// overlaid on it. Drawn by components/hud/LevelBar.jsx as a DOM sibling of
// the canvas, never re-rendering per frame — its readouts are written to the
// DOM from a throttled store subscription.
//
// LEVEL_BAR_ICON_SIZE/OVERHANG/URL are also shared by RebirthLevelBar.jsx
// for its own badge in the Rebirth confirm modal.

// Milliseconds between textContent / fill-width writes — a ~10Hz throttle
// for numeric HUD readouts.
export const LEVEL_BAR_POLL_MS = 100

// Track size in CSS pixels. Width is capped to the viewport by LEVEL_BAR_MAX_VW.
export const LEVEL_BAR_WIDTH = 880
export const LEVEL_BAR_HEIGHT = 80
export const LEVEL_BAR_MAX_VW = 88

// Track border and the black text outline.
export const LEVEL_BAR_BORDER = 6
export const LEVEL_BAR_TEXT_STROKE = 4

// Caption ("<Speed> Speed") and the on-bar labels ("Level N", "<into> / <span>").
export const LEVEL_BAR_CAPTION_FONT_PX = 30
export const LEVEL_BAR_LABEL_FONT_PX = 34

// Starburst badge at the left edge: rendered size, and how far its centre is
// pulled left of the track's left edge (fraction of its own size).
export const LEVEL_BAR_ICON_SIZE = 136
export const LEVEL_BAR_ICON_OVERHANG = 0.44

// Gap from the bottom edge of the screen, in CSS pixels.
export const LEVEL_BAR_BOTTOM = 28

// Fill transition when the value jumps (ms).
export const LEVEL_BAR_TRANSITION_MS = 200

// Left -> right fill: bright at the top, hot at the bottom edge.
export const LEVEL_BAR_FILL_GRADIENT =
  'linear-gradient(180deg, #ffe24d 0%, #ff9d00 52%, #ff2d00 100%)'

// Semi-transparent band behind the "<Speed> Speed" caption.
export const LEVEL_BAR_CAPTION_BAND =
  'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)'

export const LEVEL_BAR_CAPTION_BAND_PAD_X = 52
export const LEVEL_BAR_CAPTION_BAND_PAD_Y = 4

// Public-root path to the badge art — served straight out of public/.
export const LEVEL_BAR_ICON_URL = '/ui/action_popup.png'

// Extra shrink applied to RebirthLevelBar's height/border/icon/label (on top
// of its own 0.5 width scale) when the Rebirth modal renders in
// touch/compact mode.
export const REBIRTH_LEVEL_BAR_TOUCH_SCALE = 0.6
