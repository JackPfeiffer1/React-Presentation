import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useDeck, progressFraction } from './deckStore'
import { registerRunning } from './skipRegistry'
import { SlideScope } from './SlideContext'
import { Stage, themeBg } from './Stage'
import { play } from './sound'
import type { SlideDef } from './types'
import { easeEmphasized, easeInQuart } from '../styles/motion'
import { Overlays } from '../components/Overlays'

type Shown = { slide: number; mountKey: number; enterAnimated: boolean }
type Wipe = { kind: 'wipe' | 'circle'; target: Shown }
type ExitKind = 'fade' | 'instant'

const exitVariants = {
  exit: (kind: ExitKind) =>
    kind === 'fade'
      ? { opacity: 0, y: -40, transition: { duration: 0.22, ease: easeInQuart } }
      : { opacity: 1, transition: { duration: 0 } },
}

export function Deck({ slides }: { slides: SlideDef[] }) {
  const deck = useDeck()
  const [shown, setShown] = useState<Shown>({ slide: deck.slide, mountKey: deck.mountKey, enterAnimated: false })
  const [wipe, setWipe] = useState<Wipe | null>(null)
  const exitKind = useRef<ExitKind>('instant')

  useEffect(() => {
    if (deck.slide === shown.slide && deck.mountKey === shown.mountKey) return
    if (deck.mode === 'snap') {
      exitKind.current = 'instant'
      setWipe(null)
      setShown({ slide: deck.slide, mountKey: deck.mountKey, enterAnimated: false })
      return
    }
    if (deck.slide === shown.slide) return
    const from = slides[shown.slide]
    const to = slides[deck.slide]
    const target = { slide: deck.slide, mountKey: deck.mountKey, enterAnimated: true }
    if (to.enter || from.theme !== to.theme) {
      setWipe({ kind: to.enter ?? 'wipe', target })
      play('whoosh')
    } else {
      exitKind.current = 'fade'
      setShown(target)
    }
  }, [deck.slide, deck.mountKey, deck.mode, shown.slide, shown.mountKey, slides])

  const finishWipe = useRef<() => void>(() => {})
  finishWipe.current = () => {
    if (!wipe) return
    exitKind.current = 'instant'
    setShown(wipe.target)
    setWipe(null)
  }

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
      <AnimatePresence mode="wait" custom={exitKind.current} initial={false}>
        <motion.div
          key={`${def.id}:${shown.mountKey}`}
          className={`slide theme-${def.theme}`}
          variants={exitVariants}
          exit="exit"
          custom={exitKind.current}
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
          initial={wipe.kind === 'circle' ? { clipPath: 'circle(0% at 50% 46%)' } : { y: '100%' }}
          animate={wipe.kind === 'circle' ? { clipPath: 'circle(75% at 50% 46%)' } : { y: '0%' }}
          transition={{ duration: wipe.kind === 'circle' ? 0.7 : 0.56, ease: easeEmphasized }}
          onAnimationComplete={() => finishWipe.current()}
        />
      )}

      {deck.showProgress && <div className="progress" style={{ width: `${progressFraction() * 100}%` }} />}
      <Overlays slides={slides} />
    </Stage>
  )
}
