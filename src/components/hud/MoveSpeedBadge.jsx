import { useRef, useState } from 'react'
import { useGameStore, selectMoveSpeedCap } from '../../store/useGameStore.js'
import { useTouchMode } from './hooks.js'
import { playButtonClick } from '../../systems/sfx.js'

// Right-edge, vertically centred readout of the player's current physical
// walk speed — store's moveSpeed (WALK_SPEED_BASE + equipped skate's own
// speed, data/progression.js + data/hexPowerPad.js), not the Speed
// stat/level LevelBar.jsx shows. A plain reactive selector is fine here:
// moveSpeed only changes on equip/reset/hydrate/this badge's own edits, never
// per frame (systems/playerMovement.js copies this same store value onto the
// player singleton every frame, but the store value itself is static between
// those writes).
//
// "Customize Speed"/"Max" labels always frame the value so the control
// reads clearly even before it's clicked. Clicking the value turns it into a
// number input — typing a value and pressing Enter (or blurring) calls the
// store's setMoveSpeed, which clamps the typed value to [0, the player's own
// naturally-earned ceiling] itself, so this component never needs to know
// that ceiling to stay honest (it only displays it, via selectMoveSpeedCap).
export default function MoveSpeedBadge() {
  const moveSpeed = useGameStore((s) => s.moveSpeed)
  const setMoveSpeed = useGameStore((s) => s.setMoveSpeed)
  const maxMoveSpeed = useGameStore(selectMoveSpeedCap)
  const isTouch = useTouchMode()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  function beginEdit() {
    playButtonClick()
    setDraft(String(Math.round(moveSpeed * 10) / 10))
    setEditing(true)
  }

  function commit() {
    const value = Number(draft)
    if (Number.isFinite(value)) setMoveSpeed(value)
    setEditing(false)
  }

  return (
    <div
      data-hud="right-center"
      className={`pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-lg border border-slate-400/30 bg-black/50 text-slate-100 shadow-lg ${
        isTouch ? 'px-2 py-1.5' : 'px-3 py-2'
      }`}
    >
      <span className={isTouch ? 'text-base' : 'text-xl'}>⚡</span>
      <div className="flex flex-col items-end gap-0.5">
        <span className="whitespace-nowrap text-[10px] font-semibold leading-none text-slate-300/80">
          Customize Speed
        </span>
        {editing ? (
          <input
            ref={(el) => {
              inputRef.current = el
              el?.focus()
              el?.select()
            }}
            type="number"
            inputMode="decimal"
            min={0}
            max={maxMoveSpeed}
            className="pointer-events-auto w-16 rounded border border-sky-300/50 bg-black/70 font-bold tabular-nums text-sky-300 outline-none"
            style={{ fontSize: isTouch ? '0.85rem' : '1.125rem', lineHeight: 1 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setEditing(false)
              }
            }}
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            title="Click to set a custom move speed"
            onClick={beginEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                beginEdit()
              }
            }}
            className="pointer-events-auto cursor-pointer font-bold tabular-nums"
            style={{
              fontSize: isTouch ? '0.85rem' : '1.125rem',
              lineHeight: 1,
              color: '#7dd3fc',
              letterSpacing: '-0.02em',
              WebkitTextStroke: isTouch ? '1.5px #000000' : '2px #000000',
              paintOrder: 'stroke fill',
            }}
          >
            {moveSpeed.toFixed(1)} m/s
          </span>
        )}
        <span className="whitespace-nowrap text-[10px] leading-none text-slate-300/80">
          Max {maxMoveSpeed.toFixed(1)} m/s
        </span>
      </div>
    </div>
  )
}
