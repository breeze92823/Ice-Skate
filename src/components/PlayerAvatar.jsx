import { useEffect, useRef, useState } from 'react'
import { useFrame, createPortal } from '@react-three/fiber'
import { subscribe } from '../systems/avatarState.js'
import { applyProportions, buildAvatar, disposeAvatar } from '../systems/avatarModel.js'
import { makeGait, updateGait, disposeGait } from '../systems/avatarAnim.js'
import { player, setDims, resetDims } from '../systems/playerState.js'
import { anyTreadmillOccupied } from '../systems/treadmillAnim.js'
import { TREADMILL_WALK_ANIM_SPEED } from '../data/treadmill.js'
import { EquippedLegSkate } from './EquippedSkates.jsx'

// Mounts the Bloxity avatar under Player's transform group. Presentation
// only: all loading, rig maths and the run cycle live in
// systems/avatarModel.js and systems/avatarAnim.js.
//
// `onReady(bool)` tells Player whether to keep drawing the capsule fallback.
export default function PlayerAvatar({ onReady }) {
  const groupRef = useRef(null)
  const gaitRef = useRef(null)
  // LegL1/LegR1 (+ each leg's own sole offset) once a rig is built — drives
  // the createPortal pair below that groups the equipped skate with each
  // bone. React state (not a ref) because it must trigger a render: the
  // portal target itself is JSX.
  const [legBones, setLegBones] = useState(null)

  useEffect(() => {
    let built = null
    let generation = 0
    let disposed = false
    let cancelToken = null

    const clear = () => {
      if (gaitRef.current) {
        disposeGait(gaitRef.current)
        gaitRef.current = null
      }
      if (built) {
        disposeAvatar(built)
        built = null
      }
      resetDims()
      setLegBones(null)
      onReady(false)
    }

    const rebuild = async (equipped, proportions) => {
      const mine = ++generation
      if (cancelToken) cancelToken.cancelled = true
      clear()
      if (!equipped) return
      const token = { cancelled: false }
      cancelToken = token
      const next = await buildAvatar(equipped, token)
      // A newer rebuild (or unmount) landed while we were loading.
      if (disposed || mine !== generation) {
        disposeAvatar(next)
        return
      }
      if (!next || !groupRef.current) {
        disposeAvatar(next)
        return
      }
      built = next
      const dims = applyProportions(built, proportions)
      setDims(dims.radius, dims.height)
      groupRef.current.add(built.root)
      gaitRef.current = makeGait(built)
      const legL = built.nodes.LegL1
      const legR = built.nodes.LegR1
      setLegBones(legL && legR ? { legL, legR, foot: built.legFoot } : null)
      onReady(true)
    }

    const off = subscribe((state, reason) => {
      if (reason === 'proportions' && built) {
        // No reload needed: proportions only move bones.
        const dims = applyProportions(built, state.proportions)
        setDims(dims.radius, dims.height)
        return
      }
      rebuild(state.equipped, state.proportions)
    })

    return () => {
      disposed = true
      if (cancelToken) cancelToken.cancelled = true
      off()
      clear()
    }
  }, [onReady])

  useFrame((_, delta) => {
    const gait = gaitRef.current
    if (!gait) return
    const moveSpeed = Math.hypot(player.velocity.x, player.velocity.z) / player.moveSpeed
    // Standing still on a running treadmill belt (systems/treadmillAnim.js)
    // still reads as walking, like stepping onto a real one, instead of the
    // avatar idling in place while the belt scrolls under it.
    const speed = anyTreadmillOccupied.value ? Math.max(moveSpeed, TREADMILL_WALK_ANIM_SPEED) : moveSpeed
    updateGait(gait, Math.min(delta, 0.1), speed, player.grounded, player.velocity.y)
  })

  return (
    <group ref={groupRef}>
      {legBones && createPortal(<EquippedLegSkate {...legBones.foot.L} side="L" />, legBones.legL)}
      {legBones && createPortal(<EquippedLegSkate {...legBones.foot.R} side="R" />, legBones.legR)}
    </group>
  )
}
