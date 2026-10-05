import { useEffect, useRef } from 'react'

const handlers = new Map<string, Set<() => void>>()

/** Returns true if a slide handled the key. */
export function dispatchSlideKey(key: string): boolean {
  const set = handlers.get(key.toLowerCase())
  if (!set || set.size === 0) return false
  set.forEach((fn) => fn())
  return true
}

/** Let the active slide react to a key that the deck does not use (e.g. `h`). */
export function useSlideKey(key: string, handler: () => void) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    const k = key.toLowerCase()
    const fn = () => ref.current()
    if (!handlers.has(k)) handlers.set(k, new Set())
    handlers.get(k)!.add(fn)
    return () => {
      handlers.get(k)!.delete(fn)
    }
  }, [key])
}
