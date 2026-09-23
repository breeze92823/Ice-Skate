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
// Blender/world.blend's WinPad.001-WinPad.012 objects via the
// project-blender-previz-rig memory's axis conversion for x/z:
// three.(x, z) = (blender.x, -blender.y). NOTE: WinPad numbering is NOT
// stage-sequential — Blender's own collection membership is the only
// reliable stage mapping (re-verified directly, not assumed): WinPad.002-006
// → Stage2-6, WinPad.001 → Stage7 (not Stage1 — Stage1 has no panel),
// WinPad.007-012 → Stage8-13. The y here is NOT the raw Blender WinPad z —
// it's that stage's spawn GROUND_BLOCKS entry's top surface
// (position.y + size[1]/2, rounded to the nearest integer), since the panel
// needs to sit on this project's actual ground geometry, not the previz
// pad's own (slightly different) height. Kept as an array (rather than a
// single object) so GlowFloorPanels.jsx/systems/glowFloorPanel.js need no
// special-casing for any number of panels.
export const GLOW_FLOOR_PANEL_POSITIONS = [
  [-10.69305419921875, 6, 136.17398071289062], // WinPad.002 — Stage 2 (Ground.009 top)
  [-10.69305419921875, 6, 250.5469512939453], // WinPad.003 — Stage 3 (Ground.013 top)
  [-10.69305419921875, 20, 382.8660888671875], // WinPad.004 — Stage 4 (Ground.015 top)
  [-10.69305419921875, 18, 500.8358459472656], // WinPad.005 — Stage 5 (Ground.024 top)
  [-10.69305419921875, 18, 608.1096801757812], // WinPad.006 — Stage 6 (Ground.028 top)
  [-10.69305419921875, 18, 774.7890625], // WinPad.001 — Stage 7 (Ground.042 top)
  [-10.69305419921875, 18, 968.4888916015625], // WinPad.007 — Stage 8 (Ground.046 top)
  [-110.88691711425781, 18, 992.4925537109375], // WinPad.008 — Stage 9 (Ground.049 top)
  [-283.3728332519531, 18, 992.4925537109375], // WinPad.009 — Stage 10 (Ground.052 top)
  [-346.25323486328125, 111, 992.4925537109375], // WinPad.010 — Stage 11 (Ground.055 top)
  [-646.6402587890625, 111, 992.4925537109375], // WinPad.011 — Stage 12 (Ground.056 top)
  [-828.3897094726562, 111, 992.4925537109375], // WinPad.012 — Stage 13 (Ground.059 top)
]

// Flat Wins granted the moment the player steps onto each panel, index-
// aligned with GLOW_FLOOR_PANEL_POSITIONS. Ramps up per stage following the
// existing Stage2-6 1-3-10-30-100 decade taper (×3, then ×10/3, repeating)
// continued straight through Stage7-13.
export const GLOW_FLOOR_PANEL_WINS = [1, 3, 10, 30, 100, 300, 1000, 3000, 10000, 30000, 100000, 300000]

// Horizontal (X/Z) distance from the panel's placement position within which
// the player counts as standing on it.
export const GLOW_FLOOR_PANEL_RANGE = 3.5
