import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/useGameStore.js'
import { levelProgress, canAcceptRebirth } from '../../data/progression.js'
import { formatShort } from '../../data/format.js'
import { player } from '../../systems/playerState.js'
import { isInPvpZone } from '../../data/pvpZone.js'
import { healthFraction } from '../../systems/playerHealth.js'
import { HUD_HEALTH_BAR } from '../../data/playerHealth.js'
import {
  LEVEL_BAR_POLL_MS,
  LEVEL_BAR_WIDTH,
  LEVEL_BAR_HEIGHT,
  LEVEL_BAR_MAX_VW,
  LEVEL_BAR_BORDER,
  LEVEL_BAR_TEXT_STROKE,
  LEVEL_BAR_CAPTION_FONT_PX,
  LEVEL_BAR_LABEL_FONT_PX,
  LEVEL_BAR_BOTTOM,
  LEVEL_BAR_TRANSITION_MS,
  LEVEL_BAR_FILL_GRADIENT,
  LEVEL_BAR_CAPTION_BAND,
  LEVEL_BAR_CAPTION_BAND_PAD_X,
  LEVEL_BAR_CAPTION_BAND_PAD_Y,
  LEVEL_BAR_REBIRTH_TEXT_COLOR,
} from '../../data/levelBar.js'

// Solid cartoon outline for the overlaid text — an 8-direction black shadow
// at LEVEL_BAR_TEXT_STROKE plus a soft drop.
const S = LEVEL_BAR_TEXT_STROKE
const TEXT_OUTLINE =
  `-${S}px -${S}px 0 #000, ${S}px -${S}px 0 #000, -${S}px ${S}px 0 #000, ${S}px ${S}px 0 #000,` +
  `0 -${S}px 0 #000, 0 ${S}px 0 #000, -${S}px 0 0 #000, ${S}px 0 0 #000,` +
  `0 4px 8px rgba(0,0,0,0.45)`

const LABEL_FONT = `800 ${LEVEL_BAR_LABEL_FONT_PX}px/1 ui-rounded, 'Nunito', system-ui, -apple-system, sans-serif`

// Bottom-centre level bar. A DOM sibling of the canvas, never drei <Html>.
// It must not re-render per frame: the structure below is built once, and
// every readout is written to the DOM from a throttled useGameStore.subscribe
// outside React.
export default function LevelBar() {
  const rebirthRef = useRef(null)
  const rebirthCountRef = useRef(null)
  const captionRef = useRef(null)
  const levelRef = useRef(null)
  const countRef = useRef(null)
  const fillRef = useRef(null)
  const hpWrapRef = useRef(null)
  const hpFillRef = useRef(null)

  useEffect(() => {
    let last = 0
    let trailing = 0

    const paint = () => {
      last = performance.now()
      const { speed, rebirth } = useGameStore.getState()
      const { level, frac, total, needed } = levelProgress(speed)
      if (rebirthRef.current)
        rebirthRef.current.style.display = canAcceptRebirth(level, rebirth) ? 'inline-block' : 'none'
      if (rebirthCountRef.current) rebirthCountRef.current.textContent = `Rebirth (X${rebirth})`
      if (captionRef.current) captionRef.current.textContent = `${formatShort(speed)} Speed`
      if (levelRef.current) levelRef.current.textContent = `Level ${level}`
      if (countRef.current) countRef.current.textContent = `${formatShort(total)} / ${formatShort(needed)}`
      if (fillRef.current) fillRef.current.style.width = `${(frac * 100).toFixed(2)}%`
      if (hpWrapRef.current)
        hpWrapRef.current.style.display = isInPvpZone(player.position.x, player.position.z)
          ? 'block'
          : 'none'
      if (hpFillRef.current) hpFillRef.current.style.width = `${(healthFraction() * 100).toFixed(1)}%`
    }

    const schedule = () => {
      const wait = LEVEL_BAR_POLL_MS - (performance.now() - last)
      if (wait <= 0) {
        if (trailing) {
          clearTimeout(trailing)
          trailing = 0
        }
        paint()
      } else if (!trailing) {
        trailing = setTimeout(() => {
          trailing = 0
          paint()
        }, wait)
      }
    }

    paint()
    const unsub = useGameStore.subscribe(schedule)
    const poll = setInterval(paint, LEVEL_BAR_POLL_MS)
    return () => {
      if (trailing) clearTimeout(trailing)
      clearInterval(poll)
      unsub()
    }
  }, [])

  return (
    <div
      data-hud="level-bar"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{ bottom: LEVEL_BAR_BOTTOM, width: LEVEL_BAR_WIDTH, maxWidth: `${LEVEL_BAR_MAX_VW}vw` }}
    >
      <div style={{ textAlign: 'center', marginBottom: 4, position: 'relative', left: 350, top: 50 }}>
        <span
          ref={rebirthCountRef}
          style={{
            display: 'inline-block',
            padding: `${LEVEL_BAR_CAPTION_BAND_PAD_Y}px ${LEVEL_BAR_CAPTION_BAND_PAD_X}px`,
            font: `800 ${LEVEL_BAR_CAPTION_FONT_PX * 0.6}px/1 ui-rounded, 'Nunito', system-ui, sans-serif`,
            letterSpacing: 0.5,
            color: LEVEL_BAR_REBIRTH_TEXT_COLOR,
            textShadow: TEXT_OUTLINE,
          }}
        >
          Rebirth (X0)
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span
          ref={rebirthRef}
          style={{
            display: 'none',
            padding: `${LEVEL_BAR_CAPTION_BAND_PAD_Y}px ${LEVEL_BAR_CAPTION_BAND_PAD_X}px`,
            font: `800 ${LEVEL_BAR_CAPTION_FONT_PX}px/1 ui-rounded, 'Nunito', system-ui, sans-serif`,
            letterSpacing: 0.5,
            color: '#ffd21e',
            textShadow: TEXT_OUTLINE,
            background: LEVEL_BAR_CAPTION_BAND,
          }}
        >
          Rebirth Available
        </span>
      </div>

      <div
        ref={hpWrapRef}
        style={{ display: 'none', margin: `0 auto ${LEVEL_BAR_CAPTION_BAND_PAD_Y}px`, width: HUD_HEALTH_BAR.WIDTH }}
      >
        <div
          style={{
            position: 'relative',
            height: HUD_HEALTH_BAR.HEIGHT,
            background: HUD_HEALTH_BAR.BG_COLOR,
            border: `${HUD_HEALTH_BAR.BORDER}px solid #000`,
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            ref={hpFillRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              background: HUD_HEALTH_BAR.FILL_COLOR,
              transition: 'width 150ms ease-out',
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span
          ref={captionRef}
          style={{
            display: 'inline-block',
            padding: `${LEVEL_BAR_CAPTION_BAND_PAD_Y}px ${LEVEL_BAR_CAPTION_BAND_PAD_X}px`,
            font: `800 ${LEVEL_BAR_CAPTION_FONT_PX}px/1 ui-rounded, 'Nunito', system-ui, sans-serif`,
            letterSpacing: 0.5,
            color: '#fff',
            textShadow: TEXT_OUTLINE,
            background: LEVEL_BAR_CAPTION_BAND,
          }}
        >
          1 Speed
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            height: LEVEL_BAR_HEIGHT,
            background: '#f4f4f4',
            border: `${LEVEL_BAR_BORDER}px solid #000`,
            borderRadius: 9999,
            overflow: 'hidden',
            boxShadow: '0 5px 0 rgba(0,0,0,0.28), inset 0 3px 5px rgba(0,0,0,0.12)',
          }}
        >
          <div
            ref={fillRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '0%',
              background: LEVEL_BAR_FILL_GRADIENT,
              transition: `width ${LEVEL_BAR_TRANSITION_MS}ms ease-out`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
            }}
          >
            <span ref={levelRef} style={{ font: LABEL_FONT, color: '#fff', textShadow: TEXT_OUTLINE }}>
              Level 1
            </span>
            <span ref={countRef} style={{ font: LABEL_FONT, color: '#fff', textShadow: TEXT_OUTLINE }}>
              1 / 50
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
