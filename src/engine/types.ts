import type { ComponentType } from 'react'

export type Theme = 'ink' | 'paper'

export type SlideProps = {
  step: number
}

export type SlideDef = {
  id: string
  title: string
  theme: Theme
  /** Index of the last step. A slide with `lastStep: 3` has steps 0, 1, 2, 3. */
  lastStep: number
  /** How this slide is revealed when arriving from the previous slide. */
  enter?: 'wipe' | 'circle'
  Component: ComponentType<SlideProps>
}
