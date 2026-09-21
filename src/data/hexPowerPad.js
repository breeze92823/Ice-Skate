// Hex power pad tiers. This project has no in-world pads yet
// (HEX_POWER_PAD_POSITIONS is empty), so systems/hexPowerPad.js's proximity
// scan never finds one and the buy/equip prompt never shows — the store's
// ownedHexPads/equippedHexPad state and buyHexPad/equipHexPad actions stay
// wired for when pads are placed in the world.
export const HEX_POWER_PAD_POSITIONS = []

// Metres from a pad's placement position within which the buy/equip prompt
// appears and E is allowed to act on it.
export const HEX_POWER_PAD_RANGE = 2.5

// Laser tier unlocked by each pad. `powerPerAction` becomes the player's
// powerPerAction on equip (store/useGameStore.js equipHexPad);
// `winsRequired` gates buyHexPad.
export const HEX_POWER_PAD_TIERS = [
  { powerPerAction: 1, winsRequired: 0, beamColor: '#4fd6ff' },
  { powerPerAction: 2, winsRequired: 1, beamColor: '#38bdf8' },
  { powerPerAction: 5, winsRequired: 5, beamColor: '#22d3ee' },
  { powerPerAction: 10, winsRequired: 25, beamColor: '#34d399' },
  { powerPerAction: 25, winsRequired: 100, beamColor: '#a3e635' },
  { powerPerAction: 50, winsRequired: 250, beamColor: '#facc15' },
  { powerPerAction: 100, winsRequired: 750, beamColor: '#fb923c' },
  { powerPerAction: 150, winsRequired: 2500, beamColor: '#f97316' },
  { powerPerAction: 250, winsRequired: 7500, beamColor: '#f43f5e' },
  { powerPerAction: 400, winsRequired: 25000, beamColor: '#ec4899' },
  { powerPerAction: 700, winsRequired: 50000, beamColor: '#d946ef' },
  { powerPerAction: 1000, winsRequired: 100000, beamColor: '#a855f7' },
  { powerPerAction: 1500, winsRequired: 250000, beamColor: '#8b5cf6' },
  { powerPerAction: 2500, winsRequired: 750000, beamColor: '#6366f1' },
  { powerPerAction: 3500, winsRequired: 2500000, beamColor: '#ff2b2b' },
]
