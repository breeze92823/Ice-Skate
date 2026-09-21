// inputState: camera-relative move vector, orbit look delta, wheel zoom, an
// edge-triggered jump, and the primary-action ("fire") flag the touch Fire
// button and desktop left-click drive — nothing in this project consumes
// `firing` for gameplay yet (there is no laser/combat system), but it's
// kept wired so the touch HUD's Fire button has real state to show/hide
// against, matching components/hud/TouchControls.jsx as shipped.
import { AFK_INTERACT_KEY } from '../data/afk.js'

export const inputState = {
  // x = strafe (+ right), z = forward (+ forward); pre-normalised. Keyboard
  // only ever writes z — A/D and the arrow keys turn the camera (see `turn`
  // below) instead of strafing; touch's virtual joystick is the only thing
  // that still drives x.
  move: { x: 0, z: 0 },
  turn: 0, // -1 (A/Left) .. +1 (D/Right); held-key camera yaw, consumed by cameraOrbit
  look: { dx: 0, dy: 0 }, // pixels dragged this frame; consumed by cameraOrbit
  zoom: 0, // wheel delta this frame; consumed by cameraOrbit
  pointerNDC: { x: 0, y: 0 }, // mouse position in [-1, 1] clip space
  jump: false, // set on keydown, consumed by playerMovement
  firing: false, // held while left mouse / primary touch is down
  firePressAt: 0,
  fireReleaseAt: 0,
  firePressSeq: 0,
  interact: false, // edge-triggered on AFK_INTERACT_KEY keydown; consumed by systems/afk.js
}

// Touch sessions have no keyboard and no cursor: the on-screen controls
// (components/hud/TouchControls.jsx) drive `inputState` through the setters
// below. `active` flips once — on the first real touch, or immediately when
// the primary pointer is coarse — and never flips back for the session.
export const touchState = {
  active: false,
}

const touchModeSubs = new Set()

export function subscribeTouchMode(cb) {
  touchModeSubs.add(cb)
  return () => touchModeSubs.delete(cb)
}

// Sticky tap-to-aim point, in viewport px. Purely so TouchControls.jsx's
// Crosshair can redraw itself where the player last tapped.
export const touchAimState = { x: 0, y: 0 }
const touchAimSubs = new Set()

export function subscribeTouchAim(cb) {
  touchAimSubs.add(cb)
  return () => touchAimSubs.delete(cb)
}

export function setTouchAim(clientX, clientY) {
  touchAimState.x = clientX
  touchAimState.y = clientY
  inputState.pointerNDC.x = (clientX / window.innerWidth) * 2 - 1
  inputState.pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1
  touchAimSubs.forEach((cb) => cb(clientX, clientY))
}

function enableTouchMode() {
  if (touchState.active) return
  touchState.active = true
  touchAimState.x = window.innerWidth / 2
  touchAimState.y = window.innerHeight / 2
  inputState.pointerNDC.x = 0
  inputState.pointerNDC.y = 0
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('touch-mode')
  }
  touchModeSubs.forEach((cb) => cb(true))
}

function onTouchStartDetect() {
  enableTouchMode()
}

// Called by TouchControls.jsx. Movement is analog here (magnitude 0..1),
// unlike the keyboard's unit vector.
export function setTouchMove(x, z) {
  inputState.move.x = x
  inputState.move.z = z
}

export function addTouchLook(dx, dy) {
  inputState.look.dx += dx
  inputState.look.dy += dy
}

export function addTouchZoom(dz) {
  inputState.zoom += dz
}

export function setTouchFiring(on) {
  if (on) {
    if (inputState.firing) return
    inputState.firing = true
    inputState.firePressAt = performance.now()
    inputState.firePressSeq++
  } else if (inputState.firing) {
    inputState.firing = false
    inputState.fireReleaseAt = performance.now()
  }
}

export function pressTouchJump() {
  inputState.jump = true
}

// Continuous "is the interact key physically held" signal, separate from
// inputState.interact's one-shot edge flag.
export const touchInteractState = { down: false }

export function pressTouchInteract() {
  touchInteractState.down = true
  inputState.interact = true
}

export function releaseTouchInteract() {
  touchInteractState.down = false
}

const held = new Set()
let orbiting = false
let installed = false

// Escape opens the portal's pause menu. Registered by the Bloxity facade so
// this module keeps knowing nothing about the SDK.
let escapeHandler = null

export function setEscapeHandler(fn) {
  escapeHandler = fn
}

// Reasons the scene currently must not receive input: an SDK auth modal,
// the avatar customizer, the portal menu.
const suspensions = new Set()

export function suspend(reason) {
  suspensions.add(reason)
  if (installed) uninstall()
}

export function resume(reason) {
  suspensions.delete(reason)
  if (suspensions.size === 0 && !installed) install()
}

export function isSuspended() {
  return suspensions.size > 0
}

function recomputeMove() {
  let z = 0
  if (held.has('KeyW') || held.has('ArrowUp')) z += 1
  if (held.has('KeyS') || held.has('ArrowDown')) z -= 1
  inputState.move.z = z
}

function recomputeTurn() {
  let t = 0
  if (held.has('KeyA') || held.has('ArrowLeft')) t -= 1
  if (held.has('KeyD') || held.has('ArrowRight')) t += 1
  inputState.turn = t
}

function onKeyDown(e) {
  if (e.repeat) return
  if (e.code === 'Escape') {
    if (escapeHandler) escapeHandler()
    return
  }
  held.add(e.code)
  if (e.code === 'Space') inputState.jump = true
  if (e.code === AFK_INTERACT_KEY) inputState.interact = true
  recomputeMove()
  recomputeTurn()
}

function onKeyUp(e) {
  held.delete(e.code)
  recomputeMove()
  recomputeTurn()
}

function onPointerDown(e) {
  if (e.pointerType === 'touch') return
  if (e.button === 0 && e.target.tagName === 'CANVAS') {
    inputState.firing = true
    inputState.firePressAt = performance.now()
    inputState.firePressSeq++
  }
  if (e.button === 1 || e.button === 2) orbiting = true
}

function onPointerUp(e) {
  if (e.pointerType === 'touch') return
  if (e.button === 0 && inputState.firing) {
    inputState.firing = false
    inputState.fireReleaseAt = performance.now()
  }
  if (e.button === 1 || e.button === 2) orbiting = false
}

function onPointerMove(e) {
  if (e.pointerType === 'touch') return
  inputState.pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1
  inputState.pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1

  if (!orbiting) return
  inputState.look.dx += e.movementX || 0
  inputState.look.dy += e.movementY || 0
}

function onWheel(e) {
  inputState.zoom += e.deltaY
}

function onContextMenu(e) {
  e.preventDefault() // right-drag is the orbit gesture
}

function onBlur() {
  held.clear()
  orbiting = false
  if (inputState.firing) inputState.fireReleaseAt = performance.now()
  inputState.firing = false
  inputState.interact = false
  touchInteractState.down = false
  recomputeMove()
  recomputeTurn()
}

// Live key-held check, for systems that need to poll a specific key each
// frame rather than react to inputState's edge-triggered flags.
export function isHeld(code) {
  return held.has(code)
}

export function isInteractKeyDown() {
  return held.has(AFK_INTERACT_KEY) || touchInteractState.down
}

export function install() {
  if (installed || suspensions.size > 0) return
  installed = true
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('contextmenu', onContextMenu)
  window.addEventListener('blur', onBlur)
  window.addEventListener('touchstart', onTouchStartDetect, { passive: true })

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches &&
    (navigator.maxTouchPoints || 0) > 0
  ) {
    enableTouchMode()
  }
}

export function uninstall() {
  if (!installed) return
  installed = false
  onBlur()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('contextmenu', onContextMenu)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('touchstart', onTouchStartDetect)
}
