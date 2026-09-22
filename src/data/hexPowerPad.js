// Hex speed pad tiers. This project has no in-world pads yet
// (HEX_SPEED_PAD_POSITIONS is empty), so systems/hexPowerPad.js's proximity
// scan never finds one and the buy/equip prompt never shows — the store's
// ownedHexPads/equippedHexPad state and buyHexPad/equipHexPad actions stay
// wired for when pads are placed in the world.
export const HEX_SPEED_PAD_POSITIONS = []

// Metres from a pad's placement position within which the buy/equip prompt
// appears and E is allowed to act on it.
export const HEX_SPEED_PAD_RANGE = 2.5

// Tier unlocked by each pad. `speedPerGain` becomes the player's
// speedPerGain on equip (store/useGameStore.js equipHexPad);
// `winsRequired` gates buyHexPad.
export const HEX_SPEED_PAD_TIERS = [
  { speedPerGain: 1, winsRequired: 0, beamColor: '#4fd6ff' },
  { speedPerGain: 2, winsRequired: 1, beamColor: '#38bdf8' },
  { speedPerGain: 5, winsRequired: 5, beamColor: '#22d3ee' },
  { speedPerGain: 10, winsRequired: 25, beamColor: '#34d399' },
  { speedPerGain: 25, winsRequired: 100, beamColor: '#a3e635' },
  { speedPerGain: 50, winsRequired: 250, beamColor: '#facc15' },
  { speedPerGain: 100, winsRequired: 750, beamColor: '#fb923c' },
  { speedPerGain: 150, winsRequired: 2500, beamColor: '#f97316' },
  { speedPerGain: 250, winsRequired: 7500, beamColor: '#f43f5e' },
  { speedPerGain: 400, winsRequired: 25000, beamColor: '#ec4899' },
  { speedPerGain: 700, winsRequired: 50000, beamColor: '#d946ef' },
  { speedPerGain: 1000, winsRequired: 100000, beamColor: '#a855f7' },
  { speedPerGain: 1500, winsRequired: 250000, beamColor: '#8b5cf6' },
  { speedPerGain: 2500, winsRequired: 750000, beamColor: '#6366f1' },
  { speedPerGain: 3500, winsRequired: 2500000, beamColor: '#ff2b2b' },
]
