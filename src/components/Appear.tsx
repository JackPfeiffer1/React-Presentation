import { motion, type TargetAndTransition, type Transition } from 'motion/react'
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import { easeOutExpo } from '../styles/motion'

type Props = {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  /** Starting offset/state. Defaults to rising 32px while fading in. */
  from?: TargetAndTransition
  transition?: Transition
  sound?: 'pop' | 'stamp' | 'ding' | 'whoosh'
  as?: 'div' | 'span' | 'p' | 'li'
}

/** Fades and rises in when it appears because of a key press; snaps into place otherwise. */
export function Appear({ children, className, style, delay = 0, from, transition, sound, as = 'div' }: Props) {
  const anim = useEnterAnim()
  useEffect(() => {
    if (!anim || !sound) return
    const t = window.setTimeout(() => play(sound), delay * 1000)
    return () => window.clearTimeout(t)
  }, [anim, sound, delay])
  const M = motion[as]
  return (
    <M
      className={className}
      style={style}
      initial={anim ? (from ?? { opacity: 0, y: 32 }) : false}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={transition ?? { duration: 0.72, ease: easeOutExpo, delay }}
    >
      {children}
    </M>
  )
}

/** Cards landing with a stamp: drop from slightly above, overshoot, settle. */
export function Stamp({ children, className, style, delay = 0, silent = false }: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number; silent?: boolean }) {
  return (
    <Appear
      className={className}
      style={style}
      delay={delay}
      sound={silent ? undefined : 'stamp'}
      from={{ opacity: 0, scale: 1.18, y: -18 }}
      transition={{ type: 'spring', stiffness: 700, damping: 22, delay, opacity: { duration: 0.12, delay } }}
    >
      {children}
    </Appear>
  )
}
