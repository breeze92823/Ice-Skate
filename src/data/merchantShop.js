// This project has no merchant stall in the world yet. MERCHANT_RANGE stays
// real so systems/merchant.js's distance check is exact; the position sits
// far outside any reachable area so `near` never goes true until a stall is
// actually placed.
export const MERCHANT_PROMPT_POSITION = [0, -1000, 0]
export const MERCHANT_RANGE = 5
