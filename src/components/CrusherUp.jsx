import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GroundBlock } from './Ground.jsx'
import { CRUSHER_UP, CRUSHER_UP_SIZE } from '../data/crusherUp.js'
import { currentY } from '../systems/crusherUpAnim.js'

// Stage10's floor-mounted rising-spike hazard — see data/crusherUp.js for
// the Blender sync and systems/crusherUpAnim.js for the punch-up/retract
// cycle. Rendered with the same textured GroundBlock box every other
// Ground_Cube-derived prop uses (components/Ground.jsx), yawed by the
// object's own rotationY and with its Y position mutated every frame
// instead of staying static — same objectRef convention as
// components/CrusherSide.jsx.
const [WIDTH, HEIGHT, DEPTH] = CRUSHER_UP_SIZE

export default function CrusherUp() {
  const objectRef = useRef()

  useFrame(() => {
    const obj = objectRef.current
    if (!obj) return
    obj.position.y = currentY()
  })

  return (
    <GroundBlock
      objectRef={objectRef}
      width={WIDTH}
      thickness={HEIGHT}
      depth={DEPTH}
      position={CRUSHER_UP.position}
      rotation={[0, CRUSHER_UP.rotationY, 0]}
    />
  )
}
