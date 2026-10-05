import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Appear } from '../components/Appear'
import { Counter } from '../components/Counter'
import { LivePreview } from '../components/LivePreview'
import { MaskText } from '../components/MaskText'
import { Swap } from '../components/Swap'
import { TypedCode } from '../components/TypedCode'
import LikeButton from '../demo/LikeButton.jsx'
import { LIKE_BUTTON } from '../demo/source'
import { useSlideKey } from '../engine/slideKeys'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { springPop } from '../styles/motion'
import { colX, spanW } from './layout'

const FOCUS: Record<number, number[]> = { 2: [2], 3: [4], 4: [5] }

/**
 * Hosts the real <LikeButton /> untouched and watches what it renders,
 * so the memory box shows exactly what React is remembering.
 */
function LikeHost({ onLikes, register }: { onLikes: (n: number) => void; register?: (click: () => void) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const onLikesRef = useRef(onLikes)
  const registerRef = useRef(register)
  useEffect(() => {
    onLikesRef.current = onLikes
    registerRef.current = register
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const n = Number((el.textContent ?? '').replace(/\D/g, ''))
      onLikesRef.current(Number.isFinite(n) ? n : 0)
    }
    const observer = new MutationObserver(read)
    observer.observe(el, { subtree: true, childList: true, characterData: true })
    registerRef.current?.(() => el.querySelector('button')?.click())
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="like-demo"
      onClick={() => play('pop')}
      onMouseUp={() => (document.activeElement as HTMLElement | null)?.blur()}
    >
      <LikeButton />
    </div>
  )
}

function MemoryBox({ value, small = false }: { value: number; small?: boolean }) {
  return (
    <div className={`memory-box ${small ? 'small' : ''}`}>
      <span className="memory-label">likes</span>
      <motion.span key={value} className="memory-value" initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={springPop}>
        <Counter value={value} from={value} duration={0.25} />
      </motion.span>
    </div>
  )
}

function SingleDemo({ onChange }: { onChange: (n: number) => void }) {
  const [likes, setLikes] = useState(0)
  const click = useRef<() => void>(() => {})
  useSlideKey('h', () => click.current())
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
      <LikeHost
        onLikes={(n) => {
          setLikes(n)
          onChange(n)
        }}
        register={(fn) => (click.current = fn)}
      />
      <MemoryBox value={likes} />
    </div>
  )
}

function MultiDemo() {
  const [likes, setLikes] = useState([0, 0, 0])
  const clicks = useRef<(() => void)[]>([])
  const next = useRef(0)
  useSlideKey('h', () => {
    clicks.current[next.current % 3]?.()
    next.current++
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {[0, 1, 2].map((i) => (
        <Appear key={i} delay={i * 0.09} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <LikeHost onLikes={(n) => setLikes((l) => l.map((v, j) => (j === i ? n : v)))} register={(fn) => (clicks.current[i] = fn)} />
          <MemoryBox value={likes[i]} small />
        </Appear>
      ))}
    </div>
  )
}

export function S08State({ step }: SlideProps) {
  const [flashN, setFlashN] = useState(0)

  return (
    <>
      <MaskText as="h1" className="h1" text="Components can *remember.*" style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(12) }} />

      <div style={{ position: 'absolute', left: colX(1), top: 340, width: spanW(7) }}>
        <TypedCode
          code={step >= 1 ? LIKE_BUTTON : ''}
          filename="LikeButton.jsx"
          focus={FOCUS[step] ?? null}
          idleCursor={step === 0}
          flash={step >= 4 ? { text: '{likes}', n: flashN } : null}
          style={{ minHeight: 580 }}
        />
      </div>

      <div style={{ position: 'absolute', left: colX(8) + 24, top: 340, width: spanW(5) - 24 }}>
        <Swap k={step}>
          {step === 0 && <p className="note muted">This is called state: a component's memory.</p>}
          {step === 2 && (
            <p className="note">
              <span className="mono">useState</span> gives it a memory.
              <br />
              <span className="muted">It starts at 0.</span>
            </p>
          )}
          {step === 3 && <p className="note">When it's clicked: add one.</p>}
          {step === 4 && <p className="note">Show what's in memory. React redraws the button every time it changes.</p>}
          {step === 5 && <p className="note">Every copy remembers on its own.</p>}
        </Swap>

        {(step === 2 || step === 3) && (
          <Appear style={{ marginTop: 56 }} from={{ opacity: 0, scale: 0.9 }}>
            <MemoryBox value={0} />
          </Appear>
        )}

        {step === 4 && (
          <Appear style={{ marginTop: 56 }} sound="pop">
            <LivePreview>
              <SingleDemo onChange={(n) => n > 0 && setFlashN(n)} />
            </LivePreview>
          </Appear>
        )}

        {step >= 5 && (
          <Appear style={{ marginTop: 40 }}>
            <LivePreview>
              <MultiDemo />
            </LivePreview>
          </Appear>
        )}
      </div>
    </>
  )
}
