import { motion } from 'motion/react'
import { CREDITS } from '../assets/images'
import { Logo, type LogoName } from '../assets/logos'
import { Appear } from '../components/Appear'
import { Counter } from '../components/Counter'
import { Credit } from '../components/Credit'
import { useEnterAnim } from '../engine/SlideContext'
import type { SlideProps } from '../engine/types'
import { easeOutExpo } from '../styles/motion'
import { colX, spanW } from './layout'

const BARS = [
  { label: 'React', value: 44.7 },
  { label: 'jQuery', value: 23.4 },
  { label: 'Angular', value: 18.2 },
  { label: 'Vue', value: 17.6 },
]
const BAR_MAX = 520

const LOGO_ROW: LogoName[] = ['facebook', 'instagram', 'whatsapp', 'netflix', 'airbnb', 'discord']

function Bar({ label, value, i }: { label: string; value: number; i: number }) {
  const anim = useEnterAnim()
  const isReact = i === 0
  return (
    <div className="bar-row">
      <span className={`bar-label ${isReact ? 'is-react' : ''}`}>{label}</span>
      <div className="bar-track">
        <motion.div
          className="bar"
          style={{ background: isReact ? 'var(--accent)' : '#4A4846', width: (value / BARS[0].value) * BAR_MAX }}
          initial={anim ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: easeOutExpo, delay: 0.1 + i * 0.09 }}
        />
        <span className={`bar-value ${isReact ? 'is-react' : ''}`}>{value.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export function S09Everywhere({ step }: SlideProps) {
  return (
    <>
      <div style={{ position: 'absolute', left: colX(1), top: 120, width: spanW(12) }}>
        <Appear>
          <div className="kicker">Why it's everywhere</div>
        </Appear>
        <div className="timeline">
          <Appear delay={0.15} className="timeline-row">
            <span className="timeline-year">2011</span>
            <span>Built inside Facebook to keep the news feed manageable.</span>
          </Appear>
          <Appear delay={0.3} className="timeline-row">
            <span className="timeline-year">2013</span>
            <span>Given away for free, to everyone.</span>
          </Appear>
        </div>
      </div>

      {step >= 1 && (
        <div style={{ position: 'absolute', left: colX(1) - 12, top: 420, width: spanW(7) }}>
          <Appear from={{ opacity: 0, y: 60 }}>
            <div className="display" style={{ fontSize: 300, lineHeight: 0.9 }}>
              <Counter value={44.7} decimals={1} from={0} suffix="%" />
            </div>
          </Appear>
          <Appear delay={0.5} style={{ marginTop: 32, paddingLeft: 12 }}>
            <p className="body" style={{ maxWidth: 760 }}>
              of developers in Stack Overflow's 2025 survey use React.
            </p>
          </Appear>
        </div>
      )}

      {step >= 2 && (
        <div style={{ position: 'absolute', left: colX(8), top: 440, width: spanW(5) }}>
          {BARS.map((b, i) => (
            <Bar key={b.label} {...b} i={i} />
          ))}
          <Appear delay={0.6} style={{ marginTop: 28 }}>
            <p className="caption">Next.js (20.8%) is built on top of React.</p>
          </Appear>
        </div>
      )}

      {step >= 3 && (
        <div className="logo-row">
          {LOGO_ROW.map((name, i) => (
            <Appear key={name} delay={i * 0.07} from={{ opacity: 0, y: 24 }} style={{ position: 'absolute', left: colX(1 + i * 2) }}>
              <Logo name={name} size={80} />
            </Appear>
          ))}
        </div>
      )}

      <Credit>{step >= 3 ? `${CREDITS.survey} ${CREDITS.logos}` : step >= 1 ? CREDITS.survey : ''}</Credit>
    </>
  )
}
