import { QRCodeSVG } from 'qrcode.react'
import { Appear } from '../components/Appear'
import { MaskText } from '../components/MaskText'
import { TypedCode } from '../components/TypedCode'
import type { SlideProps } from '../engine/types'
import { colX, spanW } from './layout'

const CHALLENGE = `function Movie(props) {
  // your turn: show props.title
  // and props.year
}

<Movie title="Up" year="2009" />`

export function S11YourTurn({ step }: SlideProps) {
  return (
    <>
      <Appear style={{ position: 'absolute', left: colX(1), top: 120 }}>
        <div className="kicker">Your turn</div>
      </Appear>
      <MaskText as="h1" className="h1" text="react.dev/learn" style={{ position: 'absolute', left: colX(1), top: 170, width: spanW(8) }} />
      <Appear delay={0.3} style={{ position: 'absolute', left: colX(1), top: 320, width: spanW(7) }}>
        <p className="body muted">Edit real examples right in your browser. Nothing to install.</p>
      </Appear>

      <Appear delay={0.2} from={{ opacity: 0, scale: 0.94 }} style={{ position: 'absolute', left: colX(9) + 24, top: 140, width: spanW(4) - 24 }}>
        <div className="qr">
          <QRCodeSVG value="https://react.dev/learn" size={400} bgColor="#F4F2EE" fgColor="#0A0A0A" marginSize={4} level="M" />
        </div>
        <p className="caption" style={{ marginTop: 20 }}>
          Scan to open react.dev/learn
        </p>
      </Appear>

      {step >= 1 && (
        <div style={{ position: 'absolute', left: colX(1), top: 480, width: spanW(7) }}>
          <TypedCode code={CHALLENGE} filename="Challenge.jsx" fontSize={30} speed={55} style={{ background: 'var(--ink-2)' }} />
          <Appear delay={0.4} style={{ marginTop: 28 }}>
            <p className="body">Make three of your favorite movies.</p>
          </Appear>
        </div>
      )}

      {step >= 2 && (
        <Appear style={{ position: 'absolute', left: colX(9) + 24, top: 700, width: spanW(4) - 24 }}>
          <div className="kicker" style={{ color: 'var(--accent)' }}>
            Bonus
          </div>
          <p className="note" style={{ marginTop: 12 }}>
            Add a like button to each movie with <span className="mono" style={{ color: 'var(--accent)' }}>useState</span>.
          </p>
        </Appear>
      )}
    </>
  )
}
