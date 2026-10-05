import { useSyncExternalStore } from 'react'
import { finishAll, isBusy, clearRunning } from './skipRegistry'
import { writeHash } from './hash'

export type NavMode = 'forward' | 'snap'
export type Overlay = 'jump' | 'shortcuts' | null

export type DeckState = {
  slide: number
  step: number
  /** `forward` means the change should animate. `snap` means jump straight to the end state. */
  mode: NavMode
  /** Bumped on every snap so the active slide remounts in its finished state. */
  mountKey: number
  overlay: Overlay
  showProgress: boolean
  soundOn: boolean
}

let lastSteps: number[] = []
let state: DeckState = {
  slide: 0,
  step: 0,
  mode: 'snap',
  mountKey: 0,
  overlay: null,
  showProgress: true,
  soundOn: true,
}
const listeners = new Set<() => void>()

function set(patch: Partial<DeckState>) {
  state = { ...state, ...patch }
  writeHash(state.slide, state.step)
  listeners.forEach((l) => l())
}

export function initDeck(steps: number[], start: { slide: number; step: number } | null) {
  lastSteps = steps
  const slide = Math.min(Math.max(start?.slide ?? 0, 0), steps.length - 1)
  const step = Math.min(Math.max(start?.step ?? 0, 0), steps[slide])
  state = { ...state, slide, step, mode: 'snap' }
  writeHash(slide, step)
}

export function getDeck(): DeckState {
  return state
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDeck(): DeckState {
  return useSyncExternalStore(subscribe, getDeck)
}

export function next() {
  if (isBusy()) {
    finishAll()
    return
  }
  const { slide, step } = state
  if (step < lastSteps[slide]) {
    set({ step: step + 1, mode: 'forward' })
  } else if (slide < lastSteps.length - 1) {
    set({ slide: slide + 1, step: 0, mode: 'forward' })
  }
}

export function prev() {
  clearRunning()
  const { slide, step, mountKey } = state
  if (step > 0) {
    set({ step: step - 1, mode: 'snap', mountKey: mountKey + 1 })
  } else if (slide > 0) {
    set({ slide: slide - 1, step: lastSteps[slide - 1], mode: 'snap', mountKey: mountKey + 1 })
  }
}

export function goTo(slide: number, step = 0) {
  clearRunning()
  const s = Math.min(Math.max(slide, 0), lastSteps.length - 1)
  set({
    slide: s,
    step: Math.min(Math.max(step, 0), lastSteps[s]),
    mode: 'snap',
    mountKey: state.mountKey + 1,
    overlay: null,
  })
}

export function goToEnd() {
  goTo(lastSteps.length - 1, lastSteps[lastSteps.length - 1])
}

export function resetSlide() {
  clearRunning()
  set({ step: 0, mode: 'snap', mountKey: state.mountKey + 1 })
}

export function setOverlay(overlay: Overlay) {
  set({ overlay })
}

export function toggleProgress() {
  set({ showProgress: !state.showProgress })
}

export function setSoundOn(soundOn: boolean) {
  set({ soundOn })
}

export function progressFraction(): number {
  const total = lastSteps.reduce((sum, n) => sum + n + 1, 0)
  const done = lastSteps.slice(0, state.slide).reduce((sum, n) => sum + n + 1, 0) + state.step
  return total <= 1 ? 1 : done / (total - 1)
}
