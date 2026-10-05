import { motion } from 'motion/react'
import { useEnterAnim } from '../engine/SlideContext'

export function Credit({ children }: { children: string }) {
  const anim = useEnterAnim()
  return (
    <motion.p className="credit" initial={anim ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
      {children}
    </motion.p>
  )
}
