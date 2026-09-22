// Decorative "win panel" pickup, imported from the sibling project
// Laser-Escape (its data/glowFloorPanel.js + components/GlowFloorPanelProp)
// — a small Blender-authored glTF whose material is patched at mount time
// into a flat vertical glow gradient (see GlowFloorPanelProp.jsx). Walking
// onto it awards Wins once per visit (systems/glowFloorPanel.js) — the one
// place useGameStore's awardWins was already wired for but never called.
import { GROUND_Y, ISLAND_X, ISLAND_Z } from './hub.js'

export const GLOW_FLOOR_PANEL_MODEL_URL = '/models/glow_floor_panel.glb'

// Local-space (pre-scale) vertical extent of the glow_floor_panel mesh — the
// glTF POSITION accessor's y min/max (min 0, max below), read off the
// imported .glb. Unchanged from Laser-Escape's own copy since it's the same
// file. GlowFloorPanelProp uses this to fade the material from opaque at the
// base up to fully transparent by the mesh's vertical midpoint.
export const GLOW_FLOOR_PANEL_TOP_Y = 0.5628908276557922

// Scale baked into Laser-Escape's placements; kept as-is here so the panel
// reads at the same real-world size (roughly 3.3m across).
export const GLOW_FLOOR_PANEL_SCALE = 2.757075548171997

// Single panel, dead center of the main island's top surface
// (data/hub.js's [ISLAND_X, GROUND_Y, ISLAND_Z]) — clear of the road strip
// (data/road.js: x -5..5, z -17..17) and the treadmill (hub.js's
// TREADMILL_POSITION). Level layout is data here, not a Blender file (same
// convention as hub.js/road.js), so this is an authored position, not a
// Blender sync. Kept as an array (rather than a single object) so
// GlowFloorPanels.jsx/systems/glowFloorPanel.js need no special-casing if a
// second panel is ever added.
export const GLOW_FLOOR_PANEL_POSITIONS = [[0, GROUND_Y, 0]]

// Flat Wins granted the moment the player steps onto the panel.
export const GLOW_FLOOR_PANEL_WINS = [10]

// Horizontal (X/Z) distance from the panel's placement position within which
// the player counts as standing on it.
export const GLOW_FLOOR_PANEL_RANGE = 3.5
