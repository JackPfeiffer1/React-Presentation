import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDeck, progressFraction } from './deckStore'
import { registerRunning } from './skipRegistry'
import { SlideScope } from './SlideContext'
import { Stage, themeBg } from './Stage'
import { play } from './sound'
import type { SlideDef } from './types'
import { easeEmphasized, easeInQuart } from '../styles/motion'
import { Overlays } from '../components/Overlays'

type ExitKind = 'fade' | 'instant'
type Shown = { slide: number; mountKey: number; enterAnimated: boolean; exit: ExitKind }
type Wipe = { kind: 'wipe' | 'circle'; target: Shown }

const exitVariants = {
  exit: (kind: ExitKind) =>
    kind === 'fade'
      ? { opacity: 0, y: -40, transition: { duration: 0.22, ease: easeInQuart } }
      : { opacity: 1, transition: { duration: 0 } },
}

export function Deck({ slides }: { slides: SlideDef[] }) {
  const deck = useDeck()
  const [shown, setShown] = useState<Shown>({ slide: deck.slide, mountKey: deck.mountKey, enterAnimated: false, exit: 'instant' })
  const [wipe, setWipe] = useState<Wipe | null>(null)

  // The deck store is the external system here; `shown` lags it so wipes can finish before the swap.
  useEffect(() => {
    if (deck.slide === shown.slide && deck.mountKey === shown.mountKey) return
    if (deck.mode === 'snap') {
      // oxlint-disable-next-line react/set-state-in-effect
      setWipe(null)
      setShown({ slide: deck.slide, mountKey: deck.mountKey, enterAnimated: false, exit: 'instant' })
      return
    }
    if (deck.slide === shown.slide) return
    const from = slides[shown.slide]
    const to = slides[deck.slide]
    if (to.enter || from.theme !== to.theme) {
      setWipe({ kind: to.enter ?? 'wipe', target: { slide: deck.slide, mountKey: deck.mountKey, enterAnimated: true, exit: 'instant' } })
      play('whoosh')
    } else {
      setShown({ slide: deck.slide, mountKey: deck.mountKey, enterAnimated: true, exit: 'fade' })
    }
  }, [deck.slide, deck.mountKey, deck.mode, shown.slide, shown.mountKey, slides])

  const finishWipe = useRef<() => void>(() => {})
  useLayoutEffect(() => {
    finishWipe.current = () => {
      if (!wipe) return
      setShown(wipe.target)
      setWipe(null)
    }
  })

  useEffect(() => {
    if (!wipe) return
    return registerRunning(() => finishWipe.current())
  }, [wipe])

  const def = slides[shown.slide]
  const SlideComponent = def.Component
  const step = deck.slide === shown.slide ? deck.step : shown.slide < deck.slide ? def.lastStep : 0
  const wipeTheme = wipe ? slides[wipe.target.slide].theme : def.theme

  return (
    <Stage theme={def.theme}>
      <AnimatePresence mode="wait" custom={shown.exit} initial={false}>
        <motion.div
          key={`${def.id}:${shown.mountKey}`}
          className={`slide theme-${def.theme}`}
          variants={exitVariants}
          exit="exit"
          custom={shown.exit}
          data-slide={def.id}
        >
          <SlideScope enterAnimated={shown.enterAnimated}>
            <SlideComponent step={step} />
          </SlideScope>
        </motion.div>
      </AnimatePresence>

      {wipe && (
        <motion.div
          key={`wipe-${wipe.target.slide}`}
          className="wipe"
          style={{ backgroundColor: themeBg[wipeTheme] }}
          initial={wipe.kind === 'circle' ? { clipPath: 'circle(0% at 50% 34%)' } : { y: '100%' }}
          animate={wipe.kind === 'circle' ? { clipPath: 'circle(80% at 50% 34%)' } : { y: '0%' }}
          transition={{ duration: wipe.kind === 'circle' ? 0.7 : 0.56, ease: easeEmphasized }}
          onAnimationComplete={() => finishWipe.current()}
        />
      )}

      {deck.showProgress && <div className="progress" style={{ width: `${progressFraction() * 100}%` }} />}
      <Overlays slides={slides} />
    </Stage>
  )
}
