// Grooved treadmill deck texture — dark ridges running lengthwise (the
// walking direction), each groove painted with a shadowed and a highlighted
// edge so the bevel reads under the scene's directional light.
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

  const pitch = w / grooveCount
  const grooveWidth = pitch * 0.34
  for (let i = 0; i < grooveCount; i++) {
    const x = i * pitch + pitch * 0.5 - grooveWidth / 2
    g.fillStyle = shade(base, 0.18)
    g.fillRect(x, 0, grooveWidth, h)
    g.fillStyle = 'rgba(0,0,0,0.35)'
    g.fillRect(x, 0, grooveWidth * 0.28, h)
    g.fillStyle = 'rgba(255,255,255,0.1)'
    g.fillRect(x + grooveWidth * 0.72, 0, grooveWidth * 0.28, h)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
