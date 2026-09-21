// The equipped cosmetics + body proportions the portal owns for this user.
// Mutated in place like playerState, so the loader and the frame loop can
// read it without a subscription.
import { DEFAULT_EQUIPPED, PROPORTIONS, clamp } from '../data/bloxity.js'

function defaultProportions() {
  const p = {}
  for (const [k, spec] of Object.entries(PROPORTIONS)) p[k] = spec.def
  return p
}

export const avatarState = {
  // Signed out, SDK absent, or nothing loaded yet: the guest wears
  // DEFAULT_EQUIPPED (the bare base rig). null is reserved for an explicit
  // "hide the avatar" and drops Player back to the capsule.
  equipped: DEFAULT_EQUIPPED,
  proportions: defaultProportions(),
}

const listeners = new Set()

export function subscribe(fn) {
  listeners.add(fn)
  fn(avatarState)
  return () => listeners.delete(fn)
}

function emit(reason) {
  for (const fn of listeners) fn(avatarState, reason)
}

function writeProportions(next) {
  const p = avatarState.proportions
  for (const [k, spec] of Object.entries(PROPORTIONS)) {
    const raw = next && next[k] != null ? Number(next[k]) : spec.def
    p[k] = clamp(Number.isFinite(raw) ? raw : spec.def, spec.min, spec.max)
  }
}

export function setEquipped(equipped) {
  avatarState.equipped = equipped || null
  emit('equipped')
}

export function setProportions(next) {
  writeProportions(next)
  emit('proportions')
}

// Equipped + proportions changing together (login, onAvatarChanged) must land
// as ONE notification.
export function setAvatar(equipped, proportions) {
  avatarState.equipped = equipped || null
  writeProportions(proportions)
  emit('equipped')
}

export function resetAvatar() {
  avatarState.equipped = DEFAULT_EQUIPPED
  avatarState.proportions = defaultProportions()
  emit('reset')
}
