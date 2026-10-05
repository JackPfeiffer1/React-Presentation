import cardV1Raw from './CardV1.jsx?raw'
import cardV2Raw from './CardV2.jsx?raw'
import cardV3Raw from './CardV3.jsx?raw'
import likeButtonRaw from './LikeButton.jsx?raw'

/** The part of a demo file between `// #show` and `// #endshow`: exactly what runs is what we show. */
export function shown(raw: string): string {
  const start = raw.indexOf('// #show')
  const end = raw.indexOf('// #endshow')
  if (start === -1 || end === -1) return raw.trim()
  return raw.slice(raw.indexOf('\n', start) + 1, end).replace(/\s+$/, '')
}

export const CARD_V1 = shown(cardV1Raw)
export const CARD_V2 = shown(cardV2Raw)
export const CARD_V3 = shown(cardV3Raw)
export const LIKE_BUTTON = shown(likeButtonRaw)
