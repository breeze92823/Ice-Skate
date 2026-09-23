import TreadmillProp from './TreadmillProp.jsx'
import TreadmillLabel from './TreadmillLabel.jsx'
import { TREADMILLS } from '../data/treadmill.js'

// A row of treadmills (data/treadmill.js), each its own material colors,
// belt speed and floating "X{speed} Speed" label — mapped from TREADMILLS
// so adding another instance there needs no changes here, same pattern as
// GlowFloorPanels.jsx.
export default function Treadmills() {
  return (
    <>
      {TREADMILLS.map((t) => (
        <TreadmillProp
          key={t.name}
          name={t.name}
          position={t.position}
          rotationY={t.rotationY}
          scale={t.scale}
          frameLight={t.frameLight}
          frameDark={t.frameDark}
          armColor={t.armColor}
        />
      ))}
      {TREADMILLS.map((t) => (
        <TreadmillLabel key={t.name} position={t.position} value={t.speed} color={t.labelColor} />
      ))}
    </>
  )
}
