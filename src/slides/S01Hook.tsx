import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CREDITS } from '../assets/images'
import { Logo, type LogoName } from '../assets/logos'
import { Appear } from '../components/Appear'
import { Credit } from '../components/Credit'
import { MaskText } from '../components/MaskText'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { easeInQuart, easeOutExpo, springPop } from '../styles/motion'

const HOOK_LOGOS: { name: LogoName; x: number }[] = [
  { name: 'instagram', x: 560 },
  { name: 'netflix', x: 960 },
  { name: 'discord', x: 1360 },
]
const LOGO_Y = 430
const LOGO_SIZE = 180
const IMPACT = 0.38

export function ReactAtom({ size, draw, delay = 0, rotate = true }: { size: number; draw: boolean; delay?: number; rotate?: boolean }) {
  const orbit = (i: number) => ({
    initial: draw ? { pathLength: 0, opacity: 0 } : false,
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration: 0.7, ease: easeOutExpo, delay: delay + i * 0.14 }, opacity: { duration: 0.01, delay: delay + i * 0.14 } },
  })
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      initial={draw && rotate ? { rotate: -120 } : false}
      animate={{ rotate: 0 }}
      transition={{ duration: 1.8, ease: easeOutExpo, delay }}
      aria-label="React logo"
    >
      <g fill="none" stroke="var(--accent)" strokeWidth={0.5}>
        {[0, 60, 120].map((deg, i) =>
          draw ? (
            <g key={deg} transform={`rotate(${deg})`}>
              <motion.ellipse cx={0} cy={0} rx={11} ry={4.2} {...orbit(i)} />
              <motion.ellipse
                cx={0}
                cy={0}
                rx={11}
                ry={4.2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05, delay: delay + i * 0.14 + 0.72 }}
              />
            </g>
          ) : (
            <ellipse key={deg} cx={0} cy={0} rx={11} ry={4.2} transform={`rotate(${deg})`} />
          ),
        )}
      </g>
      <motion.circle
        cx={0}
        cy={0}
        r={2.05}
        fill="var(--accent)"
        initial={draw ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ ...springPop, delay: delay + 0.5 }}
      />
    </motion.svg>
  )
}

function PopLogo({ name, x, tilt }: { name: LogoName; x: number; tilt: number }) {
  const anim = useEnterAnim()
  useEffect(() => {
    if (anim) play('pop')
  }, [anim])
  return (
    <motion.div
      style={{ position: 'absolute', left: x - LOGO_SIZE / 2, top: LOGO_Y - LOGO_SIZE / 2, color: 'var(--text-on-ink)' }}
      initial={anim ? { scale: 0.4, opacity: 0, y: 30 } : false}
      animate={{ scale: 1, opacity: 1, y: 0, rotate: tilt }}
      transition={springPop}
    >
      <Logo name={name} size={LOGO_SIZE} />
    </motion.div>
  )
}

export function S01Hook({ step }: SlideProps) {
  const anim = useEnterAnim()
  const revealedOnMount = step >= 5 && !anim
  const [snapReveal, setSnapReveal] = useState(revealedOnMount)
  const [revealKey, setRevealKey] = useState(0)

  useEffect(() => {
    if (step !== 5 || snapReveal) return
    const boom = window.setTimeout(() => play('boom'), IMPACT * 1000)
    let done = false
    const end = window.setTimeout(() => {
      done = true
      unregister()
    }, 2600)
    const unregister = registerRunning(() => {
      window.clearTimeout(boom)
      setSnapReveal(true)
      setRevealKey((k) => k + 1)
    })
    return () => {
      window.clearTimeout(boom)
      window.clearTimeout(end)
      if (!done) unregister()
    }
  }, [step, snapReveal])

  const revealing = step >= 5
  const animateReveal = !snapReveal

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0 }}
      animate={revealing && animateReveal ? { scale: [1, 1, 1.035, 1] } : { scale: 1 }}
      transition={{ duration: 0.9, times: [0, IMPACT / 0.9, (IMPACT + 0.08) / 0.9, 1], ease: 'easeOut' }}
    >
      {!revealing &&
        HOOK_LOGOS.map((l, i) =>
          step > i ? <PopLogo key={l.name} name={l.name} x={l.x} tilt={step >= 4 ? (i - 1) * 4 : 0} /> : null,
        )}

      {revealing && animateReveal &&
        HOOK_LOGOS.map((l, i) => (
          <motion.div
            key={`fly-${l.name}`}
            style={{ position: 'absolute', left: l.x - LOGO_SIZE / 2, top: LOGO_Y - LOGO_SIZE / 2, color: 'var(--text-on-ink)' }}
            initial={{ x: 0, scale: 1, opacity: 1, rotate: (i - 1) * 4 }}
            animate={{ x: 960 - l.x, scale: 0.35, opacity: 0, rotate: 0 }}
            transition={{ duration: IMPACT, ease: easeInQuart, opacity: { duration: 0.1, delay: IMPACT - 0.06 } }}
          >
            <Logo name={l.name} size={LOGO_SIZE} />
          </motion.div>
        ))}

      {step === 4 && (
        <MaskText
          className="display serif-italic"
          text="How are these built?"
          style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 120, fontStyle: 'italic' }}
        />
      )}

      {revealing && (
        <div key={revealKey}>
          {animateReveal && (
            <motion.div
              style={{ position: 'absolute', inset: 0, background: 'var(--paper-0)', pointerEvents: 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.1, 0] }}
              transition={{ duration: 0.7, times: [0, IMPACT / 0.7, (IMPACT + 0.04) / 0.7, 1] }}
            />
          )}
          <div style={{ position: 'absolute', left: 960 - 210, top: 400 - 210 - 40 }}>
            <ReactAtom size={420} draw={animateReveal} delay={IMPACT} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center' }}>
            {animateReveal ? (
              <MaskText className="display" text="React." letters stagger={0.04} delay={IMPACT + 0.45} duration={0.9} style={{ fontSize: 260 }} />
            ) : (
              <div className="display" style={{ fontSize: 260 }}>
                React.
              </div>
            )}
          </div>
        </div>
      )}

      {step >= 6 && (
        <Appear style={{ position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center' }}>
          <p className="body" style={{ color: 'var(--muted-on-ink)' }}>
            In five minutes, you'll know how it works.
          </p>
        </Appear>
      )}

      {step === 0 && (
        <motion.div className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
          F for fullscreen, then → to begin. Press ? for all controls.
        </motion.div>
      )}

      {step >= 1 && <Credit>{CREDITS.logos}</Credit>}
    </motion.div>
  )
}
