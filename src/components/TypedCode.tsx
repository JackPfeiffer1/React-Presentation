import { diffWordsWithSpace } from 'diff'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { classifyChars, type Lang } from '../engine/highlight'
import { registerRunning } from '../engine/skipRegistry'
import { useEnterAnim } from '../engine/SlideContext'
import { play } from '../engine/sound'

type Char = { ch: string; id: number; fresh: boolean }

type Action =
  | { at: number; kind: 'move'; pos: number }
  | { at: number; kind: 'del'; pos: number }
  | { at: number; kind: 'ins'; pos: number; ch: string }

export type Mark = { id: string; text: string; nth?: number }

type Props = {
  code: string
  lang?: Lang
  filename?: string
  /** 1-based line numbers to focus. Other lines dim. Omit for no focus. */
  focus?: number[] | null
  /** Characters per second while typing. */
  speed?: number
  /** Snap to new code without animating. */
  instant?: boolean
  /** Show the blinking cursor when idle. */
  idleCursor?: boolean
  marks?: Mark[]
  /** Flash every occurrence of `text` whenever `n` changes. */
  flash?: { text: string; n: number } | null
  /** Visible line window; the code scrolls to keep the cursor in view. */
  maxLines?: number
  fontSize?: number
  delay?: number
  onDone?: () => void
  className?: string
  style?: CSSProperties
}

let nextId = 1
const toChars = (s: string, fresh = false): Char[] => [...s].map((ch) => ({ ch, id: nextId++, fresh }))

function buildActions(from: string, to: string, speed: number, startAt: number, cursorStart: number): Action[] {
  const actions: Action[] = []
  const base = 1000 / speed
  let t = startAt
  let pos = 0
  let cursor = cursorStart
  let text = from

  const moveTo = (p: number) => {
    if (p !== cursor) {
      t += Math.abs(p - cursor) > 1 ? 240 : 0
      actions.push({ at: t, kind: 'move', pos: p })
      cursor = p
    }
  }

  for (const part of diffWordsWithSpace(from, to)) {
    const len = part.value.length
    if (part.removed) {
      moveTo(pos + len)
      for (let k = 0; k < len; k++) {
        t += 1000 / 70
        actions.push({ at: t, kind: 'del', pos: pos + len - 1 - k })
      }
      text = text.slice(0, pos) + text.slice(pos + len)
      cursor = pos
    } else if (part.added) {
      moveTo(pos)
      for (let k = 0; k < len; k++) {
        const ch = part.value[k]
        const before = text.slice(0, pos)
        const lineSoFar = before.slice(before.lastIndexOf('\n') + 1)
        const prevCh = before[before.length - 1] ?? ''
        let d = base * (0.6 + Math.random() * 0.8)
        if (ch === ' ' && /^\s*$/.test(lineSoFar)) d = 0
        if (ch === '\n') d = base + 90
        if ('>{;('.includes(prevCh) && ch !== ' ') d += 90
        t += d
        actions.push({ at: t, kind: 'ins', pos, ch })
        text = before + ch + text.slice(pos)
        pos += 1
        cursor = pos
      }
    } else {
      pos += len
    }
  }
  return actions
}

function applyAction(chars: Char[], a: Action): { chars: Char[]; cursor: number } {
  if (a.kind === 'move') return { chars, cursor: a.pos }
  if (a.kind === 'del') return { chars: [...chars.slice(0, a.pos), ...chars.slice(a.pos + 1)], cursor: a.pos }
  return { chars: [...chars.slice(0, a.pos), { ch: a.ch, id: nextId++, fresh: true }, ...chars.slice(a.pos)], cursor: a.pos + 1 }
}

function findRanges(text: string, needle: string, nth?: number): [number, number][] {
  const out: [number, number][] = []
  if (!needle) return out
  let i = text.indexOf(needle)
  let count = 0
  while (i !== -1) {
    if (nth === undefined || nth === count) out.push([i, i + needle.length])
    count++
    i = text.indexOf(needle, i + needle.length)
  }
  return out
}

export function TypedCode({
  code,
  lang = 'jsx',
  filename,
  focus,
  speed = 48,
  instant = false,
  idleCursor = false,
  marks,
  flash,
  maxLines,
  fontSize,
  delay = 0,
  onDone,
  className,
  style,
}: Props) {
  const animOnMount = useEnterAnim()
  const [chars, setChars] = useState<Char[]>(() => (animOnMount ? [] : toChars(code)))
  const [cursor, setCursor] = useState(() => (animOnMount ? 0 : code.length))
  const [running, setRunning] = useState(false)
  const charsRef = useRef(chars)
  const cursorRef = useRef(cursor)
  const finishRef = useRef<(() => void) | null>(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    const current = charsRef.current.map((c) => c.ch).join('')
    if (current === code) return

    finishRef.current?.()

    if (instant) {
      charsRef.current = toChars(code)
      cursorRef.current = code.length
      setChars(charsRef.current)
      setCursor(code.length)
      return
    }

    const actions = buildActions(current, code, speed, delay, cursorRef.current)
    let index = 0
    let raf = 0
    let ticks = 0
    const start = performance.now()
    let unregister = () => {}

    const flush = (upTo: number) => {
      let c = charsRef.current
      let cur = cursorRef.current
      let changed = false
      while (index < actions.length && actions[index].at <= upTo) {
        const r = applyAction(c, actions[index])
        if (actions[index].kind === 'ins' && ++ticks % 3 === 0) play('tick')
        c = r.chars
        cur = r.cursor
        index++
        changed = true
      }
      if (changed) {
        charsRef.current = c
        cursorRef.current = cur
        setChars(c)
        setCursor(cur)
      }
    }

    const done = () => {
      cancelAnimationFrame(raf)
      unregister()
      finishRef.current = null
      setRunning(false)
      onDoneRef.current?.()
    }

    const finish = () => {
      flush(Infinity)
      done()
    }

    const frame = (now: number) => {
      flush(now - start)
      if (index >= actions.length) done()
      else raf = requestAnimationFrame(frame)
    }

    finishRef.current = finish
    unregister = registerRunning(finish)
    setRunning(true)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      unregister()
      if (finishRef.current === finish) finishRef.current = null
    }
  }, [code, instant, speed, delay])

  const text = useMemo(() => chars.map((c) => c.ch).join(''), [chars])
  const classes = useMemo(() => classifyChars(text, lang), [text, lang])

  const markAt = useMemo(() => {
    const arr: (string | undefined)[] = new Array(text.length)
    for (const m of marks ?? []) for (const [a, b] of findRanges(text, m.text, m.nth)) for (let i = a; i < b; i++) arr[i] = m.id
    return arr
  }, [text, marks])

  const flashAt = useMemo(() => {
    const arr: boolean[] = new Array(text.length).fill(false)
    if (flash && flash.n > 0) for (const [a, b] of findRanges(text, flash.text)) for (let i = a; i < b; i++) arr[i] = true
    return arr
  }, [text, flash])

  const lines: { chars: { c: Char; i: number }[]; start: number }[] = [{ chars: [], start: 0 }]
  chars.forEach((c, i) => {
    if (c.ch === '\n') lines.push({ chars: [], start: i + 1 })
    else lines[lines.length - 1].chars.push({ c, i })
  })

  const cursorLine = lines.reduce((acc, l, li) => (cursor >= l.start ? li : acc), 0)
  const focusSet = focus ? new Set(focus) : null
  const showCursor = running || idleCursor

  const lineHeightPx = (fontSize ?? 34) * 1.55
  const offsetLines = maxLines ? Math.max(0, Math.min(cursorLine - Math.floor(maxLines / 2), lines.length - maxLines)) : 0

  const bodyRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.style.transform = `translateY(${-offsetLines * lineHeightPx}px)`
  }, [offsetLines, lineHeightPx])

  const cursorEl = <span className={`code-cursor ${running ? '' : 'idle'}`} key="cursor" />

  return (
    <div className={`code-panel ${className ?? ''}`} style={{ ...(fontSize ? { fontSize } : null), ...style }}>
      {filename && <div className="code-filename">{filename}</div>}
      <div style={maxLines ? { height: maxLines * lineHeightPx, overflow: 'hidden' } : undefined}>
        <div className="code-body" ref={bodyRef} style={{ transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {lines.map((line, li) => (
            <div
              key={li}
              className={`code-line ${focusSet ? (focusSet.has(li + 1) ? 'focus' : 'dim') : ''}`}
            >
              {line.chars.map(({ c, i }) => (
                <span key={flashAt[i] ? `${c.id}-f${flash?.n}` : c.id} data-mark={markAt[i]}>
                  {showCursor && cursor === i && cursorEl}
                  <span className={`tk-${classes[i] ?? 'plain'} ${c.fresh ? 'ch-fresh' : ''} ${flashAt[i] ? 'ch-flash' : ''}`}>{c.ch}</span>
                </span>
              ))}
              {showCursor && cursorLine === li && cursor === line.start + line.chars.length && cursorEl}
              {line.chars.length === 0 && '\u200b'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
