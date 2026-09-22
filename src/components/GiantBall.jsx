import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MATERIAL_PBR } from '../data/materials.js'
import { GIANT_BALL } from '../data/giantBall.js'
import { giantBall } from '../systems/giantBallPhysics.js'

// Placeholder color — swap freely, appearance is owned by game code, not
// Blender (see feedback-blender-material-ownership memory).
const BALL_COLOR = '#d94f4f'

// ~11m-diameter hero prop (Stage3), so 16x16 segments rather than the usual
// 8x8 for incidental spheres — at this scale 8x8 faceting would be visible.
export default function GiantBall() {
  const ref = useRef()

  // Presentation only: read the giantBall singleton (see
  // systems/giantBallPhysics.js), draw the sphere. No per-frame allocation —
  // mutate the group in place, same convention as Player.jsx.
  useFrame(() => {
    const g = ref.current
    if (!g) return
    g.position.set(giantBall.position.x, giantBall.position.y, giantBall.position.z)
    g.rotation.x = giantBall.spin
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[GIANT_BALL.radius, 16, 16]} />
      <meshStandardMaterial color={BALL_COLOR} {...MATERIAL_PBR.GIANT_BALL} />
    </mesh>
  )
}
