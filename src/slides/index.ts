import type { SlideDef } from '../engine/types'
import { S01Hook } from './S01Hook'
import { S02Problem } from './S02Problem'
import { S03Cutter } from './S03Cutter'
import { S04Component } from './S04Component'
import { S05Tag } from './S05Tag'
import { S06Props } from './S06Props'
import { S07Payoff } from './S07Payoff'
import { S08State } from './S08State'
import { S09Everywhere } from './S09Everywhere'
import { S10Recap } from './S10Recap'
import { S11YourTurn } from './S11YourTurn'
import { S12Close } from './S12Close'

export const slides: SlideDef[] = [
  { id: 'hook', title: 'Hook: who uses these?', theme: 'ink', lastStep: 6, Component: S01Hook },
  { id: 'problem', title: 'The problem: copy-paste', theme: 'paper', lastStep: 4, enter: 'circle', Component: S02Problem },
  { id: 'cookie-cutter', title: 'The big idea: a cookie cutter', theme: 'paper', lastStep: 2, Component: S03Cutter },
  { id: 'component', title: 'A component is a function', theme: 'paper', lastStep: 5, Component: S04Component },
  { id: 'tag', title: 'Use it like a tag', theme: 'paper', lastStep: 4, Component: S05Tag },
  { id: 'props', title: 'Props are arguments', theme: 'paper', lastStep: 6, Component: S06Props },
  { id: 'payoff', title: 'The payoff: one edit', theme: 'paper', lastStep: 3, Component: S07Payoff },
  { id: 'state', title: 'State: a memory', theme: 'paper', lastStep: 5, Component: S08State },
  { id: 'everywhere', title: "Why it's everywhere", theme: 'ink', lastStep: 3, Component: S09Everywhere },
  { id: 'recap', title: 'Recap', theme: 'paper', lastStep: 4, Component: S10Recap },
  { id: 'your-turn', title: 'Your turn', theme: 'ink', lastStep: 2, Component: S11YourTurn },
  { id: 'close', title: 'Close', theme: 'ink', lastStep: 2, Component: S12Close },
]
