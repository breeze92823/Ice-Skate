import { useMemo, useRef, useState } from 'react'
import { useGameStore, selectMoveSpeedCap } from '../../store/useGameStore.js'
import { useTouchMode } from './hooks.js'
import { playButtonClick } from '../../systems/sfx.js'
import { makeStudOverlayDataURL } from '../../systems/studTexture.js'

// Tile size (CSS px) for this badge's stud overlay — see
// systems/studTexture.js's makeStudOverlayDataURL. Same convention as the
// Rebirth toolbar button (Hud.jsx's REBIRTH_BUTTON_STUD_PITCH).
const SPEED_BADGE_STUD_PITCH = 12

// Top-to-bottom fill for the speed panel — sky theme, matching the value's
// prior #7dd3fc color.
const SPEED_BADGE_GRADIENT = 'linear-gradient(180deg, #e0f2fe 0%, #7dd3fc 100%)'

// Right-edge, vertically centred readout of the player's current physical
// walk speed — store's moveSpeed (WALK_SPEED_BASE + equipped skate's own
// speed, data/progression.js + data/hexPowerPad.js), not the Speed
// stat/level LevelBar.jsx shows. A plain reactive selector is fine here:
// moveSpeed only changes on equip/reset/hydrate/this badge's own edits, never
// per frame (systems/playerMovement.js copies this same store value onto the
// player singleton every frame, but the store value itself is static between
// those writes).
//
// "Set Speed"/"MAX" labels always frame the value, plaque-style (stud
// overlay + pencil icon, same visual language as Hud.jsx's Rebirth button),
// so the control reads clearly even before it's clicked. Clicking the value
// turns it into a number input — typing a value and pressing Enter (or
// blurring) calls the store's setMoveSpeed, which clamps the typed value to
// [0, the player's own naturally-earned ceiling] itself, so this component
// never needs to know that ceiling to stay honest (it only displays it, via
// selectMoveSpeedCap).
export default function MoveSpeedBadge() {
  const moveSpeed = useGameStore((s) => s.moveSpeed)
  const setMoveSpeed = useGameStore((s) => s.setMoveSpeed)
  const maxMoveSpeed = useGameStore(selectMoveSpeedCap)
  const isTouch = useTouchMode()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const studOverlay = useMemo(() => `url(${makeStudOverlayDataURL(SPEED_BADGE_STUD_PITCH)})`, [])

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
      className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
    >
      <span
        className="whitespace-nowrap font-extrabold"
        style={{
          fontSize: isTouch ? '0.8rem' : '1rem',
          lineHeight: 1,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          WebkitTextStroke: isTouch ? '2px #000000' : '3px #000000',
          paintOrder: 'stroke fill',
        }}
      >
        Set Speed
      </span>
      <div
        className={`relative flex items-center justify-center rounded-2xl border-2 border-black shadow-lg ${
          isTouch ? 'h-12 min-w-[144px] px-3' : 'h-16 min-w-[192px] px-4'
        }`}
        style={{
          backgroundImage: `${studOverlay}, ${SPEED_BADGE_GRADIENT}`,
          backgroundRepeat: 'repeat, no-repeat',
          backgroundSize: `${SPEED_BADGE_STUD_PITCH}px ${SPEED_BADGE_STUD_PITCH}px, 100% 100%`,
        }}
      >
        <span
          className="pointer-events-none absolute select-none"
          style={{
            left: isTouch ? '-20px' : '-24px',
            bottom: isTouch ? '4px' : '20px',
            fontSize: isTouch ? '2.5rem' : '3.5rem',
            transform: 'rotate(-1deg)',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
          }}
        >
          ✏️
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
            className={`pointer-events-auto rounded border border-black/40 bg-white/80 text-center font-extrabold tabular-nums text-slate-900 outline-none ${
              isTouch ? 'w-14' : 'w-20'
            }`}
            style={{ fontSize: isTouch ? '1.25rem' : '1.75rem', lineHeight: 1 }}
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
            className="pointer-events-auto cursor-pointer font-extrabold tabular-nums"
            style={{
              fontSize: isTouch ? '1.25rem' : '1.75rem',
              lineHeight: 1,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              WebkitTextStroke: isTouch ? '2px #000000' : '3px #000000',
              paintOrder: 'stroke fill',
            }}
          >
            {moveSpeed.toFixed(1)}
          </span>
        )}
      </div>
      <span
        className="whitespace-nowrap font-extrabold"
        style={{
          fontSize: isTouch ? '0.7rem' : '0.85rem',
          lineHeight: 1,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          WebkitTextStroke: isTouch ? '1.5px #000000' : '2px #000000',
          paintOrder: 'stroke fill',
        }}
      >
        MAX: {maxMoveSpeed.toFixed(1)}
      </span>
    </div>
  )
}
