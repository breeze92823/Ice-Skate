import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { SKATE_RACK_SIGN, skateRackRowTopY, skateRackRowZ, SKATE_RACK_SHAPE } from '../data/skateRack.js'

// Header board behind/above the back row, facing +Z toward the approaching
// player — same "front" convention as TreadmillProp's console screen (faces
// +Z, back toward the runner).
const { width: SIGN_W, height: SIGN_H, thick: SIGN_THICK, clearance: CLEARANCE } = SKATE_RACK_SIGN

export default function SkateRackSign() {
  const backTopY = skateRackRowTopY(1)
  const backZ = skateRackRowZ(1)
  const z = backZ - SKATE_RACK_SHAPE.rowDepth / 2 - SIGN_THICK / 2 - 0.3
  const y = backTopY + CLEARANCE + SIGN_H / 2

  return (
    <group position={[0, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[SIGN_W, SIGN_H, SIGN_THICK]} />
        <meshStandardMaterial color="#23262c" {...MATERIAL_PBR.SKATE_RACK_SIGN_BEZEL} />
      </mesh>
      {/* Faces +Z, back toward the approaching player. */}
      <mesh position={[0, 0, SIGN_THICK / 2 + 0.005]} castShadow={false}>
        <planeGeometry args={[SIGN_W * 0.92, SIGN_H * 0.8]} />
        <meshStandardMaterial color="#2fb6e8" {...MATERIAL_PBR.SKATE_RACK_SIGN_FACE} />
      </mesh>
      <Text
        position={[0, 0, SIGN_THICK / 2 + 0.02]}
        fontSize={0.46}
        fontWeight="bold"
        letterSpacing={0.02}
        color="#ffffff"
        outlineWidth={0.025}
        outlineColor="#0a4a63"
        anchorX="center"
        anchorY="middle"
      >
        ICE SKATES
      </Text>
    </group>
  )
}
