// Shop tile list shown in the HUD's Shop popup (components/hud/Hud.jsx
// ShopWindow) — one card per SKU, priced in Bux (systems/bloxity.js's
// premium balance) with a "Buy with Wins" alternate price.
//
// Buying with Bux is not wired: SDK.bux.requestPurchase needs a
// server-to-server webhook this project doesn't have, so ShopWindow's Bux
// button stays visual-only (BUX_BUY_ENABLED in Hud.jsx).
export const SHOP_ITEMS = [
  { id: 'x2_wins', name: 'x2 Wins', priceBux: 79, winsRequired: 79000, iconUrl: '/ui/xp_cup.png', featured: true },
  { id: 'vip_laser', name: 'VIP LASER', priceBux: 67, winsRequired: 67000, iconUrl: null, featured: false },
  { id: 'golden_target', name: 'GOLDEN TARGET', priceBux: 299, winsRequired: 299000, iconUrl: null, featured: false },
]
