import { motion } from 'motion/react'
import { useEffect } from 'react'
import { img } from '../assets/images'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'

export function ChatToast({ message, sender = 'Boss', time = 'now' }: { message: string; sender?: string; time?: string }) {
  const anim = useEnterAnim()
  useEffect(() => {
    if (anim) play('ding')
  }, [anim])
  return (
    <motion.div
      className="chat-toast"
      initial={anim ? { opacity: 0, x: 80, y: -12, scale: 0.96 } : false}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <img src={img('boss.jpg')} alt="" className="chat-avatar" />
      <div className="chat-content">
        <div className="chat-head">
          <span className="chat-sender">{sender}</span>
          <span className="chat-time">{time}</span>
        </div>
        <div className="chat-message">{message}</div>
      </div>
    </motion.div>
  )
}
