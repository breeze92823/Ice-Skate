import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { install as installInput } from './systems/input.js'
import { resetPlayer } from './systems/playerState.js'
import { syncYawToPlayer as syncCameraYaw } from './systems/cameraOrbit.js'
import { SPAWN } from './data/hub.js'
import { init as initBloxity, teardown as teardownBloxity } from './systems/bloxity.js'
import { init as initNet, teardown as teardownNet } from './systems/net.js'
import { useGameStore } from './store/useGameStore.js'

// Bloxity goes first: it registers the SDK's onUserChanged subscription, so
// the very first render already has the right avatar state. It is a no-op if
// the SDK failed to load.
initBloxity()
resetPlayer(SPAWN)
syncCameraYaw()
installInput()

// Multiplayer presence: a no-op today (systems/net.js has no server to
// connect to), kept wired for when one exists.
initNet()

// Dev-only console access to the progression store, e.g.
// window.__gameStore.setState({ speed: 9999 }) to test the level bar/rebirth
// gate without a gameplay loop feeding Speed yet. Never present in a
// production build.
if (import.meta.env.DEV) window.__gameStore = useGameStore

window.addEventListener('pagehide', teardownBloxity)
window.addEventListener('pagehide', teardownNet)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
