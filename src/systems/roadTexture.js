// The orange tread-plate road bitmap (see reference screenshot in the task
// that introduced Road.jsx): rows of rounded "grip pad" squares in a
// brick-offset grid, bordered on both long edges by a segmented grey kerb
// strip. Baked once to a CanvasTexture, same approach as studTexture.js.
import * as THREE from 'three'
import { shade } from './studTexture.js'

export function makeRoadTexture({
  width,
  length,
  cell,
  color,
  colorDark,
  curbLight,
  curbDark,
  curbWidth,
}) {
  const pxPerMetre = 64
  const canvasW = Math.round(width * pxPerMetre)
  // One 2-row brick-offset repeat, tiled along the road's length by the
  // texture's own `repeat` (kept seamless: row0/row1 alternation continues
  // identically across a tile boundary).
  const canvasH = Math.round(cell * 2 * pxPerMetre)
  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const g = canvas.getContext('2d')

  g.fillStyle = color
  g.fillRect(0, 0, canvasW, canvasH)

  const cellPx = cell * pxPerMetre
  const gap = cellPx * 0.16

  function drawPad(x, y) {
    const s = cellPx - gap * 2
    if (x + s < 0 || x > canvasW) return // fully off-canvas, no horizontal wrap
    const r = s * 0.22
    g.fillStyle = colorDark
    g.beginPath()
    g.roundRect(x, y, s, s, r)
    g.fill()
    const inset = s * 0.22
    g.fillStyle = shade(color, 0.1)
    g.beginPath()
    g.roundRect(x + inset, y + inset, s - inset * 2, s - inset * 2, r * 0.55)
    g.fill()
  }

  const cols = Math.ceil(canvasW / cellPx) + 1
  for (let row = 0; row < 2; row++) {
    const offsetX = row === 0 ? 0 : cellPx / 2
    for (let col = -1; col < cols; col++) {
      drawPad(col * cellPx + offsetX + gap, row * cellPx + gap)
    }
  }

  // Kerb strips along both long edges (x=0 and x=canvasW): alternating
  // light/dark rounded blocks, echoing the pad style at a finer pitch.
  const curbPx = curbWidth * pxPerMetre
  const dashPx = cellPx * 0.5
  for (const x0 of [0, canvasW - curbPx]) {
    for (let y = -dashPx; y < canvasH + dashPx; y += dashPx) {
      const on = Math.round(y / dashPx) % 2 === 0
      g.fillStyle = on ? curbLight : curbDark
      g.beginPath()
      g.roundRect(x0 + curbPx * 0.12, y + dashPx * 0.12, curbPx * 0.76, dashPx * 0.76, curbPx * 0.2)
      g.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, length / (cell * 2))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
