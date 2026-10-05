import { animate } from 'motion'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'

const CARD_W = 440
const CARD_H = 160
const GAP = 32
export const PITCH_X = CARD_W + GAP
export const PITCH_Y = CARD_H + GAP
const END_SCALE = 0.045
const ACCENT = '#58C4DC'

type Tile = HTMLCanvasElement

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function drawCardTile(bordered: boolean): Tile {
  const c = document.createElement('canvas')
  c.width = PITCH_X
  c.height = PITCH_Y
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 20)
  ctx.fill()
  if (bordered) {
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 8
    roundRect(ctx, 4, 4, CARD_W - 8, CARD_H - 8, 17)
    ctx.stroke()
  }
  ctx.fillStyle = '#D9D5CE'
  roundRect(ctx, 28, 24, 112, 112, 14)
  ctx.fill()
  ctx.fillStyle = '#2A2A2A'
  roundRect(ctx, 164, 52, 200, 24, 6)
  ctx.fill()
  ctx.fillStyle = '#B9B5AE'
  roundRect(ctx, 164, 90, 150, 18, 6)
  ctx.fill()
  return c
}

/** Pre-shrunk copies so heavy zoom-outs average instead of shimmering. */
function mipChain(tile: Tile): Tile[] {
  const chain: Tile[] = [tile]
  let cur = tile
  while (cur.width > 4) {
    const next = document.createElement('canvas')
    next.width = Math.max(1, Math.round(cur.width / 2))
    next.height = Math.max(1, Math.round(cur.height / 2))
    const ctx = next.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(cur, 0, 0, next.width, next.height)
    chain.push(next)
    cur = next
  }
  return chain
}

type Props = {
  /** Top-left of the six-card grid, in stage pixels. */
  gridX: number
  gridY: number
  zoomed: boolean
  /** Paint every card's border, spreading out from the middle. */
  ripple?: boolean
  /** Whether the cards are bordered before any ripple. */
  baseBordered?: boolean
  /** The real six DOM cards. They ride the same camera so the hand-off is seamless. */
  children: ReactNode
  onZoomDone?: () => void
}

export function CardWall({ gridX, gridY, zoomed, ripple = false, baseBordered = false, children, onZoomDone }: Props) {
  const anim = useEnterAnim()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const state = useRef({ t: zoomed && !anim ? 1 : 0, r: ripple && !anim ? 1 : 0 })
  const tiles = useRef<{ plain: Tile[]; bordered: Tile[] } | null>(null)
  const onDoneRef = useRef(onZoomDone)
  useEffect(() => {
    onDoneRef.current = onZoomDone
  })

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!tiles.current) tiles.current = { plain: mipChain(drawCardTile(false)), bordered: mipChain(drawCardTile(true)) }
    const ctx = canvas.getContext('2d')!
    const { t, r } = state.current
    const e = t
    const s = Math.exp(Math.log(END_SCALE) * e)
    const gcx = gridX + (2 * PITCH_X - GAP) / 2
    const gcy = gridY + (3 * PITCH_Y - GAP) / 2
    const ax = gcx + (960 - gcx) * e
    const ay = gcy + (540 - gcy) * e

    if (cardsRef.current) {
      cardsRef.current.style.transform = `translate(${ax - gcx}px, ${ay - gcy}px) scale(${s})`
      cardsRef.current.style.transformOrigin = `${gcx}px ${gcy}px`
      cardsRef.current.style.opacity = String(s < 0.04 ? Math.max(0, (s - 0.02) / 0.02) : 1)
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== 1920 * dpr) {
      canvas.width = 1920 * dpr
      canvas.height = 1080 * dpr
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.style.opacity = String(Math.min(1, t / 0.18))
    if (t <= 0) return

    const ox = (gridX - gcx) * s + ax
    const oy = (gridY - gcy) * s + ay
    const cellW = PITCH_X * s * dpr

    const paint = (chain: Tile[]) => {
      let level = 0
      while (level < chain.length - 1 && chain[level + 1].width >= cellW) level++
      const tile = chain[level]
      const pattern = ctx.createPattern(tile, 'repeat')!
      const k = (PITCH_X * s * dpr) / tile.width
      const ky = (PITCH_Y * s * dpr) / tile.height
      pattern.setTransform(new DOMMatrix().translate(ox * dpr, oy * dpr).scale(k, ky))
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    paint(baseBordered ? tiles.current.bordered : tiles.current.plain)
    if (r > 0 && !baseBordered) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(ax * dpr, ay * dpr, r * 1300 * dpr, 0, Math.PI * 2)
      ctx.clip()
      paint(tiles.current.bordered)
      ctx.restore()
    }
    // The real cards sit on top; clear the canvas under them so nothing peeks through while large.
    if (s > 0.04) {
      ctx.clearRect(ox * dpr - 8, oy * dpr - 8, (2 * PITCH_X - GAP) * s * dpr + 16, (3 * PITCH_Y - GAP) * s * dpr + 16)
    }
  }

  const drawRef = useRef(draw)
  drawRef.current = draw

  useLayoutEffect(() => {
    drawRef.current()
  })

  useEffect(() => {
    const target = zoomed ? 1 : 0
    if (state.current.t === target) return
    const controls = animate(state.current.t, target, {
      duration: 2.2,
      ease: [0.45, 0, 0.1, 1],
      onUpdate: (v) => {
        state.current.t = v
        drawRef.current()
      },
    })
    const finish = () => {
      controls.stop()
      state.current.t = target
      drawRef.current()
      onDoneRef.current?.()
    }
    const unregister = registerRunning(finish)
    void controls.finished.then(() => {
      unregister()
      onDoneRef.current?.()
    })
    return () => {
      controls.stop()
      unregister()
    }
  }, [zoomed])

  useEffect(() => {
    const target = ripple ? 1 : 0
    if (state.current.r === target) return
    const controls = animate(state.current.r, target, {
      duration: 1.6,
      ease: [0.5, 0, 0.75, 0],
      onUpdate: (v) => {
        state.current.r = v
        drawRef.current()
      },
    })
    const unregister = registerRunning(() => {
      controls.stop()
      state.current.r = target
      drawRef.current()
    })
    void controls.finished.then(unregister)
    return () => {
      controls.stop()
      unregister()
    }
  }, [ripple])

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, pointerEvents: 'none' }} />
      <div ref={cardsRef} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        {children}
      </div>
    </>
  )
}
