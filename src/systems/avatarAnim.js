// The avatar skate cycle. PlayerAvatar.jsx builds one of these alongside the
// rig and ticks it each frame.
//
// Two paths, preferring Bloxity's own animation:
//   1. player.glb ships a clip matching GAIT.runClip -> drive it with an
//      AnimationMixer, cross-faded under an idle clip when present.
//   2. no such clip -> a generated push-glide skating stride on
//      ArmL1/ArmR1/LegL1/LegR1 (plus a second-segment knee/elbow bend on
//      LegL2/LegR2/ArmL2/ArmR2) and a Spine1 forward crouch, lateral
//      weight-shift sway, and a body bob.
//
// Everything here is null-safe: a missing bone or a total failure just
// leaves the avatar static, the same way a failed load leaves Player on the
// capsule.
import * as THREE from 'three'
import { GAIT, RIG_MOUNT_OFFSET, clamp } from '../data/bloxity.js'

// phase offset per limb: legs are half a cycle apart (one pushes off while
// the other glides); each arm is anti-phase to the leg on its own side
// (contralateral swing, for balance). `side` signs which way a leg splays
// outward on its push phase (left leg pushes left, right leg pushes right).
// The second-segment entries (kind 'leg2'/'arm2') share their own first
// segment's offset, since a knee/elbow bend during that limb's recovery has
// to land in the same phase the limb itself is already in.
const LIMBS = [
  { name: 'LegL1', kind: 'leg', offset: 0, side: 1 },
  { name: 'LegR1', kind: 'leg', offset: Math.PI, side: -1 },
  { name: 'ArmL1', kind: 'arm', offset: Math.PI },
  { name: 'ArmR1', kind: 'arm', offset: 0 },
  { name: 'LegL2', kind: 'leg2', offset: 0 },
  { name: 'LegR2', kind: 'leg2', offset: Math.PI },
  { name: 'ArmL2', kind: 'arm2', offset: Math.PI },
  { name: 'ArmR2', kind: 'arm2', offset: 0 },
]

const _rootQuat = new THREE.Quaternion()
const _parentQuat = new THREE.Quaternion()
const _relQuat = new THREE.Quaternion()
const _worldX = new THREE.Vector3(1, 0, 0)
const _worldZ = new THREE.Vector3(0, 0, 1)

// A limb bone's local axes are not world-aligned in this rig — how far off
// depends on how that specific bone's bind pose was authored (confirmed
// against player.glb: e.g. Spine1 sits at identity, most other bones
// don't). Rotating every bone about one fixed axis, like this used to,
// swings some limbs in a subtly wrong plane. This instead finds, once per
// bone at bind pose, which axis *in that bone's own parent-local rotation
// space* corresponds to the character's forward (+X, "swing") and sideways
// (+Z, "push/sway") axes — reading the full parent chain via world
// quaternions, not just the immediate parent, so a delta quaternion built
// from it and premultiplied onto the bind pose always rotates the limb in
// the same character-relative plane, whichever way that bone itself faces.
// (The chain's own ancestry above `root`, e.g. the player's current facing,
// cancels out of the parentQuat^-1 * rootQuat product, so this is safe to
// call with the rig already live in the scene graph.)
function boneAxes(root, bone) {
  const parent = bone.parent
  root.updateWorldMatrix(true, false)
  parent.updateWorldMatrix(true, false)
  root.getWorldQuaternion(_rootQuat)
  parent.getWorldQuaternion(_parentQuat)
  _relQuat.copy(_parentQuat).invert().multiply(_rootQuat)
  return {
    axisX: _worldX.clone().applyQuaternion(_relQuat).normalize(),
    axisZ: _worldZ.clone().applyQuaternion(_relQuat).normalize(),
  }
}

export function makeGait(built) {
  if (!built || !built.root) return null

  const gait = {
    built,
    amp: 0, // eased 0..1 locomotion weight
    phase: 0, // radians along the stride
    idleTime: 0, // seconds, only advances while idle
    q: new THREE.Quaternion(),
    q2: new THREE.Quaternion(),
    mixer: null,
    run: null,
    idle: null,
    limbs: [],
    spine: null,
    spineBind: null,
    spineAxes: null,
  }

  const run = (built.clips || []).find((c) => GAIT.runClip.test(c.name))
  if (run) {
    gait.mixer = new THREE.AnimationMixer(built.root)
    gait.run = gait.mixer.clipAction(run)
    gait.run.play()
    gait.run.setEffectiveWeight(0)

    const idle = built.clips.find((c) => GAIT.idleClip.test(c.name))
    if (idle) {
      gait.idle = gait.mixer.clipAction(idle)
      gait.idle.play()
    }
    return gait
  }

  for (const limb of LIMBS) {
    const bone = built.nodes[limb.name]
    if (bone && bone.parent) {
      gait.limbs.push({ ...limb, bone, bind: bone.quaternion.clone(), ...boneAxes(built.root, bone) })
    }
  }
  const spine = built.nodes.Spine1
  if (spine && spine.parent) {
    gait.spine = spine
    gait.spineBind = spine.quaternion.clone()
    gait.spineAxes = boneAxes(built.root, spine)
  }
  return gait
}

// speed01: horizontal speed / target run speed, clamped to 0..1. grounded
// gates the airborne pose below. verticalVelocity (player.velocity.y, m/s,
// +up) drives the airborne arm pose's rising/falling blend.
export function updateGait(gait, dt, speed01, grounded = true, verticalVelocity = 0) {
  if (!gait || dt <= 0) return

  const target = speed01 < 0 ? 0 : speed01 > 1 ? 1 : speed01
  gait.amp += (target - gait.amp) * (1 - Math.exp(-GAIT.blendHz * dt))
  gait.phase += GAIT.strideHz * 2 * Math.PI * dt * (0.35 + 0.65 * gait.amp)
  if (gait.phase > Math.PI * 2) gait.phase -= Math.PI * 2

  if (gait.mixer) {
    if (gait.run) {
      gait.run.setEffectiveWeight(gait.amp)
      gait.run.timeScale = 0.4 + 0.9 * gait.amp
    }
    if (gait.idle) gait.idle.setEffectiveWeight(1 - gait.amp)
    gait.mixer.update(dt)
    return
  }

  if (!grounded) {
    // 0 at full-speed fall, 1 at full-speed rise, 0.5 at the apex (v==0) —
    // continuous in verticalVelocity, so it crosses the apex with no snap.
    const armBlend = clamp(verticalVelocity / GAIT.airborneArmVelRef, -1, 1) * 0.5 + 0.5
    const armAngle = GAIT.airborneArmDown + (GAIT.airborneArmUp - GAIT.airborneArmDown) * armBlend
    for (const limb of gait.limbs) {
      let angle = 0
      if (limb.name === 'LegL1') angle = GAIT.airborneLegL
      else if (limb.name === 'LegR1') angle = GAIT.airborneLegR
      else if (limb.kind === 'arm') angle = armAngle
      else if (limb.kind === 'leg2') angle = GAIT.airborneKnee
      else if (limb.kind === 'arm2') angle = GAIT.airborneElbow
      gait.q.setFromAxisAngle(limb.axisX, angle)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    }
    if (gait.spine) {
      gait.q.setFromAxisAngle(gait.spineAxes.axisX, GAIT.airborneLean)
      gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
    }
    gait.built.root.position.y = RIG_MOUNT_OFFSET.y
    return
  }

  if (gait.amp < 0.01) {
    gait.idleTime += dt
    const idle = Math.sin(gait.idleTime * GAIT.idleSwayHz)
    for (const limb of gait.limbs) {
      if (limb.kind !== 'arm') {
        limb.bone.quaternion.copy(limb.bind)
        continue
      }
      const sign = limb.name === 'ArmL1' ? -1 : 1
      gait.q.setFromAxisAngle(limb.axisZ, sign * (GAIT.idleArmSway + idle * GAIT.idleArmSwayAmp))
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    }
    if (gait.spine) {
      gait.q.setFromAxisAngle(gait.spineAxes.axisX, idle * GAIT.idleSpineSway)
      gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
    }
    gait.built.root.position.y = RIG_MOUNT_OFFSET.y + idle * GAIT.idleBob
    return
  }

  for (const limb of gait.limbs) {
    const phaseAngle = gait.phase + limb.offset
    if (limb.kind === 'leg') {
      // Forward/back glide plus an outward push-off that peaks mid-stride
      // and draws the leg back under the body on the recovery half.
      const strideAngle = Math.sin(phaseAngle) * GAIT.legSwing * gait.amp
      const pushAngle = limb.side * GAIT.legPush * gait.amp * (0.5 + 0.5 * Math.sin(phaseAngle))
      gait.q.setFromAxisAngle(limb.axisX, strideAngle)
      gait.q2.setFromAxisAngle(limb.axisZ, pushAngle)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q2).premultiply(gait.q)
    } else if (limb.kind === 'leg2') {
      // Knee bends forward on this leg's own recovery half (the half its
      // LegL1/LegR1 counterpart swings backward), never the other way.
      const bend = Math.max(0, -Math.sin(phaseAngle)) * GAIT.kneeBend * gait.amp
      gait.q.setFromAxisAngle(limb.axisX, bend)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    } else if (limb.kind === 'arm') {
      const swing = GAIT.armSwing * gait.amp
      gait.q.setFromAxisAngle(limb.axisX, Math.sin(phaseAngle) * swing)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    } else if (limb.kind === 'arm2') {
      const bend = Math.max(0, Math.sin(phaseAngle)) * GAIT.elbowBend * gait.amp
      gait.q.setFromAxisAngle(limb.axisX, bend)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    }
  }
  if (gait.spine) {
    // Forward crouch plus a side-to-side weight shift onto whichever skate
    // is currently gliding.
    gait.q.setFromAxisAngle(gait.spineAxes.axisX, GAIT.lean * gait.amp)
    gait.q2.setFromAxisAngle(gait.spineAxes.axisZ, Math.sin(gait.phase) * GAIT.hipSway * gait.amp)
    gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q2).premultiply(gait.q)
  }
  gait.built.root.position.y = RIG_MOUNT_OFFSET.y + Math.abs(Math.sin(gait.phase)) * GAIT.bob * gait.amp
}

// Return the rig to its bind pose. Call before disposeAvatar(), while the
// nodes are still live.
export function disposeGait(gait) {
  if (!gait) return
  if (gait.mixer) {
    gait.mixer.stopAllAction()
    gait.mixer.uncacheRoot(gait.built.root)
  }
  for (const limb of gait.limbs) limb.bone.quaternion.copy(limb.bind)
  if (gait.spine) gait.spine.quaternion.copy(gait.spineBind)
  if (gait.built && gait.built.root) gait.built.root.position.y = RIG_MOUNT_OFFSET.y
}
