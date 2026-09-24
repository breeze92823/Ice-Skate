import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { remotePlayers, subscribe } from '../systems/net.js'
import { buildAvatar, applyProportions, disposeAvatar } from '../systems/avatarModel.js'
import { makeGait, updateGait, disposeGait } from '../systems/avatarAnim.js'
import { REMOTE_BODY } from '../data/net.js'
import { MATERIAL_PBR } from '../data/materials.js'

// Other players in the same rink room (systems/net.js). Presentation only:
// the socket, interpolation, roster and avatar payloads all live in the
// system; this mounts the real Bloxity character per remote — equipped
// cosmetics + the shared skate cycle — exactly the way PlayerAvatar.jsx does
// for the local player, reusing systems/avatarModel.js + avatarAnim.js.
//
// The capsule is the fallback: it shows while a rig loads, when a remote's
// avatar CDN load fails, and for any player past data/net.js
// MAX_REMOTE_BODIES (those simply aren't tracked at all).
//
// Equipped skate cosmetics (SkateRack tier) aren't part of this — that's
// driven by store/useGameStore.js's equippedHexPad locally only, and isn't
// on the wire (RinkState.PlayerState carries the Bloxity avatar blob, not a
// hex pad index), so remotes render the bare rig/capsule feet.

const R = REMOTE_BODY.RADIUS
const H = REMOTE_BODY.HEIGHT
const CYL = H - R * 2

// Mounts one remote's avatar rig under the caller's transform group. Mirrors
// PlayerAvatar.jsx: all loading / rig maths / gait live in the systems; this
// rebuilds when the remote's `rev` (systems/net.js avatarRev) changes and
// ticks the gait from their reported moveBlend factor.
function RemoteAvatar({ id, rev, onReady }) {
  const groupRef = useRef(null)
  const gaitRef = useRef(null)

  useEffect(() => {
    let built = null
    let generation = 0
    let disposed = false

    const clear = () => {
      if (gaitRef.current) {
        disposeGait(gaitRef.current)
        gaitRef.current = null
      }
      if (built) {
        disposeAvatar(built)
        built = null
      }
      onReady(false)
    }

    const build = async () => {
      const mine = ++generation
      clear()
      const e = remotePlayers.get(id)
      if (!e) return
      // A guest's `equipped` is {} — buildAvatar still returns the bare base
      // rig, same as the local signed-out player.
      const next = await buildAvatar(e.equipped || {})
      if (disposed || mine !== generation) {
        disposeAvatar(next)
        return
      }
      if (!next || !groupRef.current) {
        disposeAvatar(next)
        return
      }
      built = next
      applyProportions(built, e.proportions)
      groupRef.current.add(built.root)
      gaitRef.current = makeGait(built)
      onReady(true)
    }

    build()
    return () => {
      disposed = true
      clear()
    }
  }, [id, rev, onReady])

  useFrame((_, delta) => {
    const e = remotePlayers.get(id)
    const gait = gaitRef.current
    // e.rmoveBlend is the eased 0..1 gait factor the remote sent — drive the
    // skate cycle straight off it, same as the local player's own moveBlend.
    if (gait) updateGait(gait, Math.min(delta, 0.1), e ? e.rmoveBlend : 0)
  })

  return <group ref={groupRef} />
}

function RemoteBody({ id, name, avatarRev }) {
  const bodyRef = useRef()
  const bodyMatRef = useRef()
  const nubMatRef = useRef()

  const [hasAvatar, setHasAvatar] = useState(false)
  const onAvatarReady = useCallback((ready) => setHasAvatar(ready), [])

  useFrame(() => {
    const e = remotePlayers.get(id)
    const body = bodyRef.current
    if (!e || !body) return

    // Eased world transform, faded by alpha (systems/net.js's step()).
    body.position.set(e.rx, e.ry, e.rz)
    body.rotation.y = e.ryaw
    const a = e.alpha
    body.visible = a > 0.01
    // The capsule fallback fades; the rig (many materials) just hard-toggles
    // with the group above.
    const transparent = a < 0.999
    if (bodyMatRef.current) {
      bodyMatRef.current.transparent = transparent
      bodyMatRef.current.opacity = a
    }
    if (nubMatRef.current) {
      nubMatRef.current.transparent = transparent
      nubMatRef.current.opacity = a
    }
  })

  return (
    <group ref={bodyRef}>
      {/* Fallback capsule — visible until the rig is mounted. */}
      <group visible={!hasAvatar}>
        <mesh position-y={H / 2} castShadow>
          <capsuleGeometry args={[R, CYL, 4, 12]} />
          <meshStandardMaterial ref={bodyMatRef} color={REMOTE_BODY.COLOR} {...MATERIAL_PBR.FLAT_PLACEHOLDER} />
        </mesh>
        {/* nub marking the facing direction, matching Player.jsx's own capsule */}
        <mesh position={[0, H * 0.62, R]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial ref={nubMatRef} color={REMOTE_BODY.NUB_COLOR} {...MATERIAL_PBR.FLAT_PLACEHOLDER} />
        </mesh>
      </group>

      <RemoteAvatar id={id} rev={avatarRev} onReady={onAvatarReady} />

      <Billboard position-y={REMOTE_BODY.NAME_HEIGHT}>
        <Text
          fontSize={REMOTE_BODY.NAME_SIZE}
          color={REMOTE_BODY.NAME_COLOR}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.022}
          outlineColor={REMOTE_BODY.NAME_OUTLINE}
          maxWidth={6}
        >
          {name}
        </Text>
      </Billboard>
    </group>
  )
}

// Re-renders only on roster / name / avatar changes (systems/net.js emits on
// join, leave, name resolve and avatarRev bump) — never per frame. Each
// RemoteBody then drives its own transform + gait from the frame loop.
export default function RemotePlayers() {
  const [, bump] = useReducer((n) => n + 1, 0)
  useEffect(() => subscribe(() => bump()), [])

  const bodies = []
  for (const [id, e] of remotePlayers) {
    bodies.push(<RemoteBody key={id} id={id} name={e.username || 'Player'} avatarRev={e.avatarRev} />)
  }
  return bodies
}
