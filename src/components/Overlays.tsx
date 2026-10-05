import { useEffect, useState } from 'react'
import { goTo, setOverlay, useDeck } from '../engine/deckStore'
import type { SlideDef } from '../engine/types'

function JumpMenu({ slides, current }: { slides: SlideDef[]; current: number }) {
  const [selected, setSelected] = useState(current)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const half = Math.ceil(slides.length / 2)
      if (e.key === 'ArrowDown') setSelected((s) => Math.min(slides.length - 1, s + 1))
      else if (e.key === 'ArrowUp') setSelected((s) => Math.max(0, s - 1))
      else if (e.key === 'ArrowRight') setSelected((s) => Math.min(slides.length - 1, s + half))
      else if (e.key === 'ArrowLeft') setSelected((s) => Math.max(0, s - half))
      else if (e.key === 'Enter') goTo(selected)
      else if (/^\d$/.test(e.key)) {
        const value = (typed + e.key).slice(-2)
        setTyped(value)
        const n = Number(value) - 1
        if (n >= 0 && n < slides.length) setSelected(n)
        return
      } else return
      e.preventDefault()
      setTyped('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, slides.length, typed])

  return (
    <div className="overlay">
      <div className="h2">Jump to</div>
      <ol className="jump-list">
        {slides.map((s, i) => (
          <li
            key={s.id}
            className={`jump-item ${i === selected ? 'selected' : ''}`}
            onMouseEnter={() => setSelected(i)}
            onClick={() => goTo(i)}
          >
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            {s.title}
          </li>
        ))}
      </ol>
    </div>
  )
}

const SHORTCUTS: [string, string][] = [
  ['→  Space  PgDn', 'Next'],
  ['←  PgUp', 'Back'],
  ['R', 'Replay this slide'],
  ['G', 'Jump to a slide'],
  ['F', 'Fullscreen'],
  ['M', 'Sound on / off'],
  ['P', 'Progress bar on / off'],
  ['H', 'Click the like button (state slide)'],
  ['Esc', 'Leave a text box / close this'],
]

function Shortcuts() {
  return (
    <div className="overlay" onClick={() => setOverlay(null)}>
      <div className="h2" style={{ marginBottom: 56 }}>
        Controls
      </div>
      {SHORTCUTS.map(([k, label]) => (
        <div className="shortcut-row" key={k}>
          <span className="kbd">{k}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function Overlays({ slides }: { slides: SlideDef[] }) {
  const deck = useDeck()
  if (deck.overlay === 'jump') return <JumpMenu slides={slides} current={deck.slide} />
  if (deck.overlay === 'shortcuts') return <Shortcuts />
  return null
}
