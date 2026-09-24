import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GroundBlock } from './Ground.jsx'
import { CRUSHER_SIDE, CRUSHER_SIDE_SIZE } from '../data/crusherSide.js'
import { currentX } from '../systems/crusherSideAnim.js'

// Stage8's side-mounted compactor hazard — see data/crusherSide.js for the
// Blender sync and systems/crusherSideAnim.js for the punch-closed/retract
// cycle. Rendered with the same textured GroundBlock box every other
// Ground_Cube-derived prop uses (components/Ground.jsx), just with its X
// position mutated every frame instead of staying static — same objectRef
// convention as components/CrusherWalls.jsx.
const [WIDTH, THICKNESS, DEPTH] = CRUSHER_SIDE_SIZE

export default function CrusherSide() {
  const objectRef = useRef()

  useFrame(() => {
    const obj = objectRef.current
    if (!obj) return
    obj.position.x = currentX()
  })

  return (
    <GroundBlock
      objectRef={objectRef}
      width={WIDTH}
      thickness={THICKNESS}
      depth={DEPTH}
      position={CRUSHER_SIDE.position}
    />
  )
}
