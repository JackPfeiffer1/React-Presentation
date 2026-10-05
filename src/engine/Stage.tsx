import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Theme } from './types'

const W = 1920
const H = 1080

function useStageScale() {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return scale
}

function useCursorAutoHide(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let timer = 0
    const el = ref.current
    if (!el) return
    const show = () => {
      el.classList.remove('cursor-hidden')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => el.classList.add('cursor-hidden'), 2000)
    }
    show()
    window.addEventListener('mousemove', show)
    window.addEventListener('pointerdown', show)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('mousemove', show)
      window.removeEventListener('pointerdown', show)
    }
  }, [ref])
}

type WakeLockSentinelLike = { release: () => Promise<void> }

function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinelLike | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }
    const request = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === 'visible') lock = await nav.wakeLock.request('screen')
      } catch {
        lock = null
      }
    }
    void request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [])
}

export const themeBg: Record<Theme, string> = { ink: '#0A0A0A', paper: '#F4F2EE' }

export function Stage({ theme, children }: { theme: Theme; children: ReactNode }) {
  const scale = useStageScale()
  const ref = useRef<HTMLDivElement>(null)
  useCursorAutoHide(ref)
  useWakeLock()
  return (
    <div ref={ref} className="viewport" style={{ backgroundColor: themeBg[theme] }}>
      <div className="stage" style={{ transform: `scale(${scale}) translate(-50%, -50%)` }}>
        {children}
      </div>
    </div>
  )
}
