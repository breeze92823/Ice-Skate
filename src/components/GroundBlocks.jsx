import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GroundBlock } from './Ground.jsx'
import { GROUND_BLOCKS } from '../data/groundBlocks.js'
import { groundPhase } from '../systems/groundPhase.js'

// Solid ground-block props imported from Blender's "GroundBlock" collection
// — each stands in for a duplicated Ground object, at its own imported
// transform, rendered with the exact same stud-textured material as the
// main island (GroundBlock, from Ground.jsx) rather than anything brought
// over from Blender (see feedback-blender-material-ownership memory).
// `customMesh` entries (e.g. Slope_Block, a genuinely custom shape rather
// than a duplicate of Ground) are collision-only here — SlopeBlock.jsx
// renders those with their own real geometry, mounted separately in App.jsx.

// Ground.026's own looping solid/fade/hidden cycle (`phasing: true` in
// groundBlocks.js, timed by systems/groundPhase.js) needs its material
// opacity and mesh visibility mutated every frame — GroundBlock's own
// materials are memoized once and never touched again, so this wrapper
// grabs refs to the rendered object/materials via GroundBlock's
// objectRef/materialsRef props and drives them from the shared groundPhase
// singleton each frame (same convention as Hammer.jsx reading the
// hammerAnim singleton). Collision itself is skipped elsewhere, in
// playerMovement.js, by reading the same singleton.
function PhasingGroundBlock({ position, size: [width, thickness, depth], rotationX = 0, rotationY = 0, light, dark }) {
  const objectRef = useRef()
  const materialsRef = useRef({})

  useFrame(() => {
    const obj = objectRef.current
    const { top, side } = materialsRef.current
    if (!obj || !top || !side) return
    const { opacity } = groundPhase
    obj.visible = opacity > 0
    top.opacity = opacity
    side.opacity = opacity
  })

  return (
    <GroundBlock
      objectRef={objectRef}
      materialsRef={materialsRef}
      transparent
      width={width}
      thickness={thickness}
      depth={depth}
      position={position}
      rotation={[rotationX, rotationY, 0]}
      light={light}
      dark={dark}
    />
  )
}

export default function GroundBlocks() {
  return (
    <>
      {GROUND_BLOCKS.filter((b) => !b.customMesh).map((block) => {
        const { name, position, size, rotationX = 0, rotationY = 0, light, dark, phasing } = block
        if (phasing) {
          return (
            <PhasingGroundBlock
              key={name}
              position={position}
              size={size}
              rotationX={rotationX}
              rotationY={rotationY}
              light={light}
              dark={dark}
            />
          )
        }
        const [width, thickness, depth] = size
        return (
          <GroundBlock
            key={name}
            width={width}
            thickness={thickness}
            depth={depth}
            position={position}
            rotation={[rotationX, rotationY, 0]}
            light={light}
            dark={dark}
          />
        )
      })}
    </>
  )
}
