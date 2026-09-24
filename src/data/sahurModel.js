// Standalone rigged NPC prop — public/models/sahur_3d.glb (492 tris, 72-joint
// Mixamo rig, single "Armature|Walk" clip, decimated to fit CLAUDE.md's
// ~500-tri/prop budget from a 6,162-tri source). Two instances patrol two
// ground blocks not currently claimed by any STAGES entry (see
// data/stages.js): Ground.010 and Ground.057. Each spawn is derived from its
// own block's position/size (top surface, center x/z) the same way
// stages.js's blockSpawn does, so it stays correct if either block ever
// moves in groundBlocks.js. Ground.057 sits yawed (rotationY -90deg) but its
// center point doesn't depend on that rotation — only
// systems/sahurFollow.js's chase-footprint math needs to account for it.
import { GROUND_BLOCKS } from './groundBlocks.js'

function homeOn(groundName) {
  const block = GROUND_BLOCKS.find((b) => b.name === groundName)
  const [x, y, z] = block.position
  const [, thickness] = block.size
  return [x, y + thickness / 2, z]
}

// Shared render/collision tuning — same rig for every Sahur instance, so
// systems/sahurCrush.js's collision size (radius/height * scale) can't drift
// between instances. `speed` (chase m/s, systems/sahurFollow.js) is per-model
// rather than shared, so an instance can be tuned faster/slower on its own.
const SAHUR_RIG = {
  rotationY: 0,
  scale: 6,
  // Approximate unscaled (source-model) body radius/standing height, from
  // the rig's own bind-pose bone offsets (see chat history: Hips sits
  // ~0.89m up, HeadTop_End ~1.78m up — a roughly human-sized rig).
  baseRadius: 0.35,
  baseHeight: 1.8,
  speed: 5,
}

export const SAHUR_MODEL = {
  ...SAHUR_RIG,
  position: homeOn('Ground.010'),
}

export const SAHUR_MODEL_057 = {
  ...SAHUR_RIG,
  position: homeOn('Ground.057'),
  // Distinguishes this instance from Ground.010's default-textured one —
  // the model's own baseColorTexture has no baked-in flat color (its
  // baseColorFactor is white), so a MeshStandardMaterial.color tint
  // multiplies cleanly over the existing texture (components/Sahur.jsx).
  tint: '#ff2323',
  // Chases faster than Ground.010's default (SAHUR_RIG.speed above).
  speed: 20,
}
