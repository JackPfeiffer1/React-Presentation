import { Appear } from '../components/Appear'
import { MaskText } from '../components/MaskText'
import type { SlideProps } from '../engine/types'
import { colX } from './layout'

const POINTS = [
  { term: 'Component', text: 'A function that returns HTML.' },
  { term: 'Props', text: 'Its arguments.' },
  { term: 'State', text: 'Its memory.' },
]

export function S10Recap({ step }: SlideProps) {
  return (
    <>
      <Appear style={{ position: 'absolute', left: colX(1), top: 120 }}>
        <div className="kicker">Three things</div>
      </Appear>
      <ol className="recap">
        {POINTS.map((p, i) =>
          step > i ? (
            <li key={p.term} className="recap-item">
              <Appear className="recap-num" from={{ opacity: 0, y: 40 }}>
                {i + 1}
              </Appear>
              <div>
                <MaskText className="h2" text={p.term} />
                <MaskText className="recap-text" text={p.text} delay={0.12} />
              </div>
            </li>
          ) : null,
        )}
      </ol>
    </>
  )
}
