import { useEffect, useState } from 'react'
import { teleportGateState, teleportToStage } from '../../systems/teleportGate.js'
import { STAGES } from '../../data/stages.js'
import { useGameStore } from '../../store/useGameStore.js'
import { playButtonClick } from '../../systems/sfx.js'

const textOutline = { WebkitTextStroke: '1.5px black', paintOrder: 'stroke fill' }

// Duplicated from Hud.jsx rather than imported — Hud.jsx already imports
// this file (renders <TeleportPanel/>), so importing back from it would be
// a circular module dependency for the sake of one 5-line pure function.
// 1000 -> "1K", 1500 -> "1.5K", 2_000_000 -> "2M". Trims a trailing ".0".
function formatCompact(n) {
  const abs = Math.abs(n)
  if (abs < 1000) return String(n)
  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ]
  const { value, suffix } = units.find((u) => abs >= u.value)
  const scaled = n / value
  const text = scaled.toFixed(1).replace(/\.0$/, '')
  return `${text}${suffix}`
}

// One row of the stage list: label on the left, a "Pay with Wins" button on
// the right — mirrors Hud.jsx's AuraEntry row (name column + one action
// button column), minus the icon square since STAGES carries no art.
// Unlike AuraEntry's buy-once-then-equip flow, there's no owned state here:
// every click re-checks affordability and charges winsCost again.
//
// stage.rebirthRequired (data/stages.js) additionally gates stages past 5 —
// unmet, the row shows "Requires Rebirth N" instead of the wins button
// (same swapped-caption treatment as SkateRackLabel's owned/equipped
// states) and the row can't be clicked regardless of wins on hand.
function StageRow({ stage, wins, rebirth, spendWins }) {
  const rebirthMet = rebirth >= stage.rebirthRequired
  const canAfford = wins >= stage.winsCost
  return (
    <div className="flex w-full shrink-0 items-center gap-3 rounded-lg border-2 border-black bg-slate-800/80 p-3">
      <span className="min-w-0 flex-1 truncate text-xl font-black text-white" style={textOutline}>
        {stage.label}
      </span>
      {rebirthMet ? (
        <button
          type="button"
          onClick={() => {
            playButtonClick()
            if (spendWins(stage.winsCost)) teleportToStage(stage)
          }}
          disabled={!canAfford}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-gradient-to-b from-sky-400 to-blue-600 px-3 py-1.5 text-base font-black text-white transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
          style={textOutline}
        >
          <span>Pay with Wins</span>
          <span>🏆</span>
          <span>{formatCompact(stage.winsCost)}</span>
        </button>
      ) : (
        <span
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-slate-700 px-3 py-1.5 text-base font-black text-amber-300 opacity-90"
          style={textOutline}
        >
          <span>Requires Rebirth {stage.rebirthRequired}</span>
        </span>
      )}
    </div>
  )
}

// Stage picker — shown for as long as the player stays within
// TELEPORT_GATE_RANGE of TeleportGate.jsx's portal, no "Press E" hold
// needed (see systems/teleportGate.js). Polled at the same ~10Hz other HUD
// proximity flags use in this file's siblings, since teleportGateState is a
// plain mutated singleton, not a store slice worth subscribing to.
export default function TeleportPanel() {
  const [near, setNear] = useState(false)
  const wins = useGameStore((s) => s.wins)
  const rebirth = useGameStore((s) => s.rebirth)
  const spendWins = useGameStore((s) => s.spendWins)

  useEffect(() => {
    const id = setInterval(() => setNear(teleportGateState.near), 100)
    return () => clearInterval(id)
  }, [])

  if (!near) return null

  return (
    // Same floating-title-over-panel chrome as Hud.jsx's HudModal (Rebirth/
    // Aura/Shop), minus the dark full-screen backdrop and close button —
    // this panel stays non-blocking since it opens/closes on proximity
    // alone, not a click. Body is a scrollable vertical list (AuraWindow's
    // pattern) rather than a button row/grid, so all 13 STAGES entries stay
    // reachable regardless of viewport height.
    <div className="pointer-events-auto absolute left-1/2 top-[42%] w-[min(520px,78vw)] -translate-x-1/2 -translate-y-1/2">
      <span
        className="pointer-events-none absolute -top-5 left-6 z-10 text-4xl font-black text-white"
        style={textOutline}
      >
        Select Stage
      </span>
      <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-lg border-2 border-black bg-slate-900/60 shadow-2xl backdrop-blur-sm">
        <div className="h-6 shrink-0 border-b-2 border-black bg-slate-900/60" />
        <div className="flex flex-col items-center gap-3 p-4 text-slate-100">
          <div className="w-full overflow-y-auto max-h-[26rem] pr-2">
            <div className="flex flex-col gap-2.5">
              {STAGES.map((stage) => (
                <StageRow key={stage.id} stage={stage} wins={wins} rebirth={rebirth} spendWins={spendWins} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
