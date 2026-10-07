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

const PY_CLASS = ['class Post:', '    def __init__(self):', '        self.likes = 0', '', '    def like(self):', '        self.likes += 1'].join('\n')
const PY_USAGE = ['', '', 'a = Post()', 'b = Post()', 'a.like()', 'a.like()'].join('\n')

const FOCUS: Record<number, number[]> = { 4: [2], 5: [4], 6: [5] }

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

function MemoryBox({ value, label = 'likes', small = false }: { value: number; label?: string; small?: boolean }) {
  return (
    <div className={`memory-box ${small ? 'small' : ''}`}>
      <span className="memory-label">{label}</span>
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

const PARTS: [string, string][] = [
  ['likes', 'the value right now'],
  ['setLikes', 'the function that changes it'],
  ['0', 'the value it starts with'],
]

function Breakdown() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <p className="note">
        One line, three parts.
      </p>
      {PARTS.map(([code, meaning], i) => (
        <Appear key={code} delay={0.25 + i * 0.35} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="mono" style={{ fontSize: 34, fontWeight: 600, color: 'var(--accent-text)' }}>
            {code}
          </span>
          <span className="note muted" style={{ fontSize: 30 }}>
            {meaning}
          </span>
        </Appear>
      ))}
    </div>
  )
}

export function S08State({ step }: SlideProps) {
  const [flashN, setFlashN] = useState(0)
  const react = step >= 3

  return (
    <>
      <MaskText as="h1" className="h1" text="Components can *remember.*" style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(12) }} />

      <Swap k={react ? 'jsx' : 'py'} style={{ position: 'absolute', left: colX(1), top: 340, width: spanW(7) + 60 }}>
        {react ? (
          <TypedCode
            code={LIKE_BUTTON}
            filename="LikeButton.jsx"
            fontSize={30}
            focus={FOCUS[step] ?? null}
            flash={step >= 6 ? { text: '{likes}', n: flashN } : null}
            style={{ minHeight: 580 }}
          />
        ) : (
          <TypedCode
            code={step === 0 ? '' : step === 1 ? PY_CLASS : PY_CLASS + PY_USAGE}
            lang="python"
            filename="post.py"
            fontSize={30}
            idleCursor={step === 0}
            style={{ minHeight: 580 }}
          />
        )}
      </Swap>

      <div style={{ position: 'absolute', left: colX(8) + 84, top: 340, width: spanW(5) - 84 }}>
        <Swap k={step}>
          {step === 0 && <p className="note">A like button has to remember how many likes it has.</p>}
          {step === 1 && (
            <p className="note">
              Remember Python classes?
              <br />
              <span className="muted">
                <span className="mono">self.likes</span> belongs to one object.
              </span>
            </p>
          )}
          {step === 2 && <p className="note">Two objects, two separate counts.</p>}
          {step === 3 && (
            <p className="note">
              React calls a component&rsquo;s memory <em>state.</em>
            </p>
          )}
          {step === 4 && <Breakdown />}
          {step === 5 && (
            <p className="note">
              On click, call <span className="mono">setLikes</span> with the new number.
              <br />
              <span className="muted">React saves it and redraws the button.</span>
            </p>
          )}
          {step === 6 && (
            <p className="note">
              <span className="mono">{'{likes}'}</span> puts the current value on the button.
            </p>
          )}
          {step === 7 && (
            <p className="note">
              Three buttons, like three objects.
              <br />
              <span className="muted">Each one keeps its own count.</span>
            </p>
          )}
        </Swap>

        {step === 2 && (
          <div style={{ marginTop: 56, display: 'flex', gap: 28 }}>
            <Appear delay={0.9} from={{ opacity: 0, scale: 0.9 }}>
              <MemoryBox value={2} label="a.likes" />
            </Appear>
            <Appear delay={1.1} from={{ opacity: 0, scale: 0.9 }}>
              <MemoryBox value={0} label="b.likes" />
            </Appear>
          </div>
        )}

        {step === 6 && (
          <Appear style={{ marginTop: 56 }} sound="pop">
            <LivePreview>
              <SingleDemo onChange={(n) => n > 0 && setFlashN(n)} />
            </LivePreview>
          </Appear>
        )}

        {step >= 7 && (
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
