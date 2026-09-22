// Decorative "win panel" pickup, imported from the sibling project
// Laser-Escape (its data/glowFloorPanel.js + components/GlowFloorPanelProp)
// — a small Blender-authored glTF whose material is patched at mount time
// into a flat vertical glow gradient (see GlowFloorPanelProp.jsx). Walking
// onto it awards Wins once per visit (systems/glowFloorPanel.js) — the one
// place useGameStore's awardWins was already wired for but never called.
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

// One panel per stage (see project-stage-layout memory), synced from
// Blender/world.blend's WinPad.002-WinPad.006 objects (Stage2-Stage6
// collections respectively) via the project-blender-previz-rig memory's
// axis conversion: three.(x, y, z) = (blender.x, blender.z, -blender.y).
// Kept as an array (rather than a single object) so
// GlowFloorPanels.jsx/systems/glowFloorPanel.js need no special-casing for
// any number of panels.
export const GLOW_FLOOR_PANEL_POSITIONS = [
  [-10.69305419921875, 6, 136.17398071289062], // WinPad.002 — Stage 2
  [-10.69305419921875, 6, 250.5469512939453], // WinPad.003 — Stage 3
  [-10.69305419921875, 20, 382.8660888671875], // WinPad.004 — Stage 4
  [-10.69305419921875, 18, 500.8358459472656], // WinPad.005 — Stage 5
  [-10.69305419921875, 18, 608.1096801757812], // WinPad.006 — Stage 6
]

// Flat Wins granted the moment the player steps onto each panel, index-
// aligned with GLOW_FLOOR_PANEL_POSITIONS. Ramps up per stage.
export const GLOW_FLOOR_PANEL_WINS = [1, 3, 10, 30, 100]

// Horizontal (X/Z) distance from the panel's placement position within which
// the player counts as standing on it.
export const GLOW_FLOOR_PANEL_RANGE = 3.5
