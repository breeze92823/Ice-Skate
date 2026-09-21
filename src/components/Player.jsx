import { useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { player } from '../systems/playerState.js'
import PlayerAvatar from './PlayerAvatar.jsx'
import { MATERIAL_PBR } from '../data/materials.js'
import { GAIT } from '../data/bloxity.js'

const _up = new Vector3(0, 1, 0)
const _targetQuat = new Quaternion()

// Presentation only: read the player singleton, draw the character. The
// group origin sits at the capsule base (feet), matching playerState's
// convention — the Bloxity rig uses the same origin, so both mount
// unchanged.
export default function Player() {
  const ref = useRef()
  const [hasAvatar, setHasAvatar] = useState(false)

  // Stable identity: PlayerAvatar's effect depends on this.
  const onAvatarReady = useCallback((ready) => setHasAvatar(ready), [])

  useFrame((_state, delta) => {
    const g = ref.current
    if (!g) return
    g.position.set(player.position.x, player.position.y, player.position.z)
    // Turn toward player.facing rather than snapping to it.
    _targetQuat.setFromAxisAngle(_up, player.facing)
    g.quaternion.slerp(_targetQuat, 1 - Math.pow(GAIT.turnRate, delta))
  })

  // The capsule is the fallback, not dead code: it is what renders while the
  // default rig loads, or when the avatar CDN is unreachable and a load fails.
  const { radius, height } = player.dims
  const cylinder = height - radius * 2

  return (
    <group ref={ref}>
      <group visible={!hasAvatar}>
        <mesh position-y={height / 2} castShadow>
          <capsuleGeometry args={[radius, cylinder, 4, 12]} />
          <meshStandardMaterial color="#d9564b" {...MATERIAL_PBR.FLAT_PLACEHOLDER} />
        </mesh>
        {/* nub marking the facing direction */}
        <mesh position={[0, height * 0.62, radius]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial color="#ffd36b" {...MATERIAL_PBR.FLAT_PLACEHOLDER} />
        </mesh>
      </group>
      <PlayerAvatar onReady={onAvatarReady} />
    </group>
  )
}
