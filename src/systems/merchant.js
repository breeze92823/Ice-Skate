// Merchant shop proximity. This project has no merchant stall placed in the
// world (data/merchantShop.js's MERCHANT_PROMPT_POSITION sits far outside
// any reachable area), so `near` stays false and the "Press E to Aura"
// prompt never shows. Kept wired so components/hud/Hud.jsx's Aura popup
// hookup needs no changes the day a stall is placed.
import { player } from './playerState.js'
import { MERCHANT_PROMPT_POSITION, MERCHANT_RANGE } from '../data/merchantShop.js'

export const merchantState = {
  near: false, // within MERCHANT_RANGE of the counter this frame
  openAuraRequested: false, // edge-triggered by a completed hold; consumer clears it after acting
}

export function step() {
  const p = player.position
  const dx = p.x - MERCHANT_PROMPT_POSITION[0]
  const dy = p.y - MERCHANT_PROMPT_POSITION[1]
  const dz = p.z - MERCHANT_PROMPT_POSITION[2]
  merchantState.near = dx * dx + dy * dy + dz * dz <= MERCHANT_RANGE * MERCHANT_RANGE
}
