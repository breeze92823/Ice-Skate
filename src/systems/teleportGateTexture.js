// Dense purple/blue warp-nebula bake for the teleport gate's portal face —
// a radial glow core, thin light-burst rays and a dense field of soft cloud
// blobs + pinpoint sparkles, layered with 'lighter' blending so overlaps
// build up brightness like the reference nebula photo. Sparkle/blob counts
// are kept high on purpose: a sparse scatter would leave gaps that read as
// the bare flat-color plane showing through, which is the one thing this
// bake exists to avoid. Baked once per mount (TeleportGate.jsx), not
// per-frame — the swirl comes from animating the baked texture's rotation,
// not from repainting the canvas.
//
// The canvas is left transparent (no opaque fillRect) — the base gradient
// and every blob/sparkle fade their alpha to 0 toward the disc's edge, so
// there's no square backdrop, just the glow itself. TeleportGate.jsx pairs
// this with a transparent + additive material so empty canvas area shows
// whatever's behind the gate instead of a black square.
import * as THREE from 'three'

const CLOUD_PALETTE = ['#b98bff', '#8f6bff', '#6f5cff', '#c9a6ff', '#5a7dff']
const SPARK_PALETTE = ['#ffffff', '#dce9ff', '#c9a6ff', '#9fd0ff']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

export function makeTeleportGateTexture({ size = 512 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const g = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2
  const R = size / 2

  // Base: bright warp core fading out to fully transparent — no opaque
  // backdrop, so the corners of the square canvas stay empty.
  const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R)
  bg.addColorStop(0, 'rgba(245,238,255,1)')
  bg.addColorStop(0.1, 'rgba(205,168,255,0.95)')
  bg.addColorStop(0.32, 'rgba(125,95,224,0.75)')
  bg.addColorStop(0.6, 'rgba(60,45,140,0.35)')
  bg.addColorStop(0.85, 'rgba(25,18,70,0.1)')
  bg.addColorStop(1, 'rgba(10,6,26,0)')
  g.fillStyle = bg
  g.fillRect(0, 0, size, size)

  // Thin light-burst rays radiating from the core, alternating length/width.
  g.globalCompositeOperation = 'lighter'
  const rayCount = 72
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + rand(-0.02, 0.02)
    const len = R * rand(0.55, 1)
    const width = R * rand(0.003, 0.014)
    g.save()
    g.translate(cx, cy)
    g.rotate(angle)
    const ray = g.createLinearGradient(0, 0, len, 0)
    ray.addColorStop(0, 'rgba(255,255,255,0.5)')
    ray.addColorStop(0.4, 'rgba(180,150,255,0.18)')
    ray.addColorStop(1, 'rgba(120,90,255,0)')
    g.fillStyle = ray
    g.fillRect(0, -width / 2, len, width)
    g.restore()
  }

  // Dense soft cloud blobs, built up with additive blending for the
  // nebula-wisp look.
  const cloudCount = 70
  for (let i = 0; i < cloudCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = R * Math.sqrt(Math.random()) * 0.95
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    const edgeFade = 1 - r / R
    const blobR = rand(size * 0.03, size * 0.12)
    const color = CLOUD_PALETTE[Math.floor(Math.random() * CLOUD_PALETTE.length)]
    const blob = g.createRadialGradient(x, y, 0, x, y, blobR)
    blob.addColorStop(0, color)
    blob.addColorStop(1, 'rgba(0,0,0,0)')
    g.globalAlpha = rand(0.1, 0.3) * edgeFade
    g.fillStyle = blob
    g.beginPath()
    g.arc(x, y, blobR, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1

  // High-density pinpoint sparkles — the part that keeps the bake from
  // reading as a flat tinted plane up close.
  const sparkCount = Math.round(size * size * 0.006)
  for (let i = 0; i < sparkCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = R * Math.sqrt(Math.random()) * 0.98
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    const edgeFade = 1 - r / R
    const s = rand(0.6, 2.4)
    g.globalAlpha = rand(0.35, 1) * edgeFade
    g.fillStyle = SPARK_PALETTE[Math.floor(Math.random() * SPARK_PALETTE.length)]
    g.beginPath()
    g.arc(x, y, s, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
  g.globalCompositeOperation = 'source-over'

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.center.set(0.5, 0.5)
  tex.anisotropy = 4
  return tex
}
