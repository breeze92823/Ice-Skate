import { useEffect, useMemo } from 'react'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeRoadTexture } from '../systems/roadTexture.js'
import {
  ROAD_WIDTH,
  ROAD_LENGTH,
  ROAD_Y_OFFSET,
  ROAD_CELL,
  ROAD_COLOR,
  ROAD_COLOR_DARK,
  ROAD_CURB_LIGHT,
  ROAD_CURB_DARK,
  ROAD_CURB_WIDTH,
} from '../data/road.js'
import { GROUND_Y } from '../data/hub.js'

// Orange tread-plate road strip laid over Ground.jsx's floor, running the
// length of the ground plane through the spawn point. Same technique as
// Ground.jsx's own checker floor: a canvas-baked tile texture on a
// MeshStandardMaterial, one draw call.
export default function Road() {
  const texture = useMemo(
    () =>
      makeRoadTexture({
        width: ROAD_WIDTH,
        length: ROAD_LENGTH,
        cell: ROAD_CELL,
        color: ROAD_COLOR,
        colorDark: ROAD_COLOR_DARK,
        curbLight: ROAD_CURB_LIGHT,
        curbDark: ROAD_CURB_DARK,
        curbWidth: ROAD_CURB_WIDTH,
      }),
    [],
  )
  // three.js does not GC GPU memory.
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0, GROUND_Y + ROAD_Y_OFFSET, 0]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
      <meshStandardMaterial map={texture} {...MATERIAL_PBR.GROUND} />
    </mesh>
  )
}
