import { useGameStore } from '../store/useGameStore.js'
import { HEX_SPEED_PAD_TIERS } from '../data/hexPowerPad.js'
import { ICE_SKATE_PAIR_GAP, ICE_SKATE_LEG_FIT } from '../data/iceSkate.js'
import { SingleSkate } from './IceSkateShoes.jsx'

// Renders the currently equipped skate (store's equippedHexPad — same tier
// SkateRackItem.jsx shows sitting on the bench), tinted per-tier via
// beamColor: same SingleSkate building block, just worn instead of
// displayed.
function useEquippedBootColor() {
  const index = useGameStore((s) => s.equippedHexPad)
  return HEX_SPEED_PAD_TIERS[index]?.beamColor ?? null
}

// Capsule-fallback pair: with no Bloxity rig loaded there are no LegL1/LegR1
// bones to group with, so both skates sit under the player's own root at a
// fixed stance-width offset instead. Player.jsx only mounts this while
// hasAvatar is false — once the rig loads, PlayerAvatar.jsx groups each
// skate with its own leg bone instead (see EquippedLegSkate below), so it
// swings with the gait like a real shoe rather than floating in place.
export default function EquippedSkates() {
  const bootColor = useEquippedBootColor()
  if (!bootColor) return null

  return (
    <group>
      <SingleSkate x={ICE_SKATE_PAIR_GAP / 2} bootColor={bootColor} />
      <SingleSkate x={-ICE_SKATE_PAIR_GAP / 2} bootColor={bootColor} />
    </group>
  )
}

// One skate, meant to be createPortal'd straight into a LegL1/LegR1 bone
// (PlayerAvatar.jsx) so it's a real child of that bone in the scene graph —
// it inherits the leg's own gait rotation every frame for free, instead of
// a separate component trying to re-derive the swing. `y`, `quat` and
// `scale` come from avatarModel.js's legFootTransform: `y` is the bone-local
// offset down to that leg's sole, `quat` cancels the bone's own
// (non-identity) bind rotation so the skate sits right-side up and
// forward-facing, and `scale` cancels the rig's own authored-unit-to-metre
// shrink so the skate matches its real-world size while still growing or
// shrinking with the leg's own scale (avatar height proportion).
export function EquippedLegSkate({ y, quat, scale, side }) {
  const bootColor = useEquippedBootColor()
  if (!bootColor) return null

  const fit = ICE_SKATE_LEG_FIT[side] ?? { x: 0, y: 0, z: 0 }

  return (
    <group position-y={y} quaternion={quat} scale={scale}>
      {/* Manual per-leg fit nudge, in the shoe's own already-corrected
          upright frame — see ICE_SKATE_LEG_FIT (data/iceSkate.js). */}
      <group position={[fit.x, fit.y, fit.z]}>
        <SingleSkate bootColor={bootColor} />
      </group>
    </group>
  )
}
