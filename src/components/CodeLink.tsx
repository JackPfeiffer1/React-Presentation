import { motion } from 'motion/react'
import { useLayoutEffect, useState } from 'react'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import { easeEmphasized } from '../styles/motion'

type Box = { x: number; y: number; w: number; h: number }

function measure(markId: string): Box | null {
  const stage = document.querySelector('.stage') as HTMLElement | null
  const els = document.querySelectorAll<HTMLElement>(`.slide [data-mark="${markId}"]`)
  if (!stage || els.length === 0) return null
  const s = stage.getBoundingClientRect()
  const scale = s.width / 1920
  let x1 = Infinity
  let y1 = Infinity
  let x2 = -Infinity
  let y2 = -Infinity
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    x1 = Math.min(x1, r.left)
    y1 = Math.min(y1, r.top)
    x2 = Math.max(x2, r.right)
    y2 = Math.max(y2, r.bottom)
  })
  return { x: (x1 - s.left) / scale, y: (y1 - s.top) / scale, w: (x2 - x1) / scale, h: (y2 - y1) / scale }
}

/** An accent path from one marked piece of code to another, with the value travelling along it. */
export function CodeLink({ from, to, label, delay = 0 }: { from: string; to: string; label: string; delay?: number }) {
  const anim = useEnterAnim()
  const [boxes, setBoxes] = useState<{ a: Box; b: Box } | null>(null)

  useLayoutEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      const a = measure(from)
      const b = measure(to)
      if (a && b) setBoxes({ a, b })
      else raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [from, to])

  useLayoutEffect(() => {
    if (!anim || !boxes) return
    const t = window.setTimeout(() => play('whoosh'), (delay + 0.1) * 1000)
    return () => window.clearTimeout(t)
  }, [anim, boxes, delay])

  if (!boxes) return null
  const { a, b } = boxes
  const ax = a.x + a.w / 2
  const ay = a.y - 4
  const bx = b.x + b.w / 2
  const by = b.y + b.h + 4
  const lift = Math.max(60, Math.abs(ay - by) * 0.5)
  const d = `M ${ax} ${ay} C ${ax} ${ay - lift}, ${bx} ${by + lift}, ${bx} ${by}`
  const dur = 0.9

  return (
    <svg className="code-link" width={1920} height={1080} viewBox="0 0 1920 1080">
      <motion.path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={4}
        strokeLinecap="round"
        initial={anim ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: dur, ease: easeEmphasized, delay }}
      />
      <motion.rect
        x={a.x - 6}
        y={a.y - 2}
        width={a.w + 12}
        height={a.h + 4}
        rx={8}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={3}
        initial={anim ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      />
      <motion.rect
        x={b.x - 6}
        y={b.y - 2}
        width={b.w + 12}
        height={b.h + 4}
        rx={8}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={3}
        initial={anim ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + dur }}
      />
      {anim && (
        <motion.g
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: dur, ease: easeEmphasized, delay, opacity: { duration: dur, delay, times: [0, 0.1, 0.85, 1] } }}
          style={{ offsetPath: `path("${d}")`, offsetRotate: '0deg' } as React.CSSProperties}
        >
          <rect x={-label.length * 9 - 18} y={-22} width={label.length * 18 + 36} height={44} rx={22} fill="var(--accent)" />
          <text x={0} y={8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={24} fontWeight={600} fill="#0A0A0A">
            {label}
          </text>
        </motion.g>
      )}
    </svg>
  )
}
