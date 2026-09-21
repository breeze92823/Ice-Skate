// The Bloxity/LEGO-style bevelled-stud checker bitmap. Anything that wants
// the same material look, just recolored, can reuse makeStudTexture().
import * as THREE from 'three'

// Lighten (amount > 0) or darken (amount < 0) a colour; returns a CSS
// colour. Accepts either '#rrggbb' or this function's own 'rgb(r,g,b)'
// output, so callers can shade() an already-shade()'d colour.
export function shade(color, amount) {
  let r, g, b
  if (color[0] === '#') {
    const n = parseInt(color.slice(1), 16)
    r = (n >> 16) & 255
    g = (n >> 8) & 255
    b = n & 255
  } else {
    ;[r, g, b] = color.match(/\d+/g).map(Number)
  }
  const f = (c) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

// Paints a 2x2 checker-cell bitmap (light/dark alternating), each cell a
// bevelled stud grid, to a fresh CanvasTexture. `studsPerCell` sets the stud
// grid pitch within one cell; `repeatX`/`repeatY` set how many times this
// 2x2-cell tile repeats across the surface.
export function makeStudTexture({
  light,
  dark,
  studsPerCell = 4,
  repeatX,
  repeatY,
  studShadow = true,
  plateBevel = true,
}) {
  const cellPx = 128 // px per checker cell in the source bitmap
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = cellPx * 2
  const g = canvas.getContext('2d')
  const pitch = cellPx / studsPerCell
  const bevel = Math.max(2, cellPx / 40)

  for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const base = (cx + cy) % 2 === 0 ? light : dark
    const x0 = cx * cellPx
    const y0 = cy * cellPx

    g.fillStyle = base
    g.fillRect(x0, y0, cellPx, cellPx)
    if (plateBevel) {
      g.fillStyle = shade(base, 0.1)
      g.fillRect(x0, y0, cellPx, bevel)
      g.fillRect(x0, y0, bevel, cellPx)
      g.fillStyle = shade(base, -0.14)
      g.fillRect(x0, y0 + cellPx - bevel, cellPx, bevel)
      g.fillRect(x0 + cellPx - bevel, y0, bevel, cellPx)
    }

    for (let sy = 0; sy < studsPerCell; sy++) {
      for (let sx = 0; sx < studsPerCell; sx++) {
        const x = x0 + (sx + 0.5) * pitch
        const y = y0 + (sy + 0.5) * pitch
        const r = pitch * 0.3
        if (studShadow) disc(g, x + pitch * 0.05, y + pitch * 0.08, r * 1.05, 'rgba(0,0,0,0.28)')
        disc(g, x, y, r, shade(base, 0.05))
        g.lineWidth = pitch * 0.07
        g.strokeStyle = 'rgba(255,255,255,0.45)'
        g.beginPath()
        g.arc(x, y, r * 0.78, Math.PI, Math.PI * 1.55)
        g.stroke()
        if (studShadow) {
          g.strokeStyle = 'rgba(0,0,0,0.18)'
          g.beginPath()
          g.arc(x, y, r * 0.85, Math.PI * 0.05, Math.PI * 0.6)
          g.stroke()
        }
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
