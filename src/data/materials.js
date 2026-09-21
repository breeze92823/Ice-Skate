// PBR roughness/metalness convention, by surface type. roughness: 0 =
// mirror-smooth, 1 = fully matte. metalness: 0 = dielectric, 1 = metal.
export const MATERIAL_PBR = {
  GROUND: { roughness: 0.9, metalness: 0 },
  FLAT_PLACEHOLDER: { roughness: 0.8, metalness: 0 }, // player fallback capsule
  AVATAR_DEFAULT: { roughness: 0.7, metalness: 0 }, // fallback when a source glTF material carries no roughness/metalness
}
