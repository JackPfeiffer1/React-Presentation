import { useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import { CREDITS, img } from '../assets/images'
import { Appear, Stamp } from '../components/Appear'
import { Credit } from '../components/Credit'
import { HtmlCard } from '../components/HtmlCard'
import { MaskText } from '../components/MaskText'
import { PEOPLE } from '../demo/people'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { colX, spanW } from './layout'

const DOUGH_TOP = 400
const DOUGH_H = 584
const SLOT_X = (spanW(6) - 440) / 2
const slotY = (i: number) => 24 + i * 184

export function S03Cutter({ step }: SlideProps) {
  const anim = useEnterAnim()
  const [stamped, setStamped] = useState(step >= 1 && !anim ? 3 : 0)
  const [scope, animate] = useAnimate<HTMLDivElement>()

  useEffect(() => {
    if (step < 1 || stamped >= 3) return
    let cancelled = false
    const cutter = scope.current?.querySelector<HTMLDivElement>('.cutter')
    const dough = scope.current
    if (!cutter || !dough) return

    const run = async () => {
      for (let i = 0; i < 3 && !cancelled; i++) {
        await animate(cutter, { x: SLOT_X, y: slotY(i) - 70, opacity: 1, scale: 1.04 }, { duration: i === 0 ? 0.35 : 0.22, ease: [0.16, 1, 0.3, 1] })
        if (cancelled) return
        await animate(cutter, { y: slotY(i), scale: 1 }, { duration: 0.13, ease: [0.5, 0, 0.75, 0] })
        if (cancelled) return
        play('stamp')
        setStamped(i + 1)
        void animate(dough, { y: [0, 5, -2, 0] }, { duration: 0.28 })
        await animate(cutter, { y: slotY(i) - 40 }, { duration: 0.2, ease: [0.16, 1, 0.3, 1] })
      }
      if (!cancelled) await animate(cutter, { opacity: 0, x: SLOT_X + 520 }, { duration: 0.4, ease: [0.5, 0, 0.75, 0] })
    }

    const unregister = registerRunning(() => {
      cancelled = true
      setStamped(3)
      cutter.style.opacity = '0'
    })
    void run().finally(unregister)
    return () => {
      cancelled = true
      unregister()
    }
  }, [step])

  return (
    <>
      <Appear style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(5) }} from={{ opacity: 0, scale: 1.04 }}>
        <img src={img('cookie-cutter.jpg')} alt="A cookie cutter pressing a star out of dough" style={{ width: '100%', height: 457, objectFit: 'cover', borderRadius: 20 }} />
      </Appear>

      <MaskText as="h1" className="h1" text="Make the cutter *once.*" style={{ position: 'absolute', left: colX(7), top: 120, width: spanW(6) }} />
      <Appear delay={0.35} style={{ position: 'absolute', left: colX(7), top: 270, width: spanW(6) }}>
        <p className="body muted">Then stamp out as many as you want.</p>
      </Appear>

      <div
        ref={scope}
        style={{ position: 'absolute', left: colX(7), top: DOUGH_TOP, width: spanW(6), height: DOUGH_H, background: 'var(--paper-1)', borderRadius: 20 }}
      >
        {Array.from({ length: stamped }, (_, i) => (
          <Stamp key={i} silent style={{ position: 'absolute', left: SLOT_X, top: slotY(i) }}>
            <HtmlCard person={PEOPLE[0]} />
          </Stamp>
        ))}
        <div className="cutter" style={{ opacity: 0, transform: `translate(${SLOT_X}px, -80px)` }} />
      </div>

      {step >= 2 && (
        <div style={{ position: 'absolute', left: colX(1), top: 640, width: spanW(5) }}>
          <MaskText as="h2" className="h2" text="The cutter is a *component.*" />
          <Appear delay={0.4} style={{ marginTop: 32 }}>
            <p className="body">
              React is a JavaScript tool for building pages out of <span className="accent-text">components</span>.
            </p>
          </Appear>
        </div>
      )}

      <Credit>{CREDITS.cookie}</Credit>
    </>
  )
}
