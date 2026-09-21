// "LEVEL UP!" banner tunables. Whenever the store's `level` rises, a big
// cartoon banner pops in at the top-centre of the screen, holds, then floats
// up and fades. Drawn by components/hud/LevelUpPopup.jsx as a DOM sibling of
// the canvas; never re-renders per frame — a transient store subscription
// drives a single Web-Animations run on the node.
export const LEVEL_UP_POPUP_TITLE = 'LEVEL UP!'
export const LEVEL_UP_POPUP_SUBLABEL = (level) => `Level ${level}`

// Gap from the top edge of the screen, in CSS pixels.
export const LEVEL_UP_POPUP_TOP = 116

// Animation phase lengths, in milliseconds: elastic pop-in, full-opacity
// hold, then float-up fade-out.
export const LEVEL_UP_POPUP_IN_MS = 420
export const LEVEL_UP_POPUP_HOLD_MS = 900
export const LEVEL_UP_POPUP_OUT_MS = 560

export const LEVEL_UP_POPUP_POP_SCALE_FROM = 0.4
export const LEVEL_UP_POPUP_POP_OVERSHOOT = 1.14

export const LEVEL_UP_POPUP_RISE = 46

export const LEVEL_UP_POPUP_TITLE_FONT_PX = 68
export const LEVEL_UP_POPUP_SUB_FONT_PX = 32

export const LEVEL_UP_POPUP_TEXT_STROKE = 5

export const LEVEL_UP_POPUP_TITLE_COLOR = '#ffd21e'
