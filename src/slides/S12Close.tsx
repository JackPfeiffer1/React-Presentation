import { motion } from 'motion/react'
import { useState } from 'react'
import { Appear } from '../components/Appear'
import { MaskText } from '../components/MaskText'
import { useSlideKey } from '../engine/slideKeys'
import { play } from '../engine/sound'
import type { SlideProps } from '../engine/types'
import { springDrift, springPop } from '../styles/motion'
import { colX, spanW } from './layout'
import { slides } from './index'

const HEART = 'M12 21s-7.5-4.6-9.6-9.3C.9 8.4 2.9 4.5 6.6 4.1c2.1-.2 3.9.9 5.4 2.8 1.5-1.9 3.3-3 5.4-2.8 3.7.4 5.7 4.3 4.2 7.6C19.5 16.4 12 21 12 21z'

const BUILDING_BLOCKS = ['Stage', 'Deck', 'TypedCode', 'CodeLink', 'CardWall', 'Counter', 'ChatToast', 'MaskText', 'LivePreview', 'Card', 'LikeButton']

function Heart({ size, likes, onLike }: { size: number; likes: number; onLike: () => void }) {
  const liked = likes > 0
  return (
    <motion.button
      className="close-heart"
      onClick={onLike}
      onMouseUp={(e) => e.currentTarget.blur()}
      whileTap={{ scale: 0.88 }}
      aria-label="Like"
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        animate={{ scale: [1, 1.06, 1, 1.04, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.14, 0.28, 0.42, 1] }}
      >
        <path d={HEART} fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : 'var(--text-on-ink)'} strokeWidth={1.1} strokeLinejoin="round" />
      </motion.svg>
    </motion.button>
  )
}

export function S12Close({ step }: SlideProps) {
  const [likes, setLikes] = useState(0)
  const like = () => {
    setLikes((n) => n + 1)
    play('pop')
  }
  useSlideKey('h', like)

  const tags = [...slides.map((s) => s.id.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())), ...BUILDING_BLOCKS]

  const heartPos = step === 0 ? { x: 0, y: 0, scale: 1 } : step === 1 ? { x: -600, y: -40, scale: 0.7 } : { x: 0, y: -330, scale: 0.32 }

  return (
    <>
      <motion.div
        style={{ position: 'absolute', left: 960 - 160, top: 540 - 200, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        initial={false}
        animate={heartPos}
        transition={springDrift}
      >
        <Heart size={320} likes={likes} onLike={like} />
        <motion.div className="close-count" animate={{ opacity: likes > 0 && step === 0 ? 1 : 0 }} initial={false}>
          <motion.span key={likes} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={springPop}>
            {likes}
          </motion.span>
        </motion.div>
      </motion.div>

      {step === 0 && (
        <Appear delay={0.4} style={{ position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center' }}>
          <p className="body muted">Next time you tap a heart, remember: it's a component.</p>
        </Appear>
      )}

      {step === 1 && (
        <div style={{ position: 'absolute', left: colX(6), top: 300, width: spanW(7) }}>
          <MaskText as="h2" className="h2" text="Every slide you just saw was a *React component.*" />
          <div className="tag-cloud">
            {tags.map((t, i) => (
              <Appear key={t} as="span" delay={0.5 + i * 0.035} from={{ opacity: 0, y: 12 }} className="mono">
                {`<${t} />`}
              </Appear>
            ))}
          </div>
        </div>
      )}

      {step >= 2 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center' }}>
          <MaskText className="display" text="Thanks." letters stagger={0.04} style={{ fontSize: 280 }} />
          <Appear delay={0.6} style={{ marginTop: 56 }}>
            <p className="caption">jackpfeiffer1.github.io/React-Presentation</p>
          </Appear>
        </div>
      )}
    </>
  )
}
