import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { CREDITS } from '../assets/images'
import { Appear, Stamp } from '../components/Appear'
import { CardWall, PITCH_X, PITCH_Y } from '../components/CardWall'
import { ChatToast } from '../components/ChatToast'
import { Counter } from '../components/Counter'
import { Credit } from '../components/Credit'
import { HtmlCard } from '../components/HtmlCard'
import { MaskText } from '../components/MaskText'
import { Swap } from '../components/Swap'
import { TypedCode } from '../components/TypedCode'
import { PEOPLE, type Person } from '../demo/people'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { springDrift } from '../styles/motion'
import { colX, spanW } from './layout'

export const GRID_X = colX(6) + (spanW(7) - (2 * PITCH_X - 32)) / 2
export const GRID_Y = 250

export function htmlBlock(p: Person, bordered: boolean) {
  return [`<div class="card${bordered ? ' bordered' : ''}">`, `  <img src="${p.photo}">`, `  <h2>${p.name}</h2>`, `  <p>${p.role}</p>`, `</div>`].join('\n')
}

function editorCode(count: number, bordered: number) {
  return PEOPLE.slice(0, count)
    .map((p, i) => htmlBlock(p, i < bordered))
    .join('\n\n')
}

export function cardPos(i: number) {
  return { left: GRID_X + (i % 2) * PITCH_X, top: GRID_Y + Math.floor(i / 2) * PITCH_Y }
}

const SPEEDS = [12, 16, 22, 30, 45, 70]
const PAUSES = [700, 520, 380, 260, 180, 120]

export function S02Problem({ step }: SlideProps) {
  const anim = useEnterAnim()
  const [edits, setEdits] = useState(step >= 3 && !anim ? 6 : 0)
  const [instant, setInstant] = useState(false)
  const timer = useRef(0)

  useEffect(() => {
    if (step === 3 && edits === 0) setEdits(1)
  }, [step, edits])

  useEffect(() => {
    if (step < 3 || edits >= 6) return
    return registerRunning(() => {
      window.clearTimeout(timer.current)
      setInstant(true)
      setEdits(6)
    })
  }, [step, edits])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const [borderedState, setBordered] = useState(step >= 3 && !anim ? 6 : 0)
  const bordered = instant ? 6 : borderedState
  const onEditDone = () => {
    if (step < 3 || edits === 0) return
    setBordered(edits)
    play('stamp')
    if (edits < 6) timer.current = window.setTimeout(() => setEdits((e) => Math.min(6, e + 1)), PAUSES[edits])
  }

  const count = step === 0 ? 1 : 6
  const code = editorCode(count, edits)

  return (
    <>
      <div style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(5), zIndex: 5 }}>
        <Swap k={step >= 4 ? 'c' : step >= 1 ? 'b' : 'a'}>
          {step === 0 && <MaskText as="h2" className="h2" text="This is a profile card." />}
          {(step === 1 || step === 2 || step === 3) && <MaskText as="h2" className="h2" text="And here are *six.*" />}
          {step >= 4 && <MaskText as="h2" className="h2" text="Now imagine a *million.*" />}
        </Swap>
        {step === 0 && (
          <Appear delay={0.3} style={{ marginTop: 20 }}>
            <p className="caption">Plain HTML and CSS. Stuff you already know.</p>
          </Appear>
        )}
      </div>

      <motion.div
        style={{ position: 'absolute', left: colX(1), top: 330, width: spanW(5) }}
        animate={{ opacity: step >= 4 ? 0 : 1, y: step >= 4 ? 20 : 0 }}
        initial={false}
        transition={{ duration: 0.4 }}
      >
        <TypedCode code={code} lang="html" filename="index.html" fontSize={22} maxLines={14} speed={SPEEDS[Math.max(0, edits - 1)]} instant={instant || step < 3} onDone={onEditDone} />
      </motion.div>

      <CardWall gridX={GRID_X} gridY={GRID_Y} zoomed={step >= 4}>
        {PEOPLE.map((p, i) => {
          if (i > 0 && step === 0) return null
          const pos = cardPos(i)
          if (i === 0) {
            return (
              <motion.div
                key={p.id}
                style={{ position: 'absolute', ...pos }}
                initial={anim ? { opacity: 0, scale: 1.25, x: 236, y: 192 } : false}
                animate={step === 0 ? { opacity: 1, scale: 1.4, x: 236, y: 192 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={springDrift}
              >
                <HtmlCard person={p} bordered={bordered > i} />
              </motion.div>
            )
          }
          return (
            <Stamp key={p.id} style={{ position: 'absolute', ...pos }} delay={0.12 + i * 0.07} silent={i % 2 === 0}>
              <HtmlCard person={p} bordered={bordered > i} />
            </Stamp>
          )
        })}
      </CardWall>

      {(step === 2 || step === 3) && <ChatToast message="Put a border on every card. Thanks!" />}

      {step >= 3 && (
        <Appear
          key={step >= 4 ? 'wall' : 'grid'}
          className="edits-counter"
          style={{
            position: 'absolute',
            left: step >= 4 ? colX(1) : GRID_X,
            top: step >= 4 ? 300 : GRID_Y + 3 * PITCH_Y + 24,
            zIndex: 5,
            background: step >= 4 ? 'var(--paper-0)' : 'transparent',
            padding: step >= 4 ? '16px 24px 16px 0' : 0,
          }}
        >
          <span className="label">Edits</span>
          <span className="value">
            <Counter value={edits} from={edits} duration={0.3} /> / <Counter value={step >= 4 ? 1000000 : 6} from={6} duration={1.8} />
          </span>
        </Appear>
      )}

      {step >= 4 && (
        <Appear delay={0.9} style={{ position: 'absolute', left: colX(1), top: 420, zIndex: 5, background: 'var(--paper-0)', padding: '8px 24px 8px 0' }}>
          <p className="body">Instagram has billions of posts.</p>
        </Appear>
      )}

      <Credit>{CREDITS.people + ' ' + CREDITS.boss}</Credit>
    </>
  )
}
