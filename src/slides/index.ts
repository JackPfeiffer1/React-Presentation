import type { SlideDef } from '../engine/types'
import { S04Component } from './S04Component'
import { S05Tag } from './S05Tag'
import { S06Props } from './S06Props'

export const slides: SlideDef[] = [
  { id: 'component', title: 'A component is a function', theme: 'paper', lastStep: 5, Component: S04Component },
  { id: 'tag', title: 'Use it like a tag', theme: 'paper', lastStep: 4, Component: S05Tag },
  { id: 'props', title: 'Props', theme: 'paper', lastStep: 6, Component: S06Props },
]
