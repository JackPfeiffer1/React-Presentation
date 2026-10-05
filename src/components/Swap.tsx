import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { useEnterAnim } from '../engine/SlideContext'
import { easeInQuart, easeOutExpo } from '../styles/motion'

/** Cross-swaps its content whenever `k` changes: old content drops away, new content rises in. */
export function Swap({ k, children, className, style }: { k: string | number; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <AnimatePresence mode="wait" initial={false}>
        <SwapItem key={k}>{children}</SwapItem>
      </AnimatePresence>
    </div>
  )
}

function SwapItem({ children }: { children: ReactNode }) {
  const anim = useEnterAnim()
  return (
    <motion.div
      initial={anim ? { opacity: 0, y: 28 } : false}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.18, ease: easeInQuart } }}
    >
      {children}
    </motion.div>
  )
}
