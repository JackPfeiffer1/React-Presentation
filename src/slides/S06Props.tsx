import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { Appear, Stamp } from '../components/Appear'
import { CodeLink } from '../components/CodeLink'
import { LivePreview } from '../components/LivePreview'
import { Swap } from '../components/Swap'
import { TypedCode, type Mark } from '../components/TypedCode'
import CardV1 from '../demo/CardV1.jsx'
import CardV2 from '../demo/CardV2.jsx'
import { CARD_V1, CARD_V2 } from '../demo/source'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { colX, spanW } from './layout'

type CardData = { name: string; role: string; photo: string }

const ADA: CardData = { name: 'Ada Lovelace', role: 'First programmer', photo: 'ada.jpg' }
const GRACE: CardData = { name: 'Grace Hopper', role: 'Navy admiral, coder', photo: 'grace.jpg' }

function usage(p: CardData) {
  return [`<Card name="${p.name}"`, `      role="${p.role}"`, `      photo="${p.photo}" />`].join('\n')
}

const DEF_MARKS: Mark[] = [
  { id: 'def-name', text: '{props.name}' },
  { id: 'def-role', text: '{props.role}' },
]

export function S06Props({ step }: SlideProps) {
  const anim = useEnterAnim()
  const [usageDoneFor, setUsageDoneFor] = useState(anim ? -1 : step)
  const [draft, setDraft] = useState({ name: '', role: '' })
  const [made, setMade] = useState<CardData[]>([])
  const nameRef = useRef<HTMLInputElement>(null)

  const draftCard: CardData = { name: draft.name, role: draft.role, photo: 'you.jpg' }
  const usageCode = step === 3 ? usage(ADA) : step === 4 || step === 5 ? usage(GRACE) : step >= 6 ? usage(draftCard) : ''
  const useMarks: Mark[] = step === 3 ? [
    { id: 'use-name', text: `name="${ADA.name}"` },
    { id: 'use-role', text: `role="${ADA.role}"` },
  ] : []

  const submit = () => {
    if (!draft.name.trim()) return
    setMade((m) => [{ ...draftCard, name: draft.name.trim(), role: draft.role.trim() }, ...m].slice(0, 1))
    setDraft({ name: '', role: '' })
    play('stamp')
    nameRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <>
      {/* Left: the component and how it is used */}
      <div style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(7), display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TypedCode code={step >= 2 ? CARD_V2 : CARD_V1} filename="Card.jsx" fontSize={30} speed={30} marks={DEF_MARKS} typeIn={false} />
        {step >= 3 && (
          <Appear>
            <TypedCode
              code={usageCode}
              filename="App.jsx"
              fontSize={28}
              speed={40}
              instant={step >= 6}
              idleCursor={step >= 6}
              marks={useMarks}
              onDone={() => setUsageDoneFor(step)}
            />
          </Appear>
        )}
      </div>

      {step === 3 && usageDoneFor === 3 && (
        <>
          <CodeLink from="use-name" to="def-name" label={`"${ADA.name}"`} />
          <CodeLink from="use-role" to="def-role" label={`"${ADA.role}"`} delay={1.1} />
        </>
      )}

      {/* Right: notes and the live result */}
      <div style={{ position: 'absolute', left: colX(8) + 24, top: 120, width: spanW(5) - 24 }}>
        <div className="kicker" style={{ marginBottom: 24 }}>
          Props
        </div>
        <Swap k={step <= 0 ? 'a' : step <= 2 ? 'b' : step === 3 ? 'c' : step <= 5 ? 'd' : 'e'}>
          {step === 0 && <p className="note">Three cards, all Ada. Not very useful.</p>}
          {(step === 1 || step === 2) && <Analogy />}
          {step === 3 && (
            <p className="note">
              <span className="mono">{'{ }'}</span> means: plug JavaScript in here.
            </p>
          )}
          {(step === 4 || step === 5) && <p className="note">{step === 4 ? 'Quick prediction. What will this show?' : 'Grace Hopper. Same function, different props.'}</p>}
          {step >= 6 && <p className="note">Your turn. Give me a name and a job.</p>}
        </Swap>
      </div>

      {step !== 1 && step !== 2 && (
        <div style={{ position: 'absolute', left: colX(8) + 24, top: step >= 6 ? 430 : 340, width: spanW(5) - 24 }}>
          <LivePreview>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, minHeight: step === 0 ? 528 : 160 }}>
              {step === 0 && [0, 1, 2].map((i) => <CardV1 key={i} />)}
              {step === 3 && (
                <Stamp key="ada">
                  <CardV2 {...ADA} />
                </Stamp>
              )}
              {step === 4 && (
                <Appear key="placeholder">
                  <div className="card-placeholder">?</div>
                </Appear>
              )}
              {step === 5 && <Reveal key="grace" card={GRACE} />}
              {step >= 6 && (
                <>
                  <div style={{ opacity: draft.name ? 1 : 0.35, transition: 'opacity 200ms' }}>
                    <CardV2 {...draftCard} name={draft.name || 'Name'} role={draft.role || 'Job'} />
                  </div>
                  {made.map((c, i) => (
                    <Stamp key={`${c.name}-${made.length - i}`} silent>
                      <CardV2 {...c} />
                    </Stamp>
                  ))}
                </>
              )}
            </div>
          </LivePreview>
        </div>
      )}

      {step >= 6 && (
        <Appear className="audience-form" style={{ position: 'absolute', left: colX(8) + 24, top: 270, width: spanW(5) - 24 }}>
          <label>
            <span className="kicker">name</span>
            <input ref={nameRef} autoFocus value={draft.name} spellCheck={false} autoComplete="off" onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} onKeyDown={onKeyDown} />
          </label>
          <label>
            <span className="kicker">job</span>
            <input value={draft.role} spellCheck={false} autoComplete="off" onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} onKeyDown={onKeyDown} />
          </label>
        </Appear>
      )}
    </>
  )
}

function Reveal({ card }: { card: CardData }) {
  const anim = useEnterAnim()
  return (
    <motion.div
      initial={anim ? { rotateX: -90, opacity: 0 } : false}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ transformPerspective: 900 }}
      onAnimationStart={() => anim && play('pop')}
    >
      <CardV2 {...card} />
    </motion.div>
  )
}

function Analogy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="kicker" style={{ color: 'var(--muted-on-paper)' }}>
        JavaScript you know
      </div>
      <TypedCode code={'function greet(name) { … }\n\ngreet("Ada")'} fontSize={26} style={{ padding: '28px 36px' }} />
      <div className="kicker" style={{ color: 'var(--muted-on-paper)', marginTop: 16 }}>
        React
      </div>
      <TypedCode code={'function Card(props) { … }\n\n<Card name="Ada" />'} fontSize={26} style={{ padding: '28px 36px' }} />
      <p className="note" style={{ marginTop: 24 }}>
        Props are arguments.
        <br />
        <span className="muted">Same idea, new name.</span>
      </p>
    </div>
  )
}
