// PBR roughness/metalness convention, by surface type. roughness: 0 =
// mirror-smooth, 1 = fully matte. metalness: 0 = dielectric, 1 = metal.
export const MATERIAL_PBR = {
  GROUND: { roughness: 0.9, metalness: 0 },
  WATER: { roughness: 0.15, metalness: 0 }, // glossy surface, still a dielectric

  FLAT_PLACEHOLDER: { roughness: 0.8, metalness: 0 }, // player fallback capsule
  AVATAR_DEFAULT: { roughness: 0.7, metalness: 0 }, // fallback when a source glTF material carries no roughness/metalness
  TREADMILL_FRAME: { roughness: 0.75, metalness: 0.15 }, // studded stone/steel frame
  TREADMILL_BELT: { roughness: 0.95, metalness: 0 }, // grooved rubber deck
  TREADMILL_SCREEN_BEZEL: { roughness: 0.6, metalness: 0.3 },
  TREADMILL_SCREEN_FACE: { roughness: 0.35, metalness: 0 },
  GIANT_BALL: { roughness: 0.4, metalness: 0.05 }, // smooth-ish plastic/rubber sphere
  SIDE_WALL: { roughness: 0.9, metalness: 0 }, // Stage1 boundary guard walls — tune independently of GROUND
  STAGE_WALL: { roughness: 0.05, metalness: 0 }, // ~80% transparent glass stage dividers — smooth/glossy dielectric
  SKATE_RACK_RISER: { roughness: 0.75, metalness: 0.15 }, // two-tier bench frame, same finish as TREADMILL_FRAME
  SKATE_RACK_PAD: { roughness: 0.5, metalness: 0 }, // glossy rubber/plastic pickup pad
  SKATE_RACK_SIGN_BEZEL: { roughness: 0.6, metalness: 0.3 },
  SKATE_RACK_SIGN_FACE: { roughness: 0.35, metalness: 0 },
  LEADERBOARD_BOARD: { roughness: 0.5, metalness: 0.1 }, // dark scoreboard backing, faint gloss like a monitor bezel
  LEADERBOARD_FACE: { roughness: 0.35, metalness: 0.05 }, // inset screen-like panel the rows sit on
  LEADERBOARD_TRIM: { roughness: 0.55, metalness: 0.05 }, // red plastic crown/frame trim
  LEADERBOARD_STAND: { roughness: 0.7, metalness: 0.2 }, // support foot + post
  ICE_SKATE_BOOT: { roughness: 0.6, metalness: 0.05 }, // leather/synthetic boot upper
  ICE_SKATE_SOLE: { roughness: 0.85, metalness: 0 }, // rubber/plastic sole plate
  ICE_SKATE_BLADE: { roughness: 0.2, metalness: 0.9 }, // polished steel blade
  ICE_SKATE_LACE: { roughness: 0.75, metalness: 0 },
}
