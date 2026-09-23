# Ice-Skate — Project Guide

Three.js + `@react-three/fiber` game, with `@react-three/drei` available as a
helper library. Pin/install drei at the `^9` line, not `^10` — this project is
on `@react-three/fiber@^8`, and drei v10 requires fiber v9.

This project is styled after the sibling project `C:\ThreeJS\Laser-Escape`.
When a convention here doesn't cover a new case, check how Laser-Escape solved
it (`Tech.md`, `src/data/materials.js`, `src/systems/*Model.js`) before
inventing a new pattern. Drei is available now, so Laser-Escape's baked
`<Environment resolution={64} frames={1}>` + `<Lightformer>` fill-light trick
is fair game if a scene needs extra specular/reflection fill — but don't reach
for it by default; the two-light setup below is still the baseline for every
new prop/scene. Still skip Laser-Escape features this project hasn't opted
into otherwise (quality tiers, DRACO/KTX2 loaders) unless asked.

Extending the guard-wall/roof corridor between two `StageWall.NNN` panels
(e.g. "do the same from StageWall.005 to StageWall.006")? Follow
[GuardWallContainers.md](GuardWallContainers.md) — it's the playbook for
that pattern, including the mistakes already made and fixed once.

## Lighting

Exactly two lights, always:

```jsx
<hemisphereLight args={['#eaf3ff', '#b7a98f', 1.1]} />
<directionalLight
  position={[30, 45, 20]}
  intensity={2.3}
  castShadow
  shadow-mapSize={[2048, 2048]}
  shadow-camera-left={-45}
  shadow-camera-right={45}
  shadow-camera-top={45}
  shadow-camera-bottom={-45}
  shadow-camera-near={1}
  shadow-camera-far={160}
  shadow-bias={-0.0004}
  shadow-normalBias={0.04}
/>
```

- **Hemisphere light** (`sky, ground, intensity`) is the only fill/ambient
  light. Don't add `AmbientLight` on top of it — it makes shading flatten.
- **One directional key light** casts all shadows. Don't add a second shadow
  caster; extra shadow-casting lights multiply draw calls per shadow-casting
  mesh.
- Shadow camera frustum is a tight ±45-unit box, not "cover the whole level."
  If the play area grows past that, move/recenter the light (e.g. follow the
  player, like Laser-Escape's `ShadowSun`) rather than widening the frustum —
  a wider frustum at the same 2048² map loses shadow resolution.
- `castShadow`/`receiveShadow` are set per-mesh deliberately, not blanket:
  - Solid opaque props: both `true`.
  - Thin/transparent panels (screen face, glass): `castShadow=false` so they
    don't throw a hard rectangular shadow.
  - Ground/road/belt planes: `receiveShadow` only, no `castShadow`.
- No postprocessing/bloom. If something needs to glow, fake it with an
  emissive-looking `MeshBasicMaterial` shape, not a bloom pass.

## Materials

Two material types only:

- **`MeshStandardMaterial`** for every lit surface (props, ground, road,
  avatar, GLTF props).
- **`MeshBasicMaterial`** for unlit glow/HUD/decal elements only.

Never `MeshLambertMaterial`, `MeshPhongMaterial`, or `MeshPhysicalMaterial`.

Roughness/metalness never gets typed inline at the call site — it comes from
the shared lookup table in [src/data/materials.js](src/data/materials.js):

```js
export const MATERIAL_PBR = {
  GROUND: { roughness: 0.9, metalness: 0 },
  FLAT_PLACEHOLDER: { roughness: 0.8, metalness: 0 },
  AVATAR_DEFAULT: { roughness: 0.7, metalness: 0 },
  TREADMILL_FRAME: { roughness: 0.75, metalness: 0.15 },
  TREADMILL_BELT: { roughness: 0.95, metalness: 0 },
  TREADMILL_SCREEN_BEZEL: { roughness: 0.6, metalness: 0.3 },
  TREADMILL_SCREEN_FACE: { roughness: 0.35, metalness: 0 },
}
```

- Adding a new prop type means adding one entry to `MATERIAL_PBR`, then
  spreading it: `<meshStandardMaterial map={tex} {...MATERIAL_PBR.KEY} />`.
- Roughness guide: 0 = mirror-smooth, 1 = fully matte. Metalness: 0 =
  dielectric (wood/plastic/rubber/stone), 1 = bare metal. Most props sit at
  metalness 0–0.15; only intentionally metallic trim goes higher.
- Textures are procedurally baked to a `CanvasTexture` at prop-build time
  (`systems/studTexture.js`, `beltTexture.js`, `roadTexture.js`), not loaded
  from image files. One texture per prop = one draw call. Always set
  `texture.colorSpace = SRGBColorSpace` on anything feeding `map` (color
  data); leave it unset (`NoColorSpace`) for HUD/UI canvases that aren't color
  data.
- `useEffect` cleanup must `.dispose()` every texture/geometry/material this
  component created — three.js does not GC GPU memory. Follow the pattern in
  [src/components/Ground.jsx](src/components/Ground.jsx) and
  [src/components/Treadmill.jsx](src/components/Treadmill.jsx).
- GLTF props (like `PowerPodium`) keep their source materials as authored;
  only swap a named material out (e.g. wood → shared ground material) when
  there's a specific visual reason, and dispose the material/map you replace.

## Geometry & polygon budget

**Target: under ~500 triangles per prop.** No subdivision, no smooth-shading
modifiers, no n-gons. A whole scene should stay in the low tens of thousands
of triangles, not hundreds of thousands — this is a stylized low-poly game,
not a realism showcase.

Segment counts, keep deliberately low and match existing call sites instead of
using library defaults:

| Primitive | Convention here | Notes |
|---|---|---|
| `boxGeometry` | no segment args (1×1×1 default) | Every frame/wall/step/pillar in `Treadmill.jsx` is a bare box. Never add `widthSegments`/etc. to a box unless it needs to deform. |
| `planeGeometry` | no segment args | Ground/road/belt/screen faces. |
| `capsuleGeometry` | `[radius, length, 4, 12]` | Player fallback capsule (`Player.jsx`) — 4 cap segments, 12 radial. Reuse this exact segment pair for any humanoid placeholder. |
| `cylinderGeometry` | 6–16 radial segments depending on how prominent the round silhouette is | Don't reach for 32 by default. |
| `sphereGeometry` | 8×8 for small/incidental spheres; higher only if the sphere is a hero object | |
| `circleGeometry` | 32–48 segments | Only for flat decals/rings meant to read as perfectly round (glow rings, targets) — this is the one place high segment counts are fine, since it's a single flat disc, not a 3D volume. |

- Prefer building props out of a handful of boxes/planes (Bloxity/LEGO-block
  look) over importing a dense mesh. `Treadmill.jsx` is the reference: every
  part is a box, textured with a shared studded `CanvasTexture`.
- If a prop must be a GLTF/GLB (borrowed model, organic shape), keep it
  small and single-purpose per file, not a giant merged scene. Trim unwanted
  geometry from a loaded mesh in code when possible (see `PowerPodium.jsx`'s
  `clipAboveHeight`) rather than re-authoring/re-exporting for a one-off tweak.
- Repeated identical props → instance them (`InstancedMesh`) instead of
  mounting N separate meshes, once there's a case with more than a handful of
  repeats.

## Renderer / color pipeline

Don't change these without a specific reason — they're what makes materials
and lighting above look right:

```jsx
<Canvas
  shadows={{ type: PCFSoftShadowMap }}
  gl={{
    antialias: true,
    powerPreference: 'high-performance',
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    outputColorSpace: SRGBColorSpace,
  }}
  camera={{ fov: 55, near: 0.1, far: 200, position: [0, 6, 12] }}
>
```

- Tone mapping is always ACES Filmic at exposure `1.2`. If a material/light
  looks "too flat" or "too washed out," fix its roughness/metalness/intensity
  — don't change global exposure to compensate for one prop.
- Shadow type is `PCFSoftShadowMap`.
- Color-manage every texture (`SRGBColorSpace` on color maps) rather than
  correcting for it with tone-mapping/exposure tweaks.

## Performance discipline

- No allocations inside `useFrame` — hoist scratch `Vector3`/`Quaternion`
  objects to module scope (see `_up`, `_targetQuat` in `Player.jsx`) and
  mutate them in place.
- Data (positions, dimensions, colors) lives in `src/data/*.js`, not hardcoded
  in components — follow `data/hub.js`, `data/materials.js`, `data/road.js`,
  `data/podium.js` as the pattern for any new prop.
