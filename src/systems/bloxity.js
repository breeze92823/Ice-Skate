// The Bloxity (Legion) SDK facade.
//
// Every SDK call in the codebase goes through this module, which is
// framework-free (systems never import React). Nothing here may throw when
// the SDK is missing — a blocked sdk.bloxity.io must leave the scene fully
// usable on the capsule fallback and the signed-out HUD state.
import { GAME_SLUG, SETTINGS } from '../data/bloxity.js'
import { setAvatar, resetAvatar } from './avatarState.js'
import { setSensitivity } from './cameraOrbit.js'
import { setEscapeHandler, suspend, resume } from './input.js'
import { settings, setSetting, subscribe as subscribeSettings } from './settingsState.js'
import * as session from './session.js'
import * as audio from './audio.js'
import * as sfx from './sfx.js'

export function sdk() {
  return (typeof window !== 'undefined' && window.Legion && window.Legion.SDK) || null
}

export function isAvailable() {
  return !!sdk()
}

// --- Auth state -------------------------------------------------------
// What the UI renders. `user` is only ever written from the onUserChanged
// handler, which re-reads getUser() rather than trusting a cached object.
// `guest` is the Bloxity-generated guest identity ({ username, displayName,
// pfp }) every player has before signing in; null once `user` is set, or
// when the SDK is too old to expose getGuest().
export const authState = {
  ready: false,
  user: null,
  guest: null,
  friends: [],
  balance: null,
  embedded: false,
}

const authListeners = new Set()

export function subscribeAuth(fn) {
  authListeners.add(fn)
  fn(authState)
  return () => authListeners.delete(fn)
}

function emitAuth() {
  for (const fn of authListeners) fn(authState)
}

// Guards the async fan-out against a fast logout/login flip.
let userGeneration = 0
const unsubscribers = []

// --- Settings -----------------------------------------------------------
function applySetting(key) {
  const value = settings[key]
  switch (key) {
    case 'master_volume':
      audio.setMasterVolume(value)
      break
    case 'music_volume':
      audio.setMusicVolume(value)
      break
    case 'camera_sensitivity':
      setSensitivity(value)
      break
    case 'fullscreen':
      requestFullscreen(value)
      break
    default:
      // graphics_quality, show_fps and background_transparency are read
      // through settingsState's subscription by the HUD.
      break
  }
}

function registerSettings(SDK) {
  for (const key of Object.keys(SETTINGS)) {
    const off = SDK.settings.listen(key, (raw) => {
      setSetting(key, raw)
      applySetting(key)
    })
    if (typeof off === 'function') unsubscribers.push(off)
  }
  SDK.settings.triggerAll()
}

// --- Auth fan-out -------------------------------------------------------
async function loadFriends(generation) {
  const SDK = sdk()
  if (!SDK) return
  try {
    const friends = await SDK.social.getFriends()
    if (generation !== userGeneration) return
    authState.friends = Array.isArray(friends) ? friends : []
    emitAuth()
  } catch {
    // Friends are non-essential; the scene plays without them.
  }
}

async function loadBalance(generation) {
  const SDK = sdk()
  if (!SDK) return
  try {
    const balance = await SDK.bux.getBalance()
    if (generation !== userGeneration) return
    authState.balance = typeof balance === 'number' ? balance : null
    emitAuth()
  } catch {
    authState.balance = null
  }
}

function loadAvatar() {
  const SDK = sdk()
  if (!SDK) return
  try {
    setAvatar(SDK.avatar.getEquipped(), SDK.avatar.getProportions())
  } catch (err) {
    console.warn('[bloxity] failed to read avatar state', err)
    resetAvatar()
  }
}

// Bloxity assigns every unsigned player a stable guest identity (generated
// name + pfp). Optional-chained because older SDK builds lack it.
function readGuest() {
  const SDK = sdk()
  if (!SDK || typeof SDK.auth.getGuest !== 'function') return null
  try {
    const g = SDK.auth.getGuest()
    return g && (g.username || g.displayName) ? g : null
  } catch {
    return null
  }
}

// Stable Bloxity user id for a signed-in player. Empty for a guest.
export function getStableUserId() {
  const u = authState.user
  if (!u) return ''
  const id = u._id || u.id || u.userId
  return typeof id === 'string' && id ? id : ''
}

function onUser() {
  const SDK = sdk()
  const user = SDK ? SDK.auth.getUser() : null
  const generation = ++userGeneration

  authState.ready = true
  authState.user = user
  authState.guest = user ? null : readGuest()
  authState.friends = []
  authState.balance = null
  emitAuth()

  if (!user) {
    resetAvatar()
    return
  }
  loadAvatar()
  loadFriends(generation)
  loadBalance(generation)
}

// --- Player events --------------------------------------------------------
let sawPointerLock = false

function onPlayerEvent(event, data) {
  switch (event) {
    case 'pointer_lock_changed':
      if (data) {
        sawPointerLock = true
        resume('pointer-lock')
      } else if (sawPointerLock) {
        suspend('pointer-lock')
      }
      break
    default:
      break
  }
}

// --- Init -----------------------------------------------------------------
let initialised = false

export function init() {
  if (initialised) return
  initialised = true

  audio.install()
  sfx.preload()
  session.install()

  const SDK = sdk()
  if (!SDK) {
    authState.ready = true
    emitAuth()
    return
  }

  try {
    const onLocalhost =
      typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    SDK.init(onLocalhost ? { gameSlug: GAME_SLUG, portalUrl: 'https://bloxity.io' } : { gameSlug: GAME_SLUG })
    authState.embedded = !!SDK.portal.isEmbeddedInLegion()

    SDK.game.loadingStep('Starting Ice Skate')

    registerSettings(SDK)

    unsubscribers.push(SDK.auth.onUserChanged(onUser))
    unsubscribers.push(SDK.avatar.onAvatarChanged(() => loadAvatar()))
    unsubscribers.push(
      SDK.avatar.onProportionsChanged(() => {
        try {
          loadAvatar()
        } catch {
          // Keep the last good proportions.
        }
      }),
    )
    unsubscribers.push(SDK.player.onEvent(onPlayerEvent))

    // Escape hands off to the portal's pause menu.
    setEscapeHandler(() => showMenu())

    // Publish the room so invites resolve.
    unsubscribers.push(
      session.subscribe((event, payload) => {
        if (event === 'room') SDK.game.updateRoom(payload.roomId, payload.partyId)
      }),
    )
    SDK.game.updateRoom(session.session.roomId, session.session.partyId)

    SDK.game.loadingStep('Ready')
  } catch (err) {
    console.warn('[bloxity] init failed; running without the SDK', err)
    authState.ready = true
    emitAuth()
  }
}

let announcedFirstFrame = false

export function notifyFirstFrame() {
  if (announcedFirstFrame) return
  announcedFirstFrame = true
  const SDK = sdk()
  if (!SDK) return
  try {
    SDK.game.loadingEnd()
    SDK.game.gameplayStart()
  } catch {
    // Non-fatal.
  }
}

export function endGameplay() {
  const SDK = sdk()
  if (!SDK) return
  try {
    SDK.game.gameplayEnd()
  } catch {
    // Non-fatal.
  }
}

export function teardown() {
  for (const off of unsubscribers.splice(0)) {
    try {
      off()
    } catch {
      // Ignore: we are tearing down anyway.
    }
  }
  endGameplay()
}

// --- Auth actions ---------------------------------------------------------
export async function login() {
  const SDK = sdk()
  if (!SDK) return null
  suspend('auth')
  try {
    return await SDK.auth.showAuthPopup()
  } catch (err) {
    console.warn('[bloxity] showAuthPopup failed', err)
    return null
  } finally {
    resume('auth')
  }
}

export function logout() {
  const SDK = sdk()
  if (SDK) SDK.auth.logout()
}

// --- Avatar actions -------------------------------------------------------
let customizerPoll = 0

export function toggleCustomizer() {
  const SDK = sdk()
  if (!SDK) return
  SDK.avatar.toggleCustomizer()
  watchCustomizer()
}

function watchCustomizer() {
  const SDK = sdk()
  if (!SDK || customizerPoll) return
  if (!SDK.avatar.isCustomizerOpen()) return
  suspend('customizer')
  customizerPoll = setInterval(() => {
    if (!SDK.avatar.isCustomizerOpen()) {
      clearInterval(customizerPoll)
      customizerPoll = 0
      resume('customizer')
    }
  }, 250)
}

// --- Social ---------------------------------------------------------------
export async function inviteFriend(userId) {
  const SDK = sdk()
  if (!SDK) return false
  try {
    SDK.game.updateRoom(session.session.roomId, session.session.partyId)
    return await SDK.social.inviteFriend(userId)
  } catch {
    return false
  }
}

export function getInviteLink() {
  const SDK = sdk()
  if (!SDK) return ''
  try {
    return SDK.social.getInviteFriendsLink({
      gameSlug: GAME_SLUG,
      roomId: session.session.roomId,
      partyId: session.session.partyId,
    })
  } catch {
    return ''
  }
}

export async function sendFriendRequest(userId) {
  const SDK = sdk()
  if (!SDK) return { success: false, error: 'SDK unavailable' }
  try {
    return await SDK.social.sendFriendRequest(userId)
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function refreshFriends() {
  return loadFriends(userGeneration)
}

// --- Bux --------------------------------------------------------------
export async function refreshBalance() {
  return loadBalance(userGeneration)
}

// --- Portal -----------------------------------------------------------
export function showMenu() {
  const SDK = sdk()
  if (!SDK) return
  try {
    SDK.portal.showMenu(true)
  } catch {
    // Ignore.
  }
}

export function requestFullscreen(on) {
  const SDK = sdk()
  if (!SDK) return
  try {
    if (on) SDK.portal.requestFullscreen()
    else SDK.portal.exitFullscreen()
  } catch {
    // Ignore.
  }
}

export function isInIframe() {
  const SDK = sdk()
  return SDK ? !!SDK.portal.isInIframe() : false
}

export { subscribeSettings, settings }
