export function readHash(): { slide: number; step: number } | null {
  const match = /^#\/(\d+)(?:\/(\d+))?/.exec(window.location.hash)
  if (!match) return null
  return { slide: Math.max(0, Number(match[1]) - 1), step: Number(match[2] ?? 0) }
}

export function writeHash(slide: number, step: number): void {
  const next = `#/${slide + 1}/${step}`
  if (window.location.hash !== next) {
    history.replaceState(null, '', next)
  }
}
