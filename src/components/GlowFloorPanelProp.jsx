import * as THREE from 'three'
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  GLOW_FLOOR_PANEL_MODEL_URL,
  GLOW_FLOOR_PANEL_TOP_Y,
  GLOW_FLOOR_PANEL_SCALE,
} from '../data/glowFloorPanel.js'

// Fade midpoint: the material is fully transparent at the mesh's top face
// (y = GLOW_FLOOR_PANEL_TOP_Y) and fully opaque from the mesh's vertical
// midpoint down to its base (y = 0) — so the panel reads as a glow that
// dissolves away toward its top edge. Ported from Laser-Escape's
// GlowFloorPanelProp.jsx.
const FADE_MID_Y = GLOW_FLOOR_PANEL_TOP_Y / 2
const FADE_RANGE = GLOW_FLOOR_PANEL_TOP_Y - FADE_MID_Y // == FADE_MID_Y

const GLOW_COLOR = new THREE.Color('#ffc400') // saturated gold-yellow

// Turns the glTF-authored MeshStandardMaterial into a flat, saturated glow —
// its map/emissiveMap are dropped in favor of a solid emissive yellow, then a
// vertical (local-space y) alpha gradient is injected into the shader:
// transparent at the top face, ramping to opaque by FADE_MID_Y and staying
// opaque down to the base. Roughness/metalness are left as authored (glow
// look comes entirely from color/emissive/alpha, not the PBR terms, so there
// is no MATERIAL_PBR entry to add). Applied once to the shared material — all
// placed instances reuse the same material object from useGLTF's cache — so
// this is guarded against a later instance's mount redoing it.
function applyGlowGradient(material) {
  if (material.userData.glowGradientApplied) return
  material.userData.glowGradientApplied = true

  if (material.map) material.map.dispose()
  if (material.emissiveMap) material.emissiveMap.dispose()
  material.map = null
  material.emissiveMap = null
  material.color.copy(GLOW_COLOR)
  if (material.emissive) material.emissive.copy(GLOW_COLOR)
  material.emissiveIntensity = 1.4
  material.transparent = true
  material.depthWrite = false
  material.needsUpdate = true

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vGlowFade;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n\tvGlowFade = clamp((${GLOW_FLOOR_PANEL_TOP_Y.toFixed(6)} - position.y) / ${FADE_RANGE.toFixed(6)}, 0.0, 1.0);`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vGlowFade;')
      .replace(
        '#include <opaque_fragment>',
        'diffuseColor.a *= vGlowFade;\n#include <opaque_fragment>'
      )
  }
}

// Mounts one instance of the imported glow_floor_panel prop at `position`.
// Every placed instance shares the cached glTF scene/material (useGLTF's own
// cache, same pattern as Ground.jsx's GroundBlock) — only the Object3D
// hierarchy is cloned per instance so each can sit at its own position.
// Thin/transparent panel (CLAUDE.md convention): no castShadow, so it
// doesn't throw a hard rectangular shadow; still receives shadows from
// whatever passes over it.
export default function GlowFloorPanelProp({ position }) {
  const { scene } = useGLTF(GLOW_FLOOR_PANEL_MODEL_URL)

  const instance = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (!child.isMesh) return
      applyGlowGradient(child.material)
      child.castShadow = false
      child.receiveShadow = true
      // Laser-Escape's exported glTF bakes that scene's own placement
      // (a large translation) and its own GLOW_FLOOR_PANEL_SCALE-sized scale
      // straight into this mesh's node — unlike this project's own exports
      // (ground.glb, slope_block.glb), which sit at local-origin/scale 1 so
      // the `position`/`scale` props below are the only source of truth.
      // Strip the baked transform so this instance isn't offset ~90 units
      // and double-scaled on top of `position`/GLOW_FLOOR_PANEL_SCALE.
      child.position.set(0, 0, 0)
      child.scale.set(1, 1, 1)
    })
    return clone
  }, [scene])

  return <primitive object={instance} position={position} scale={GLOW_FLOOR_PANEL_SCALE} />
}

useGLTF.preload(GLOW_FLOOR_PANEL_MODEL_URL)
