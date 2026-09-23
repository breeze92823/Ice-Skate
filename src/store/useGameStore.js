import { create } from 'zustand'
import {
  SPEED_INITIAL,
  SPEED_MIN,
  SPEED_MAX,
  LEVEL_INITIAL,
  REBIRTH_INITIAL,
  REBIRTH_MIN,
  REBIRTH_MAX,
  WINS_INITIAL,
  WINS_MIN,
  WINS_MAX,
  TIME_PLAYED_INITIAL,
  TIME_PLAYED_MIN,
  TIME_PLAYED_MAX,
  SPEED_PER_GAIN_INITIAL,
  WALK_SPEED_BASE,
  MOVE_SPEED_MIN,
  MOVE_SPEED_MAX,
  MOVE_SPEED_PER_LEVEL,
  levelForSpeed,
  canAcceptRebirth,
  clamp,
} from '../data/progression.js'
import { HEX_SPEED_PAD_TIERS } from '../data/hexPowerPad.js'
import { AURA_TIERS, auraStrengthMultiplier } from '../data/aura.js'
import { SHOP_ITEMS } from '../data/shop.js'
import { AFK_TARGET_CONFIG } from '../data/afk.js'

// THE store — durable state + derive() + all actions. No middleware (no
// persist, no immer, no subscribeWithSelector).

// Recomputes every field that is a pure function of another durable field.
// Called at the end of any action that changes speed, so level never has to
// be restated by hand at more than one call site.
function derive(state) {
  return { ...state, level: levelForSpeed(state.speed) }
}

export const useGameStore = create((set, get) => ({
  speed: SPEED_INITIAL,
  level: LEVEL_INITIAL,
  rebirth: REBIRTH_INITIAL,
  wins: WINS_INITIAL,
  // Total wall-clock seconds this account has spent in the game
  // (systems/playTime.js, stepped once per frame from GameLoop) — shown on
  // LeaderboardSign3 (data/leaderboard.js's "Most Time" board). Persisted
  // for a signed-in player like every other account-scoped field below;
  // tracked locally for a guest too but never saved anywhere durable.
  timePlayed: TIME_PLAYED_INITIAL,
  speedPerGain: SPEED_PER_GAIN_INITIAL,
  // Tier 0 has winsRequired: 0 and speedPerGain 1 — the free starter tier,
  // owned and equipped from the start.
  ownedHexPads: new Set([0]),
  equippedHexPad: 0,
  // Physical walk speed (m/s), read as-is by systems/playerMovement.js.
  // Seeded from tier 0 (WALK_SPEED_BASE + its own moveSpeed) and recomputed
  // the same way on equip/reset — but, like speed/wins, it's also a raw
  // persisted field: hydrate() below trusts a saved moveSpeed directly
  // (clamped) instead of only re-deriving it from equippedHexPad.
  moveSpeed: WALK_SPEED_BASE + HEX_SPEED_PAD_TIERS[0].moveSpeed,
  // Permanent, per-level moveSpeed bonus (MOVE_SPEED_PER_LEVEL per level
  // gained in gainSpeed) — kept separate from moveSpeed itself so equipHexPad
  // can re-add it on top of a newly-equipped tier's base instead of losing it.
  // Cleared back to 0 by acceptRebirth/resetProgress.
  moveSpeedLevelBonus: 0,
  ownedAuras: new Set(),
  equippedAura: null,
  ownedTargets: new Set(),

  // One walking Speed-gain tick's worth of Speed (systems/speedGain.js —
  // every WALK_GAIN_INTERVAL seconds of continuous walking). `multiplier` is
  // the AFK target's "xN" tier while AFK-locked, else 1 — speedPerGain *
  // (rebirth + 1) * multiplier * aura strength, floored to a whole number.
  // Returns the Speed actually added after the SPEED_MAX clamp.
  gainSpeed(multiplier = 1) {
    let applied = 0
    set((state) => {
      const mult = multiplier > 0 ? multiplier : 1
      const auraMult = auraStrengthMultiplier(state.equippedAura)
      const gain = Math.floor(state.speedPerGain * (state.rebirth + 1) * mult * auraMult)
      const speed = clamp(state.speed + gain, SPEED_MIN, SPEED_MAX)
      applied = speed - state.speed
      const next = derive({ ...state, speed })
      const levelsGained = next.level - state.level
      if (levelsGained <= 0) return next
      const bonus = levelsGained * MOVE_SPEED_PER_LEVEL
      return {
        ...next,
        moveSpeedLevelBonus: clamp(state.moveSpeedLevelBonus + bonus, 0, MOVE_SPEED_MAX),
        moveSpeed: clamp(state.moveSpeed + bonus, MOVE_SPEED_MIN, MOVE_SPEED_MAX),
      }
    })
    return applied
  },

  // Called every frame from systems/playTime.js with the frame's dt. Not
  // gated on movement/activity like gainSpeed — any unpaused frame counts,
  // matching what a player would actually call "time played" (systems/
  // timeScale.js's tick() already returns 0 while paused/backgrounded, so
  // this never over-counts).
  addPlayTime(dt) {
    if (!(dt > 0)) return
    set((s) => ({ timePlayed: clamp(s.timePlayed + dt, TIME_PLAYED_MIN, TIME_PLAYED_MAX) }))
  },

  // Manual, gated by canAcceptRebirth. Re-checks eligibility itself so a
  // duplicate/stale caller can never double-apply a rebirth.
  acceptRebirth() {
    const state = get()
    if (!canAcceptRebirth(state.level, state.rebirth)) return
    set((s) => {
      const tier = HEX_SPEED_PAD_TIERS[s.equippedHexPad]
      const moveSpeed = tier ? WALK_SPEED_BASE + tier.moveSpeed : s.moveSpeed
      return derive({
        ...s,
        rebirth: clamp(s.rebirth + 1, REBIRTH_MIN, REBIRTH_MAX),
        speed: SPEED_INITIAL,
        moveSpeedLevelBonus: 0,
        moveSpeed,
      })
    })
  },

  // Called the frame the player first steps onto a win panel — not wired to
  // anything in this project yet, but kept as the one place Wins ever grow.
  awardWins(amount) {
    if (!(amount > 0)) return
    set((s) => ({ wins: s.wins + amount }))
  },

  // Re-checks ownership and affordability itself so a duplicate/stale caller
  // (or a wins value that has since dropped) can never double-charge,
  // double-apply, or drive wins negative.
  buyHexPad(index) {
    const state = get()
    if (state.ownedHexPads.has(index)) return
    const tier = HEX_SPEED_PAD_TIERS[index]
    if (!tier || state.wins < tier.winsRequired) return
    set((s) => ({ wins: s.wins - tier.winsRequired, ownedHexPads: new Set(s.ownedHexPads).add(index) }))
  },

  equipHexPad(index) {
    const state = get()
    if (!state.ownedHexPads.has(index)) return
    const tier = HEX_SPEED_PAD_TIERS[index]
    if (!tier) return
    set((s) => ({
      equippedHexPad: index,
      speedPerGain: tier.speedPerGain,
      moveSpeed: clamp(WALK_SPEED_BASE + tier.moveSpeed + s.moveSpeedLevelBonus, MOVE_SPEED_MIN, MOVE_SPEED_MAX),
    }))
  },

  // Called from components/hud/Hud.jsx's AuraEntry wins button. Buying
  // doesn't equip it — the tier just becomes available to equip via
  // equipAuraTier below.
  buyAuraTier(index) {
    const state = get()
    if (state.ownedAuras.has(index)) return
    const tier = AURA_TIERS[index]
    if (!tier || state.wins < tier.winsRequired) return
    set((s) => ({ wins: s.wins - tier.winsRequired, ownedAuras: new Set(s.ownedAuras).add(index) }))
  },

  // Only one aura can be equipped at a time — setting equippedAura to a new
  // index is itself what un-equips whichever tier held it before.
  equipAuraTier(index) {
    const state = get()
    if (!state.ownedAuras.has(index)) return
    set({ equippedAura: index })
  },

  // Clears equippedAura back to null (1x, no aura) — only if the given
  // index is the one currently equipped.
  unequipAuraTier(index) {
    const state = get()
    if (state.equippedAura !== index) return
    set({ equippedAura: null })
  },

  // Called from components/hud/Hud.jsx's TargetPurchaseWindow Buy button —
  // the one-time Wins unlock for an AFK_TARGET_CONFIG entry that carries a
  // winsRequired. Not reachable today (data/afk.js's AFK_TARGET_CONFIG is
  // empty), kept for parity.
  buyTarget(id) {
    const state = get()
    if (state.ownedTargets.has(id)) return
    const cfg = AFK_TARGET_CONFIG[id]
    if (!cfg?.winsRequired || state.wins < cfg.winsRequired) return
    set((s) => ({ wins: s.wins - cfg.winsRequired, ownedTargets: new Set(s.ownedTargets).add(id) }))
  },

  // Called from components/hud/Hud.jsx's ShopItemCard "Buy with Wins"
  // button — the wins-priced alternative to the SKU's (unwired) Bux price.
  buyShopItemWithWins(id) {
    const state = get()
    const item = SHOP_ITEMS.find((i) => i.id === id)
    if (!item || state.wins < item.winsRequired) return
    set((s) => ({ wins: s.wins - item.winsRequired }))
  },

  // Puts every account-scoped field back to the exact defaults a brand-new
  // guest starts with. Called when a signed-in player logs back out to a
  // guest session, once real save/load lands.
  resetProgress() {
    set((s) =>
      derive({
        ...s,
        speed: SPEED_INITIAL,
        rebirth: REBIRTH_INITIAL,
        wins: WINS_INITIAL,
        timePlayed: TIME_PLAYED_INITIAL,
        speedPerGain: SPEED_PER_GAIN_INITIAL,
        ownedHexPads: new Set([0]),
        equippedHexPad: 0,
        moveSpeed: WALK_SPEED_BASE + HEX_SPEED_PAD_TIERS[0].moveSpeed,
        moveSpeedLevelBonus: 0,
        ownedAuras: new Set(),
        equippedAura: null,
        ownedTargets: new Set(),
      }),
    )
  },

  // Loads a previously-saved snapshot, once real persistence exists.
  // Numbers are re-clamped exactly like every other write path rather than
  // trusted as-is.
  hydrate(saved) {
    if (!saved || typeof saved !== 'object') return
    set((s) => {
      const speed = clamp(Number(saved.speed) || 0, SPEED_MIN, SPEED_MAX)
      const rebirth = clamp(Number(saved.rebirth) || 0, REBIRTH_MIN, REBIRTH_MAX)
      const wins = clamp(Number(saved.wins) || 0, WINS_MIN, WINS_MAX)
      const timePlayed = clamp(Number(saved.timePlayed) || 0, TIME_PLAYED_MIN, TIME_PLAYED_MAX)
      const ownedHexPads = new Set(
        Array.isArray(saved.ownedHexPads) && saved.ownedHexPads.length ? saved.ownedHexPads : [0],
      )
      const equippedHexPad = ownedHexPads.has(saved.equippedHexPad) ? saved.equippedHexPad : 0
      const ownedAuras = new Set(Array.isArray(saved.ownedAuras) ? saved.ownedAuras : [])
      const equippedAura = ownedAuras.has(saved.equippedAura) ? saved.equippedAura : null
      const ownedTargets = new Set(Array.isArray(saved.ownedTargets) ? saved.ownedTargets : [])
      const tier = HEX_SPEED_PAD_TIERS[equippedHexPad]
      const moveSpeedLevelBonus = clamp(Number(saved.moveSpeedLevelBonus) || 0, 0, MOVE_SPEED_MAX)
      const fallbackMoveSpeed = tier ? WALK_SPEED_BASE + tier.moveSpeed + moveSpeedLevelBonus : s.moveSpeed
      const moveSpeed = clamp(Number(saved.moveSpeed) || fallbackMoveSpeed, MOVE_SPEED_MIN, MOVE_SPEED_MAX)
      return derive({
        ...s,
        speed,
        rebirth,
        wins,
        timePlayed,
        ownedHexPads,
        equippedHexPad,
        speedPerGain: tier ? tier.speedPerGain : s.speedPerGain,
        moveSpeedLevelBonus,
        moveSpeed,
        ownedAuras,
        equippedAura,
        ownedTargets,
      })
    })
  },
}))
