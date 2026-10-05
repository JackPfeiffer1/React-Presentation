import { useState } from 'react'
import { Stamp } from '../components/Appear'
import { LivePreview } from '../components/LivePreview'
import { MaskText } from '../components/MaskText'
import { Swap } from '../components/Swap'
import { TypedCode } from '../components/TypedCode'
import CardV1 from '../demo/CardV1.jsx'
import { useEnterAnim } from '../engine/SlideContext'
import type { SlideProps } from '../engine/types'
import { colX, spanW } from './layout'

const FOLDED = 'function Card() { … }'

function appCode(n: number) {
  return ['<div>', ...Array.from({ length: n }, () => '  <Card />'), '</div>'].join('\n')
}

export function S05Tag({ step }: SlideProps) {
  const anim = useEnterAnim()
  const typedLines = Math.min(step, 3)
  const [shownCards, setShownCards] = useState(anim ? 0 : typedLines)

  return (
    <>
      <Swap k={step >= 4 ? 'own' : 'use'} style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(12) }}>
        <MaskText as="h1" className="h1" text={step >= 4 ? 'Your own *HTML tag.*' : 'Use it like a *tag.*'} />
      </Swap>

      <div style={{ position: 'absolute', left: colX(1), top: 300, width: spanW(7), display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TypedCode code={FOLDED} filename="Card.jsx" fontSize={30} typeIn={false} />
        <TypedCode code={appCode(typedLines)} filename="App.jsx" fontSize={30} speed={30} onDone={() => setShownCards(typedLines)} />
      </div>

      <div style={{ position: 'absolute', left: colX(8) + 24, top: 300, width: spanW(5) - 24 }}>
        <LivePreview>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, minHeight: 3 * 160 + 2 * 24 }}>
            {Array.from({ length: shownCards }, (_, i) => (
              <Stamp key={i}>
                <CardV1 />
              </Stamp>
            ))}
          </div>
        </LivePreview>
      </div>
    </>
  )
}
