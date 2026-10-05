import { useEffect, useState } from 'react'
import { Deck } from './engine/Deck'
import { initDeck } from './engine/deckStore'
import { readHash } from './engine/hash'
import { preloadAll } from './engine/preload'
import { useControls } from './engine/useControls'
import { slides } from './slides'
import { PRELOAD_IMAGES } from './assets/images'

initDeck(
  slides.map((s) => s.lastStep),
  readHash(),
)

export default function App() {
  const [ready, setReady] = useState(false)
  useControls()

  useEffect(() => {
    let alive = true
    void preloadAll(PRELOAD_IMAGES).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  if (!ready) return <div className="loading" />
  return <Deck slides={slides} />
}
