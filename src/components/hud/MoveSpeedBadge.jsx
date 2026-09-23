import { useGameStore } from '../../store/useGameStore.js'
import { useTouchMode } from './hooks.js'

// Right-edge, vertically centred readout of the player's current physical
// walk speed — store's moveSpeed (WALK_SPEED_BASE + equipped skate's own
// speed, data/progression.js + data/hexPowerPad.js), not the Speed
// stat/level LevelBar.jsx shows. A plain reactive selector is fine here:
// moveSpeed only changes on equip/reset/hydrate, never per frame
// (systems/playerMovement.js copies this same store value onto the player
// singleton every frame, but the store value itself is static between
// equips).
export default function MoveSpeedBadge() {
  const moveSpeed = useGameStore((s) => s.moveSpeed)
  const isTouch = useTouchMode()

  return (
    <div
      data-hud="right-center"
      className={`pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-lg border border-slate-400/30 bg-black/50 text-slate-100 shadow-lg ${
        isTouch ? 'px-2 py-1.5' : 'px-3 py-2'
      }`}
    >
      <span className={isTouch ? 'text-base' : 'text-xl'}>⚡</span>
      <span
        className="font-bold tabular-nums"
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
    </div>
  )
}
