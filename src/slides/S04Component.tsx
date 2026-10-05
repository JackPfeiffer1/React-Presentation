import { Appear } from '../components/Appear'
import { LivePreview } from '../components/LivePreview'
import { MaskText } from '../components/MaskText'
import { Swap } from '../components/Swap'
import { TypedCode } from '../components/TypedCode'
import CardV1 from '../demo/CardV1.jsx'
import { CARD_V1 } from '../demo/source'
import type { SlideProps } from '../engine/types'
import { colX, spanW } from './layout'

const FOCUS: Record<number, number[] | null> = { 2: [1], 3: [2, 3, 4, 5, 6, 7, 8], 4: [3] }

export function S04Component({ step }: SlideProps) {
  return (
    <>
      <MaskText as="h1" className="h1" text="A component is just a *function.*" style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(12) }} />

      <div style={{ position: 'absolute', left: colX(1), top: 340, width: spanW(7) }}>
        <TypedCode code={step >= 1 ? CARD_V1 : ''} filename="Card.jsx" focus={FOCUS[step] ?? null} idleCursor={step === 0} style={{ minHeight: 580 }} />
      </div>

      <Swap k={step} style={{ position: 'absolute', left: colX(8) + 24, top: 380, width: spanW(5) - 24 }}>
        {step === 2 && (
          <p className="note">
            A normal function.
            <br />
            <span className="muted">Its name starts with a capital letter.</span>
          </p>
        )}
        {step === 3 && (
          <p className="note">
            It hands back HTML.
            <br />
            <span className="muted">That's what shows up on the page.</span>
          </p>
        )}
        {step === 4 && (
          <p className="note">
            One small difference: React spells <span className="mono">class</span> as <span className="mono">className</span>.
          </p>
        )}
        {step === 0 && <p className="note muted">Remember functions? Something goes in, something comes out.</p>}
      </Swap>

      {step >= 5 && (
        <Appear style={{ position: 'absolute', left: colX(8) + 24, top: 340, width: spanW(5) - 24 }} sound="pop" from={{ opacity: 0, y: 40, scale: 0.96 }}>
          <LivePreview>
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
              <CardV1 />
            </div>
          </LivePreview>
          <p className="caption" style={{ marginTop: 32 }}>
            That's it. A function that returns HTML is a component.
          </p>
        </Appear>
      )}
    </>
  )
}
