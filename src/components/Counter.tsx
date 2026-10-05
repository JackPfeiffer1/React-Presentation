import { animate } from 'motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'

type Props = {
  value: number
  decimals?: number
  duration?: number
  /** Group thousands with commas. */
  group?: boolean
  className?: string
  style?: CSSProperties
  /** Start value used when the counter mounts animated. */
  from?: number
  suffix?: string
  delay?: number
}

function format(v: number, decimals: number, group: boolean) {
  const fixed = v.toFixed(decimals)
  if (!group) return fixed
  const [int, dec] = fixed.split('.')
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? `.${dec}` : '')
}

/** An odometer: every digit is its own rolling column. */
export function Counter({ value, decimals = 0, duration = 1.4, group = true, className, style, from = 0, suffix, delay = 0 }: Props) {
  const anim = useEnterAnim()
  const [shown, setShown] = useState(anim ? from : value)
  const shownRef = useRef(shown)

  useEffect(() => {
    if (shownRef.current === value) return
    const controls = animate(shownRef.current, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shownRef.current = v
        setShown(v)
      },
    })
    const unregister = registerRunning(() => {
      controls.stop()
      shownRef.current = value
      setShown(value)
    })
    void controls.finished.then(() => {
      shownRef.current = value
      setShown(value)
      unregister()
    })
    return () => {
      controls.stop()
      unregister()
    }
  }, [value, duration, delay])

  const text = format(shown, decimals, group)
  // Fixed-width digit boxes keep the number from jittering while it counts, even in fonts without tabular figures.
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'baseline', fontVariantNumeric: 'tabular-nums', ...style }} aria-label={format(value, decimals, group)}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} style={{ display: 'inline-block', width: '1ch', textAlign: 'center' }}>
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
