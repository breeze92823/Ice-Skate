// Treadmill prop instances and shared geometry — read by
// components/TreadmillProp.jsx / TreadmillLabel.jsx (via Treadmills.jsx),
// systems/treadmillAnim.js (belt-scroll occupancy) and
// systems/treadmillCollision.js (solid rails + climbable deck), so every
// consumer works off the same numbers instead of separately copied sets
// drifting apart. Only the structural dimensions that collision cares about
// live here — purely decorative bits (console arms, handlebar, display)
// stay local consts in the component itself, same as any other prop in
// this game.
import { TREADMILL_POSITION, TREADMILL_ROTATION_Y } from './hub.js'

const BASE_BELT_SPEED = 2.4 // m/s the belt scrolls at 1x speed — scales with each instance's own `speed`

// Fraction of full running speed PlayerAvatar.jsx's gait plays at while the
// player is standing on an occupied deck — so standing still on a running
// belt still reads as walking, the way stepping onto a real treadmill does,
// instead of the avatar idling in place while the belt scrolls under it.
export const TREADMILL_WALK_ANIM_SPEED = 0.6

// Household unit: flush deck, raised side rails — one shared shape for
// every instance below; only placement, material colors, speed and label
// color vary per treadmill.
export const TREADMILL_SHAPE = {
  deckWidth: 2.2,
  deckDepth: 5.2,
  beltHeight: 0.32,
  railThick: 0.18,
  railTopY: 0.32 + 0.16, // rails stand this far proud of the belt surface
}

// Clear gap between adjacent decks (rail outer face to rail outer face) in
// the row, regardless of either one's own `scale`.
const ROW_GAP = 2.4
// Half the unrotated unit's own outer width (center to a rail's outer
// face), at scale 1 — multiply by an instance's own `scale` to get its
// actual half-width.
const UNIT_HALF_WIDTH = TREADMILL_SHAPE.deckWidth / 2 + TREADMILL_SHAPE.railThick

// Lays instances out left-to-right along the row's own local +X axis (same
// local->world rotation systems/treadmillCollision.js's localToWorld uses,
// so the row reads as "to the right of the first one" regardless of which
// way TREADMILL_ROTATION_Y itself faces it), spacing each pair by their own
// actual (scaled) half-widths plus ROW_GAP — so a bigger instance doesn't
// crowd its neighbors the way a single fixed spacing would once instances
// stop being the same size.
function layoutRow(position, rotationY, instances) {
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  let d = 0
  return instances.map((instance, i) => {
    if (i > 0) {
      const prev = instances[i - 1]
      d += UNIT_HALF_WIDTH * prev.scale + ROW_GAP + UNIT_HALF_WIDTH * instance.scale
    }
    return [position[0] + d * cos, position[1], position[2] - d * sin]
  })
}

// One row of treadmills, each faster (and its own frame/arm material, label
// color and size) than the last, running to the right of the first. Add
// another entry here to extend the row — position, deck size and belt
// speed are all derived below; only `speed`, `scale`, the material colors
// and `labelColor` need setting by hand. `scale` uniformly resizes that
// instance's whole prop (TreadmillProp.jsx's outer <group scale>) — deck
// footprint (below) and collision (systems/treadmillCollision.js) both
// scale with it too, so a bigger deck is still standable/collidable at its
// drawn size, not just visually bigger.
// `rebirthRequired` gates the deck itself (systems/treadmillAnim.js's
// isOnDeck check) — below that many rebirths (store's `rebirth`), stepping on
// the deck doesn't register as occupied at all, so the belt doesn't scroll,
// PlayerAvatar.jsx's forced walk gait doesn't kick in, and speedGain.js's
// treadmill-counts-as-walking gain never fires. TreadmillLabel.jsx reads it
// to show "Required Rebirth N" in place of the normal speed caption.
const INSTANCES = [
  { name: 'Treadmill1', speed: 1, scale: 1, rebirthRequired: 0, frameLight: '#7b8492', frameDark: '#535b68', armColor: '#2f333b', labelColor: '#ffd21e' },
  { name: 'Treadmill2', speed: 2, scale: 1.5, rebirthRequired: 2, frameLight: '#7ba686', frameDark: '#4a6b53', armColor: '#22331f', labelColor: '#6be36a' },
  { name: 'Treadmill3', speed: 3, scale: 2, rebirthRequired: 3, frameLight: '#a67b7f', frameDark: '#6b4850', armColor: '#331f22', labelColor: '#ff5f6d' },
]

const ROW_POSITIONS = layoutRow(TREADMILL_POSITION, TREADMILL_ROTATION_Y, INSTANCES)

export const TREADMILLS = INSTANCES.map((instance, i) => ({
  ...instance,
  position: ROW_POSITIONS[i],
  rotationY: TREADMILL_ROTATION_Y,
  deckWidth: TREADMILL_SHAPE.deckWidth * instance.scale,
  deckDepth: TREADMILL_SHAPE.deckDepth * instance.scale,
  beltSpeed: BASE_BELT_SPEED * instance.speed,
}))
