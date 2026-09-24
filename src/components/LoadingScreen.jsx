import { useEffect, useState } from 'react'
import { BASE_RIG_MAX_ATTEMPTS, requestAvatarRetry, subscribeAvatarStatus } from '../systems/avatarReadiness.js'
import { DEV_MODE } from '../systems/devMode.js'

// Full-screen DOM overlay, a sibling of <Canvas> in App.jsx (never drei
// <Html>) — sits over the canvas until the Bloxity character has actually
// loaded. The canvas still mounts underneath so its own assets warm up
// behind this screen, but the overlay stays fully opaque with no fade until
// avatarReady, so the game is never visible without a loaded character.
//
// systems/avatarModel.js's base-rig loader retries with backoff up to
// BASE_RIG_MAX_ATTEMPTS times, reporting progress through
// systems/avatarReadiness.js. Once it gives up this renders a dedicated
// error window instead of the loading state, with a Retry button that
// kicks off a fresh BASE_RIG_MAX_ATTEMPTS cycle.
const FADE_MS = 450

export default function LoadingScreen() {
  const [status, setStatus] = useState({ ready: false, attempt: 0, failed: false })
  const [hidden, setHidden] = useState(false)

  useEffect(() => subscribeAvatarStatus(setStatus), [])

  // Fades out FADE_MS after the character is ready; reopens immediately (no
  // fade) the moment it isn't — `ready` is live, so this can happen again
  // later (a CDN blip mid-game), not just at boot. DEV_MODE skips the gate
  // entirely: the game starts right away even if the avatar never loads
  // (Player.jsx's capsule fallback covers the visual until/unless it does).
  useEffect(() => {
    if (!status.ready && !DEV_MODE) {
      setHidden(false)
      return
    }
    const id = setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(id)
  }, [status.ready])

  const statusText =
    status.attempt === 0
      ? 'LOADING CHARACTER…'
      : `RECONNECTING CHARACTER… (attempt ${status.attempt}/${BASE_RIG_MAX_ATTEMPTS})`

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0b0d12] transition-opacity ease-out"
      style={{
        zIndex: 200,
        opacity: hidden ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
      aria-hidden={hidden}
    >
      {status.failed ? (
        <div className="w-[min(420px,86vw)]">
          <div className="relative">
            <span
              className="pointer-events-none absolute -top-5 left-6 z-10 text-2xl font-black text-red-400"
              style={{ WebkitTextStroke: '1.5px black', paintOrder: 'stroke fill' }}
            >
              Error
            </span>
            <div className="flex flex-col overflow-hidden rounded-lg border-2 border-black bg-slate-900/95 shadow-2xl">
              <div className="h-6 shrink-0 border-b-2 border-black bg-slate-900/95" />
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="font-mono text-sm leading-6 text-slate-200">
                  Failed to load your character after {BASE_RIG_MAX_ATTEMPTS} attempts.
                  <br />
                  Check your connection and try again.
                </div>
                <button
                  type="button"
                  onClick={requestAvatarRetry}
                  className="rounded-lg border-2 border-black bg-gradient-to-b from-red-500 to-red-700 px-6 py-2 font-black text-white shadow-[0_3px_0_rgba(0,0,0,0.4)] transition hover:brightness-110 active:brightness-95"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 px-8">
          <h1 className="select-none text-2xl font-semibold tracking-[0.35em] text-slate-100 sm:text-3xl">
            ICE SKATE
          </h1>
          <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10 sm:w-80">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#5bc0ff] shadow-[0_0_10px_#5bc0ff]" />
          </div>
          <div className="select-none font-mono text-xs tracking-widest text-slate-400">{statusText}</div>
        </div>
      )}
    </div>
  )
}
