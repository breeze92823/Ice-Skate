// Hex speed pad tiers — backing data for the SkateRack's buy/equip economy.
// Positions/tiers are derived 1:1 from data/skateRack.js's SKATE_RACK_TIERS
// (same index into both arrays and into ownedHexPads/equippedHexPad) so the
// rack's displayed progression and its real buy/equip state can never drift
// apart into two copies of the same numbers.
import { SKATE_RACK_TIERS, skateRackPadWorldPosition } from './skateRack.js'

// Metres from a pad's placement position within which the buy/equip prompt
// appears and E is allowed to act on it.
export const HEX_SPEED_PAD_RANGE = 2.5

export const HEX_SPEED_PAD_POSITIONS = SKATE_RACK_TIERS.map((tier) => skateRackPadWorldPosition(tier.row, tier.col))

// Tier unlocked by each pad. `speedPerGain` becomes the player's
// speedPerGain on equip (store/useGameStore.js equipHexPad); `moveSpeed`
// becomes the player's physical walk speed on equip (same action), replacing
// it outright rather than adding to a base — both read straight off the
// pad's own "+N Speed" label (tier.speed), so the number displayed on the
// rack is exactly what equipping it grants in both places; `winsRequired`
// gates buyHexPad. WALK_SPEED_BASE (VITE_WALK_SPEED_BASE,
// data/progression.js) is layered on top of this moveSpeed as a flat bonus
// wherever the store assigns moveSpeed — not baked in here, so this stays
// the exact "+N Speed" number shown on the rack.
export const HEX_SPEED_PAD_TIERS = SKATE_RACK_TIERS.map((tier) => ({
  speedPerGain: tier.speed,
  moveSpeed: tier.speed,
  winsRequired: tier.winsRequired,
  beamColor: tier.itemColor,
}))
