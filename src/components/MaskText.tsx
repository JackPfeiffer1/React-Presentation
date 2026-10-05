import { motion } from 'motion/react'
import { Fragment, type CSSProperties, type ElementType } from 'react'
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

type Kind = 'plain' | 'em' | 'accent'

function parse(text: string) {
  let mode: Kind = 'plain'
  return text.split(' ').map((raw) => {
    let word = raw
    let kind: Kind = mode
    for (const [marker, k] of [['*', 'em'], ['_', 'accent']] as const) {
      if (word.startsWith(marker)) {
        word = word.slice(1)
        kind = k
        mode = k
      }
      const close = new RegExp(`\\${marker}([.,!?]?)$`)
      if (close.test(word)) {
        word = word.replace(close, '$1')
        kind = k
        mode = 'plain'
      }
    }
    return { word, kind }
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
          <Fragment key={wi}>
            <span style={{ whiteSpace: 'nowrap' }}>{content}</span>
            {wi < words.length - 1 ? ' ' : ''}
          </Fragment>
        )
      })}
    </Tag>
  )
}
