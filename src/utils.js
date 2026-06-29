// ── Helpers compartilhados ────────────────────────────────────

const COLORS = ['#4a1018','#1a2850','#103838','#2d1040','#10381a','#3a1808','#1a3a5a','#3a2a1a','#c72a5e','#1a7a3a']

export function avatarPadrao(username = '?') {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const color = COLORS[(username.charCodeAt(0) || 0) % COLORS.length]
  return `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">` +
    `<rect width="150" height="150" fill="${color}"/>` +
    `<text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700" fill="#fff0ea" text-anchor="middle" dominant-baseline="central">${initials}</text>` +
    `</svg>`
  )}`
}

export const COVER_PADRAO = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400">` +
  `<defs>` +
  `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#1a0808"/><stop offset="50%" stop-color="#3d1008"/><stop offset="100%" stop-color="#0a0404"/>` +
  `</linearGradient>` +
  `<radialGradient id="r1" cx="25%" cy="35%" r="55%">` +
  `<stop offset="0%" stop-color="#ff2d55" stop-opacity="0.45"/><stop offset="100%" stop-color="#ff2d55" stop-opacity="0"/>` +
  `</radialGradient>` +
  `</defs>` +
  `<rect width="1200" height="400" fill="url(#g)"/>` +
  `<rect width="1200" height="400" fill="url(#r1)"/>` +
  `</svg>`
)}`

export function fmt(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export function horaLabel(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)   return 'agora'
  if (min < 60)  return min + 'min'
  const h = Math.floor(min / 60)
  if (h < 24)    return h + 'h'
  const d = Math.floor(h / 24)
  if (d === 1)   return 'ontem'
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
