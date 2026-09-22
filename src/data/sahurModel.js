// Standalone rigged NPC prop — public/models/sahur_3d.glb (492 tris, 72-joint
// Mixamo rig, single "Armature|Walk" clip, decimated to fit CLAUDE.md's
// ~500-tri/prop budget from a 6,162-tri source). Placed on Ground.010, which
// isn't currently claimed by any STAGES entry (see data/stages.js). Spawn is
// derived from that block's own position/size (top surface, center x/z) the
// same way stages.js's blockSpawn does, so it stays correct if the block
// ever moves in groundBlocks.js.
import { GROUND_BLOCKS } from './groundBlocks.js'

const GROUND = GROUND_BLOCKS.find((b) => b.name === 'Ground.010')
const [x, y, z] = GROUND.position
const [, thickness] = GROUND.size

export const SAHUR_MODEL = {
  position: [x, y + thickness / 2, z],
  rotationY: 0,
  // Render scale — also the single source of truth for systems/sahurCrush.js's
  // collision size below, so the two can't drift apart.
  scale: 6,
  // Approximate unscaled (source-model) body radius/standing height, from
  // the rig's own bind-pose bone offsets (see chat history: Hips sits
  // ~0.89m up, HeadTop_End ~1.78m up — a roughly human-sized rig).
  baseRadius: 0.35,
  baseHeight: 1.8,
}
