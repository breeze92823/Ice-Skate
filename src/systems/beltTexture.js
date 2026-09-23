// Grooved treadmill deck texture — dark ridges running crosswise (rungs
// perpendicular to the walking direction, spaced evenly along the depth
// axis), each groove painted with a shadowed and a highlighted edge so the
// bevel reads under the scene's directional light. Rungs (not lengthwise
// stripes) so systems/treadmillAnim.js can scroll the belt along its own
// depth (texture.offset.y) and actually see motion — a pattern uniform
// along the scroll axis wouldn't visibly move no matter how far it's
// offset. `pitch` divides the canvas height evenly, so the rung pattern
// tiles seamlessly under RepeatWrapping with no seam at the wrap point.
import * as THREE from 'three'
import { shade } from './studTexture.js'

export function makeBeltTexture({ width, depth, grooveCount = 7, base = '#18181c' }) {
  const w = 256
  const h = Math.max(128, Math.round(w * (depth / width)))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d')
  g.fillStyle = base
  g.fillRect(0, 0, w, h)

  const pitch = h / grooveCount
  const grooveHeight = pitch * 0.34
  for (let i = 0; i < grooveCount; i++) {
    const y = i * pitch + pitch * 0.5 - grooveHeight / 2
    g.fillStyle = shade(base, 0.18)
    g.fillRect(0, y, w, grooveHeight)
    g.fillStyle = 'rgba(0,0,0,0.35)'
    g.fillRect(0, y, w, grooveHeight * 0.28)
    g.fillStyle = 'rgba(255,255,255,0.1)'
    g.fillRect(0, y + grooveHeight * 0.72, w, grooveHeight * 0.28)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
