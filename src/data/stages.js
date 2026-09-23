// Which GROUND_BLOCKS entry starts each stage — the user's own mental model
// of the level layout (see project-stage-layout memory), not something
// encoded elsewhere in the data. Spawn is derived from that block's own
// position/size (center x/z, top surface y) rather than duplicated as raw
// numbers, so it stays correct if the block ever moves in groundBlocks.js.
import { GROUND_BLOCKS } from './groundBlocks.js'

function blockSpawn(name) {
  const block = GROUND_BLOCKS.find((b) => b.name === name)
  const [x, y, z] = block.position
  const [, thickness] = block.size
  return { x, y: y + thickness / 2, z }
}

// winsCost is charged every time (components/hud/TeleportPanel.jsx's "Pay
// with Wins" button, store's spendWins) — there's no owned/unlocked state
// per stage. Cost ramps x5 per 5-stage block (30 for 1-5, 150 for 6-10, 750
// for 11-13, ...) rather than per individual stage, confirmed against
// Stage 05 = 30 / Stage 10 = 150.
//
// rebirthRequired gates the teleport itself (not just the wins cost) for
// every stage past 5 — the store's `rebirth` count (data/progression.js)
// must be at least this. Ramps +3 per stage (Stage 06 = 3, 07 = 6, 08 = 9)
// then caps at 10 from Stage 09 on, on request. Stages 1-5 stay
// unrestricted (0 = no gate).
export const STAGES = [
  { id: 1, label: 'Stage 01', spawn: blockSpawn('Ground.001'), winsCost: 30, rebirthRequired: 0 },
  { id: 2, label: 'Stage 02', spawn: blockSpawn('Ground.009'), winsCost: 30, rebirthRequired: 0 },
  { id: 3, label: 'Stage 03', spawn: blockSpawn('Ground.013'), winsCost: 30, rebirthRequired: 0 },
  { id: 4, label: 'Stage 04', spawn: blockSpawn('Ground.015'), winsCost: 30, rebirthRequired: 0 },
  { id: 5, label: 'Stage 05', spawn: blockSpawn('Ground.024'), winsCost: 30, rebirthRequired: 0 },
  { id: 6, label: 'Stage 06', spawn: blockSpawn('Ground.028'), winsCost: 150, rebirthRequired: 3 },
  { id: 7, label: 'Stage 07', spawn: blockSpawn('Ground.042'), winsCost: 150, rebirthRequired: 6 },
  // Stages 8-13 added 2026-09-23 alongside the GroundBlock.007-.012 sync;
  // spawn blocks confirmed by the user the same day (see
  // project-stage-layout memory).
  { id: 8, label: 'Stage 08', spawn: blockSpawn('Ground.046'), winsCost: 150, rebirthRequired: 9 },
  { id: 9, label: 'Stage 09', spawn: blockSpawn('Ground.049'), winsCost: 150, rebirthRequired: 10 },
  { id: 10, label: 'Stage 10', spawn: blockSpawn('Ground.052'), winsCost: 150, rebirthRequired: 10 },
  { id: 11, label: 'Stage 11', spawn: blockSpawn('Ground.055'), winsCost: 750, rebirthRequired: 10 },
  { id: 12, label: 'Stage 12', spawn: blockSpawn('Ground.056'), winsCost: 750, rebirthRequired: 10 },
  { id: 13, label: 'Stage 13', spawn: blockSpawn('Ground.059'), winsCost: 750, rebirthRequired: 10 },
]
