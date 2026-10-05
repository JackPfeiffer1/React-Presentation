import { motion } from 'motion/react'
import { useState } from 'react'
import { Appear } from '../components/Appear'
import { CardWall, PITCH_Y } from '../components/CardWall'
import { ChatToast } from '../components/ChatToast'
import { Counter } from '../components/Counter'
import { MaskText } from '../components/MaskText'
import { Swap } from '../components/Swap'
import { TypedCode } from '../components/TypedCode'
import CardV2 from '../demo/CardV2.jsx'
import CardV3 from '../demo/CardV3.jsx'
import { PEOPLE } from '../demo/people'
import { CARD_V2, CARD_V3 } from '../demo/source'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { cardPos, GRID_X, GRID_Y } from './S02Problem'
import { colX, spanW } from './layout'

export function S07Payoff({ step }: SlideProps) {
  const anim = useEnterAnim()
  const [edited, setEdited] = useState(step >= 2 && !anim)
  const [rippleCards] = useState(!edited)

  const onDone = () => {
    if (step >= 2 && !edited) {
      setEdited(true)
      play('stamp')
    }
  }

  const Card = edited ? CardV3 : CardV2

  return (
    <>
      <div style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(5), zIndex: 5 }}>
        <Swap k={step >= 3 ? 'c' : edited ? 'b' : 'a'}>
          {!edited && step < 3 && <MaskText as="h2" className="h2" text="Same six cards. Now built with *React.*" />}
          {edited && step < 3 && <MaskText as="div" className="display" text="One." style={{ fontSize: 200 }} />}
          {step >= 3 && <MaskText as="h2" className="h2" text="Not six. Not a million. *One.*" />}
        </Swap>
      </div>

      <motion.div
        style={{ position: 'absolute', left: colX(1), top: 340, width: spanW(5) }}
        animate={{ opacity: step >= 3 ? 0 : 1, y: step >= 3 ? 20 : 0 }}
        initial={false}
        transition={{ duration: 0.4 }}
      >
        <TypedCode code={step >= 2 ? CARD_V3 : CARD_V2} filename="Card.jsx" fontSize={26} speed={14} focus={step === 2 ? [3] : null} typeIn={false} onDone={onDone} />
      </motion.div>

      <CardWall gridX={GRID_X} gridY={GRID_Y} zoomed={step >= 3} ripple={step >= 3}>
        {PEOPLE.map((p, i) => (
          <div key={p.id} style={{ position: 'absolute', ...cardPos(i), ['--d' as string]: `${i * 70}ms` }} className={`ripple-card ${rippleCards ? 'go' : ''}`}>
            <Card name={p.name} role={p.role} photo={p.photo} />
          </div>
        ))}
      </CardWall>

      {(step === 1 || step === 2) && <ChatToast message="Put a border on every card. Thanks!" />}

      {edited && (
        <Appear
          key={step >= 3 ? 'wall' : 'grid'}
          className="edits-counter"
          style={{
            position: 'absolute',
            left: step >= 3 ? colX(1) : GRID_X,
            top: step >= 3 ? 330 : GRID_Y + 3 * PITCH_Y + 24,
            zIndex: 5,
          }}
        >
          <span className="label">Edits</span>
          <span className="value">
            <Counter value={1} from={1} />
          </span>
        </Appear>
      )}
    </>
  )
}
