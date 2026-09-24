import SkateRackRisers from './SkateRackRisers.jsx'
import SkateRackRamps from './SkateRackRamps.jsx'
import SkateRackItem from './SkateRackItem.jsx'
import SkateRackLabel from './SkateRackLabel.jsx'
import SkateRackSign from './SkateRackSign.jsx'
import { SKATE_RACK_POSITION, SKATE_RACK_ROTATION_Y, SKATE_RACK_SCALE, SKATE_RACK_TIERS, SKATE_RACK_SHAPE, skateRackColX, skateRackRowTopY, skateRackRowZ } from '../data/skateRack.js'

// "Ice Skates" shop display next to the treadmill row — a two-tier bench
// (5 pads on a low front shelf, 5 more on a taller back shelf) topped with a
// header sign, each pad with a floating caption. Same aggregator pattern as
// Treadmills.jsx mapping data/treadmill.js's TREADMILLS. Solid collision +
// the climbable ramps/deck live in systems/skateRackCollision.js, wired into
// playerMovement.js's step() the same way treadmillCollision.js's are — not
// rendered here, since none of it depends on JSX. Buy/equip (proximity +
// hold-E, wins currency) is the same hex-speed-pad system Laser-Escape uses
// for its laser tiers — see data/hexPowerPad.js and systems/hexPowerPad.js;
// each tier's `index` here is its index into that system's tier/position
// arrays and into the store's ownedHexPads/equippedHexPad.
export default function SkateRack() {
  return (
    <group position={SKATE_RACK_POSITION} rotation-y={SKATE_RACK_ROTATION_Y} scale={SKATE_RACK_SCALE}>
      <SkateRackRisers />
      <SkateRackRamps />
      {SKATE_RACK_TIERS.map((tier) => (
        <SkateRackItem
          key={tier.name}
          index={tier.index}
          row={tier.row}
          col={tier.col}
          itemColor={tier.itemColor}
          glow={tier.glow}
        />
      ))}
      {SKATE_RACK_TIERS.map((tier) => (
        <SkateRackLabel
          key={tier.name}
          index={tier.index}
          position={[skateRackColX(tier.col), skateRackRowTopY(tier.row) + SKATE_RACK_SHAPE.padHeight, skateRackRowZ(tier.row)]}
          speed={tier.speed}
          winsRequired={tier.winsRequired}
        />
      ))}
      <SkateRackSign />
    </group>
  )
}
