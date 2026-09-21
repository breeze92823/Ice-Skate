import { useEffect, useMemo } from 'react'
import { MATERIAL_PBR } from '../data/materials.js'
import { makeStudTexture } from '../systems/studTexture.js'

// Ground plane — a green studded (LEGO/Bloxity-style) floor authored in code,
// drawn to a CanvasTexture so it costs nothing to download and stays one draw
// call on a MeshStandardMaterial.
const GROUND_WIDTH = 120
const GROUND_DEPTH = 120
const CELL = 2 // metres per checker cell
const STUDS_PER_CELL = 4 // studs per cell, each stud on a CELL/STUDS_PER_CELL = 0.5m pitch
const DARK = '#3a4049'
const LIGHT = '#525a68'

function makeGroundTexture() {
  return makeStudTexture({
    light: LIGHT,
    dark: DARK,
    studsPerCell: STUDS_PER_CELL,
    repeatX: GROUND_WIDTH / (CELL * 2),
    repeatY: GROUND_DEPTH / (CELL * 2),
  })
}

export default function Ground() {
  const texture = useMemo(makeGroundTexture, [])
  // three.js does not GC GPU memory.
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[GROUND_WIDTH, GROUND_DEPTH]} />
      <meshStandardMaterial map={texture} {...MATERIAL_PBR.GROUND} />
    </mesh>
  )
}
