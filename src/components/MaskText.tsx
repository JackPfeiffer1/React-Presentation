import { motion } from 'motion/react'
import type { CSSProperties, ElementType } from 'react'
import { useEnterAnim } from '../engine/SlideContext'
import { easeOutExpo } from '../styles/motion'

type Props = {
  /** Words wrapped in *asterisks* render in italic serif; words in _underscores_ render in the accent color. */
  text: string
  className?: string
  style?: CSSProperties
  as?: ElementType
  delay?: number
  stagger?: number
  duration?: number
  /** Split per letter instead of per word. */
  letters?: boolean
}

function parse(text: string) {
  return text.split(' ').map((raw) => {
    if (/^\*.+\*[.,!?]?$/.test(raw)) return { word: raw.replace(/\*/g, ''), kind: 'em' as const }
    if (/^_.+_[.,!?]?$/.test(raw)) return { word: raw.replace(/_/g, ''), kind: 'accent' as const }
    return { word: raw, kind: 'plain' as const }
  })
}

export function MaskText({ text, className, style, as = 'div', delay = 0, stagger = 0.045, duration = 0.72, letters = false }: Props) {
  const anim = useEnterAnim()
  const Tag = as
  const words = parse(text)
  let index = 0
  return (
    <Tag className={className} style={style} aria-label={text.replace(/[*_]/g, '')}>
      {words.map((w, wi) => {
        const pieces = letters ? [...w.word] : [w.word]
        const inner = pieces.map((piece, pi) => {
          const i = index++
          return (
            <span className="mask-word" key={pi} aria-hidden>
              <motion.span
                initial={anim ? { y: '110%' } : false}
                animate={{ y: '0%' }}
                transition={{ duration, ease: easeOutExpo, delay: delay + i * stagger }}
              >
                {piece}
              </motion.span>
            </span>
          )
        })
        const content = w.kind === 'em' ? <em className="serif-italic">{inner}</em> : w.kind === 'accent' ? <span className="accent-text">{inner}</span> : inner
        return (
          <span key={wi} style={{ whiteSpace: 'nowrap' }}>
            {content}
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </Tag>
  )
}
