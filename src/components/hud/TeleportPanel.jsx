import { useEffect, useState } from 'react'
import { teleportGateState, teleportToStage } from '../../systems/teleportGate.js'
import { STAGES } from '../../data/stages.js'
import { playButtonClick } from '../../systems/sfx.js'

const textOutline = { WebkitTextStroke: '1.5px black', paintOrder: 'stroke fill' }

// Stage picker — shown for as long as the player stays within
// TELEPORT_GATE_RANGE of TeleportGate.jsx's portal, no "Press E" hold
// needed (see systems/teleportGate.js). Polled at the same ~10Hz other HUD
// proximity flags use in this file's siblings, since teleportGateState is a
// plain mutated singleton, not a store slice worth subscribing to.
export default function TeleportPanel() {
  const [near, setNear] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNear(teleportGateState.near), 100)
    return () => clearInterval(id)
  }, [])

  if (!near) return null

  return (
    <div className="pointer-events-auto absolute left-1/2 top-[38%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-2xl border-2 border-black bg-black/70 px-5 py-4 shadow-2xl backdrop-blur-sm">
      <span className="text-lg font-black text-white" style={textOutline}>
        Select Stage
      </span>
      <div className="flex gap-2">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => {
              playButtonClick()
              teleportToStage(stage)
            }}
            className="rounded-lg border-2 border-black bg-gradient-to-b from-sky-400 to-blue-600 px-4 py-2 font-black text-white shadow-[0_3px_0_rgba(0,0,0,0.4)] transition hover:brightness-110 active:brightness-95"
            style={textOutline}
          >
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  )
}
