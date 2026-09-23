import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { sunPosition, sunTarget } from '../systems/shadowSun.js'

// Same two-light setup as before (hemisphere + one shadow-casting
// directional light), but the light and its target now follow the player
// each frame instead of sitting fixed at the origin, so the shadow frustum
// stays centered on wherever the player actually is in the (now much
// larger) level.
//
// The frustum is ±100 (not the original ±45) because these guard-wall
// corridors are long, straight sightlines — a player can see much farther
// than 45 units down one. A box that small left a hard, floating edge
// visible mid-corridor (everything past the edge defaults to "fully lit",
// producing a sunlit patch against otherwise-shadowed floor). ±100 pushes
// that edge out past typical sightlines; the paired scene fog in App.jsx
// fades out anything near the remaining edge instead of leaving a seam.
// normalBias is scaled up to match the coarser texel size at this larger
// footprint (same 2048² map spread over a bigger area).
export default function ShadowSun() {
  const lightRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return
    light.target = target
    target.updateMatrixWorld()
  }, [])

  useFrame(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return
    light.position.set(sunPosition.x, sunPosition.y, sunPosition.z)
    target.position.set(sunTarget.x, sunTarget.y, sunTarget.z)
    target.updateMatrixWorld()
  })

  return (
    <>
      <directionalLight
        ref={lightRef}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.08}
      />
      <object3D ref={targetRef} />
    </>
  )
}
