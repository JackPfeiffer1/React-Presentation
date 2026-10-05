export const easeOutExpo = [0.16, 1, 0.3, 1] as const
export const easeEmphasized = [0.2, 0, 0, 1] as const
export const easeInQuart = [0.5, 0, 0.75, 0] as const

export const springPop = { type: 'spring', stiffness: 520, damping: 28 } as const
export const springStamp = { type: 'spring', stiffness: 700, damping: 22 } as const
export const springDrift = { type: 'spring', stiffness: 120, damping: 20 } as const

export const dur = {
  micro: 0.16,
  standard: 0.42,
  hero: 0.72,
  reveal: 1.4,
} as const

export const stagger = { small: 0.045, large: 0.09 } as const

export const rise = {
  hidden: { opacity: 0, y: 32 },
  shown: { opacity: 1, y: 0, transition: { duration: dur.hero, ease: easeOutExpo } },
}

export const fade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: dur.standard, ease: easeOutExpo } },
}
