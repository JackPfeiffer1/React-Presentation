import { useEffect } from 'react'
import { getDeck, goTo, goToEnd, next, prev, resetSlide, setOverlay, toggleProgress } from './deckStore'
import { toggleSound, unlockSound } from './sound'
import { dispatchSlideKey } from './slideKeys'

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'])
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])
/** Many clickers send these for their "black screen" button. */
const SWALLOW_KEYS = new Set(['.', 'b', 'B'])

function isTextField(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
}

export function toggleFullscreen() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  } catch {
    // Some browsers refuse fullscreen; the deck still works windowed.
  }
}

export function useControls() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      unlockSound()

      if (e.key === 'F5') {
        e.preventDefault()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const active = document.activeElement
      if (isTextField(active)) {
        if (e.key === 'PageDown' || e.key === 'PageUp') {
          e.preventDefault()
          active.blur()
          if (e.key === 'PageDown') next()
          else prev()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          active.blur()
        }
        return
      }

      const { overlay } = getDeck()
      if (overlay) {
        if (e.key === 'Escape' || (overlay === 'jump' && e.key.toLowerCase() === 'g') || (overlay === 'shortcuts' && e.key === '?')) {
          e.preventDefault()
          setOverlay(null)
        }
        return
      }

      if (e.repeat && (NEXT_KEYS.has(e.key) || PREV_KEYS.has(e.key))) {
        e.preventDefault()
        return
      }

      if (NEXT_KEYS.has(e.key)) {
        e.preventDefault()
        next()
        return
      }
      if (PREV_KEYS.has(e.key)) {
        e.preventDefault()
        prev()
        return
      }
      if (SWALLOW_KEYS.has(e.key)) {
        e.preventDefault()
        return
      }

      switch (e.key) {
        case 'Home':
          e.preventDefault()
          goTo(0, 0)
          return
        case 'End':
          e.preventDefault()
          goToEnd()
          return
        case '?':
          e.preventDefault()
          setOverlay('shortcuts')
          return
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          resetSlide()
          return
        case 'g':
          setOverlay('jump')
          return
        case 'f':
          toggleFullscreen()
          return
        case 'm':
          toggleSound()
          return
        case 'p':
          toggleProgress()
          return
      }

      dispatchSlideKey(e.key)
    }

    const onPointer = () => unlockSound()
    window.addEventListener('keydown', onKey, { capture: true })
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey, { capture: true })
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [])
}
