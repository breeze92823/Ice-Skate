import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GroundBlock } from './Ground.jsx'
import { CRUSHER_WALLS, CRUSHER_WALL_SIZE } from '../data/crusherWall.js'
import { currentZ } from '../systems/crusherAnim.js'

// Stage9's compactor hazard — see data/crusherWall.js for the Blender sync
// and systems/crusherAnim.js for the shared slide-closed/retract cycle both
// instances play in sync. Rendered with the same textured GroundBlock box
// every other Ground_Cube-derived prop uses (components/Ground.jsx), just
// with its Z position mutated every frame instead of staying static — same
// "grab an objectRef, mutate outside React" convention as
// GroundBlocks.jsx's PhasingGroundBlock.
const [WIDTH, THICKNESS, DEPTH] = CRUSHER_WALL_SIZE

function CrusherWall({ position }) {
  const objectRef = useRef()

  useFrame(() => {
    const obj = objectRef.current
    if (!obj) return
    obj.position.z = currentZ(position)
  })

  return (
    <GroundBlock
      objectRef={objectRef}
      width={WIDTH}
      thickness={THICKNESS}
      depth={DEPTH}
      position={position}
    />
  )
}

export default function CrusherWalls() {
  return (
    <>
      {CRUSHER_WALLS.map((wall) => (
        <CrusherWall key={wall.name} position={wall.position} />
      ))}
    </>
  )
}
