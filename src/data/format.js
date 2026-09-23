// Big-number and duration presentation. Pure functions of primitives only,
// no React, no store import, so any HUD readout can depend on them freely.
const SUFFIXES = ['', 'K', 'M', 'B', 'T']

function packSuffix(over) {
  const hi = Math.floor(over / 26)
  const lo = over % 26
  return String.fromCharCode(97 + hi) + String.fromCharCode(97 + lo)
}

// 2480 -> "2.48K", 50 -> "50", 12_300_000 -> "12.3M".
export function formatShort(n) {
  if (!Number.isFinite(n)) return '0'
  const neg = n < 0
  let v = Math.abs(n)

  if (v < 1000) {
    const s = Number.isInteger(v) ? String(v) : v.toFixed(1)
    return neg ? `-${s}` : s
  }

  let tier = 0
  while (v >= 1000) {
    v /= 1000
    tier++
  }

  const suffix = tier < SUFFIXES.length ? SUFFIXES[tier] : packSuffix(tier - SUFFIXES.length)

  const digits = v < 10 ? 2 : v < 100 ? 1 : 0
  let mantissa = v.toFixed(digits)
  if (mantissa.includes('.')) mantissa = mantissa.replace(/\.?0+$/, '')

  return `${neg ? '-' : ''}${mantissa}${suffix}`
}

// store/useGameStore.js's timePlayed (seconds) -> the two largest units:
// 45 -> "45s", 125 -> "2m 5s", 7384 -> "2h 3m", 93784 -> "1d 2h".
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}
