import GlowFloorPanelProp from './GlowFloorPanelProp.jsx'
import GlowFloorPanelLabel from './GlowFloorPanelLabel.jsx'
import { GLOW_FLOOR_PANEL_POSITIONS, GLOW_FLOOR_PANEL_WINS } from '../data/glowFloorPanel.js'

// The glow_floor_panel prop (imported from Laser-Escape), placed dead center
// of the main island (data/glowFloorPanel.js) — one glTF, one instance, plus
// its floating "+Wins" label (GlowFloorPanelLabel.jsx) from the same index's
// GLOW_FLOOR_PANEL_WINS entry. systems/glowFloorPanel.js awards those Wins
// when the player steps onto it. Kept mapped over the positions array (not
// hard-coded to index 0) so a second panel needs no changes here.
export default function GlowFloorPanels() {
  return (
    <>
      {GLOW_FLOOR_PANEL_POSITIONS.map((position, i) => (
        <GlowFloorPanelProp key={i} position={position} />
      ))}
      {GLOW_FLOOR_PANEL_POSITIONS.map((position, i) => (
        <GlowFloorPanelLabel key={i} position={position} wins={GLOW_FLOOR_PANEL_WINS[i]} />
      ))}
    </>
  )
}
