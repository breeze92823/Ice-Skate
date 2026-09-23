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

export const STAGES = [
  { id: 1, label: 'Stage 01', spawn: blockSpawn('Ground.001') },
  { id: 2, label: 'Stage 02', spawn: blockSpawn('Ground.009') },
  { id: 3, label: 'Stage 03', spawn: blockSpawn('Ground.013') },
  { id: 4, label: 'Stage 04', spawn: blockSpawn('Ground.015') },
  { id: 5, label: 'Stage 05', spawn: blockSpawn('Ground.024') },
  { id: 6, label: 'Stage 06', spawn: blockSpawn('Ground.028') },
  { id: 7, label: 'Stage 07', spawn: blockSpawn('Ground.042') },
  // Stages 8-13 added 2026-09-23 alongside the GroundBlock.007-.012 sync;
  // spawn blocks confirmed by the user the same day (see
  // project-stage-layout memory).
  { id: 8, label: 'Stage 08', spawn: blockSpawn('Ground.046') },
  { id: 9, label: 'Stage 09', spawn: blockSpawn('Ground.049') },
  { id: 10, label: 'Stage 10', spawn: blockSpawn('Ground.052') },
  { id: 11, label: 'Stage 11', spawn: blockSpawn('Ground.055') },
  { id: 12, label: 'Stage 12', spawn: blockSpawn('Ground.056') },
  { id: 13, label: 'Stage 13', spawn: blockSpawn('Ground.059') },
]
