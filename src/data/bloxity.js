// Every tunable number for the Bloxity (Legion) SDK integration lives here
// (systems/bloxity.js, systems/avatarModel.js). No SDK constant belongs in a
// component.

// TODO: replace with the slug this game is registered under on bloxity.io.
export const GAME_SLUG = 'ice-skate'

export const AVATAR_CDN = 'https://static.bloxity.io/avatars'

// Profile picture shown for a guest (not signed in) or when a signed-in user
// has no `pfp`. components/hud/IdentityChip.jsx's <img> onError falls back
// to an inline silhouette so a blocked CDN never leaves an empty slot.
export const GUEST_PFP_URL = 'https://static.bloxity.io/img/pfps/s0.png?width=128&quality=85&v=2'

// The base rig, measured from the shipped player.glb: origin at the feet, 6.4
// units tall at bind pose. Player.jsx's group origin is also the feet, so the
// model only needs a uniform scale to land in metres.
export const RIG_HEIGHT = 6.4

// Bind-pose values of the rig nodes the proportions drive.
export const RIG = {
  root: 'Rig1',
  armOffsetX: 2, // ArmL_Offset.x, mirrored for ArmR_Offset
  legOffsetX: 0.6, // LegL_Offset.x, mirrored
  neckOffsetY: 0.6, // Neck_Offset.y
}

// Manual mount offset for the whole avatar rig (built.root), relative to
// Player.jsx's own group — which sits at the capsule's feet/origin in world
// space. player.glb's stated origin is already the feet (see RIG_HEIGHT
// above), so this defaults to zero; only nudge it if a specific rig build
// needs the whole body shifted to align against the capsule/collider or
// ground. Applied in avatarModel.js's applyProportions(), in *metres*
// (world/Player space, after built.root's own scale) — not rig-authored
// units, unlike RIG's offsets above.
export const RIG_MOUNT_OFFSET = { x: 0, y: 0.13, z: 0 }

// getProportions() ranges, straight from the SDK spec. Values arrive from a
// remote portal, so everything is clamped before it reaches the scene graph.
export const PROPORTIONS = {
  height: { def: 1, min: 0.5, max: 1.6 },
  shoulderWidth: { def: 1, min: 0.5, max: 1.5 },
  armLength: { def: 1, min: 0.05, max: 3 },
  legOffsetX: { def: 1, min: -0.7, max: 5 },
  torsoScaleX: { def: 1, min: 0.3, max: 2 },
  neckHeight: { def: 1, min: 0.94, max: 1.2 },
  headScale: { def: 1, min: 0.3, max: 2.6 },
}

// Equipped-slot table. `part` slots replace the matching default_* mesh in
// the base rig; `item` slots are extra meshes parented to a bone.
export const AVATAR_SLOTS = [
  { key: 'headId', kind: 'part', type: 'head', replaces: 'default_head' },
  { key: 'torsoId', kind: 'part', type: 'torso', replaces: 'default_torso' },
  { key: 'armLId', kind: 'part', type: 'arms', side: 'L', replaces: 'default_arm_L' },
  { key: 'armRId', kind: 'part', type: 'arms', side: 'R', replaces: 'default_arm_R' },
  { key: 'legLId', kind: 'part', type: 'legs', side: 'L', replaces: 'default_leg_L' },
  { key: 'legRId', kind: 'part', type: 'legs', side: 'R', replaces: 'default_leg_R' },
  { key: 'hatId', kind: 'item', type: 'hats', attach: 'Neck1' },
  { key: 'backId', kind: 'item', type: 'back', attach: 'Spine2' },
]

// '-1' / '' / 'undefined' / null all mean "nothing equipped, use the default".
export function isEquipped(id) {
  return id != null && id !== '' && id !== '-1' && id !== 'undefined' && id !== 'null'
}

export function partUrl(slot, id) {
  const suffix = slot.side ? `_${slot.side}` : ''
  return `${AVATAR_CDN}/parts/${slot.type}/${id}${suffix}.glb`
}

export function itemUrls(slot, id) {
  return {
    mesh: `${AVATAR_CDN}/items/${slot.type}/${id}.obj`,
    texture: `${AVATAR_CDN}/textures/${slot.type}/${id}.png`,
  }
}

export function skinUrl(id) {
  return `${AVATAR_CDN}/skins/${id}.png`
}

export const BASE_MODEL_URL = `${AVATAR_CDN}/player.glb`

// What a guest (no SDK, not signed in, or the avatar read failed) wears. An
// empty set renders the base rig exactly as it ships.
export const DEFAULT_EQUIPPED = {}

// --- Locomotion: the skate cycle ----------------------------------------
// The base rig has two-segment limbs (ArmL1->ArmL2, LegL1->LegL2) and a
// two-node spine. If player.glb ships its own clip whose name matches
// `runClip`, avatarAnim.js plays that through an AnimationMixer instead and
// ignores every number below; these only drive the generated fallback, which
// is a push-glide skating stride rather than a run: each leg splays outward
// on its push phase and draws back under the body on its glide phase, in
// addition to the forward/back swing shared with the arms, plus a knee/elbow
// bend on the second segment during each limb's own recovery half
// (kneeBend/elbowBend below). avatarAnim.js derives each bone's own
// swing/push axis from its bind pose rather than a configured world axis.
export const GAIT = {
  runClip: /run|sprint|jog/i,
  idleClip: /idle|stand/i,
  strideHz: 1.7,
  legSwing: 0.45,
  legPush: 0.5,
  armSwing: 0.35,
  lean: 0.22,
  hipSway: 0.12,
  bob: 0.03,
  blendHz: 8,

  // Second-segment (knee/elbow) bend, peaking during each limb's own
  // recovery/swing phase. avatarAnim.js derives each bone's own swing/push
  // axis from its bind pose rather than a configured world axis, since the
  // rig's limb bones aren't uniformly oriented (confirmed against
  // player.glb) — a fixed axis swung some of them in a subtly wrong plane.
  kneeBend: 0.5,
  elbowBend: 0.25,

  idleSwayHz: 1.6,
  idleArmSway: 0.07,
  idleArmSwayAmp: 0.03,
  idleSpineSway: 0.02,
  idleBob: 0.03,

  airborneLegL: -0.55,
  airborneLegR: 0.3,
  airborneKnee: 0.7,
  airborneElbow: 0.6,
  // Arms blend continuously between these two off player.velocity.y instead
  // of holding one fixed pose, so they read up while rising and drop while
  // falling, crossing smoothly through 0 at the jump's apex.
  airborneArmUp: -2.6, // arm angle at/above +airborneArmVelRef vertical speed (rising)
  airborneArmDown: -1.2, // arm angle at/below -airborneArmVelRef vertical speed (falling)
  airborneArmVelRef: 6, // m/s of vertical speed at which the up/down blend saturates
  airborneLean: -0.1,

  turnRate: 0.001, // base of 1 - turnRate^delta; smaller = snappier turn
}

export function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n
}

// --- Settings -------------------------------------------------------------
// All SDK setting values are strings. Registering a listener is what makes
// the control appear in the portal menu, so every key here has something
// behind it.
export const SETTINGS = {
  master_volume: { def: '80', type: 'number', min: 0, max: 100 },
  music_volume: { def: '80', type: 'number', min: 0, max: 100 },
  graphics_quality: { def: 'High', type: 'enum', values: ['Low', 'Medium', 'High', 'Ultra'] },
  show_fps: { def: 'false', type: 'bool' },
  camera_sensitivity: { def: '1', type: 'number', min: 0.1, max: 5 },
  fullscreen: { def: 'false', type: 'bool' },
  background_transparency: { def: '0.9', type: 'number', min: 0.2, max: 1 },
}

// Coerce one raw SDK string against its SETTINGS entry.
export function coerceSetting(key, raw) {
  const spec = SETTINGS[key]
  if (!spec) return raw
  const value = raw === '' || raw == null ? spec.def : raw
  if (spec.type === 'bool') return value === 'true'
  if (spec.type === 'enum') {
    return spec.values.includes(value) ? value : spec.def
  }
  const n = Number(value)
  return clamp(Number.isFinite(n) ? n : Number(spec.def), spec.min, spec.max)
}
