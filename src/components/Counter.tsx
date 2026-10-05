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

const DIGITS = '0123456789'

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
  return (
    <span className={className} style={{ display: 'inline-flex', fontVariantNumeric: 'tabular-nums', ...style }} aria-label={format(value, decimals, group)}>
      {[...text].map((ch, i) =>
        DIGITS.includes(ch) ? (
          <span key={`${text.length - i}`} style={{ display: 'inline-block', height: '1em', lineHeight: 1, overflow: 'hidden', position: 'relative' }}>
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(${-Number(ch)}em)`,
                transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {[...DIGITS].map((d) => (
                <span key={d} style={{ height: '1em', lineHeight: 1 }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${text.length - i}`} style={{ lineHeight: 1, height: '1em' }}>
            {ch}
          </span>
        ),
      )}
      {suffix && <span style={{ lineHeight: 1 }}>{suffix}</span>}
    </span>
  )
}
