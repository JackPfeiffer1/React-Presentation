import { initHighlighter } from './highlight'

const FONTS = [
  '400 40px "Instrument Serif"',
  'italic 400 40px "Instrument Serif"',
  '450 40px "Inter Tight Variable"',
  '600 40px "Inter Tight Variable"',
  '500 34px "JetBrains Mono Variable"',
  '750 34px "JetBrains Mono Variable"',
]

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      img
        .decode()
        .catch(() => {})
        .finally(() => resolve())
    }
    img.onerror = () => resolve()
    img.src = src
  })
}

function timeout(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** Everything the talk needs, loaded before slide 1 shows so nothing pops in mid-talk. */
export async function preloadAll(images: string[]) {
  const work = Promise.all([
    ...FONTS.map((f) => document.fonts.load(f).catch(() => [])),
    ...images.map(loadImage),
    initHighlighter().catch(() => {}),
  ]).then(() => document.fonts.ready)
  await Promise.race([work, timeout(8000)])
}
