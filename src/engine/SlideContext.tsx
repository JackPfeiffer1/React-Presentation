import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type SlideCtx = {
  /** Whether elements present on the first render should animate in. */
  enterAnimated: boolean
  mounted: { current: boolean }
}

const Ctx = createContext<SlideCtx>({ enterAnimated: false, mounted: { current: true } })

export function SlideScope({ enterAnimated, children }: { enterAnimated: boolean; children: ReactNode }) {
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
  }, [])
  const [value] = useState(() => ({ enterAnimated, mounted }))
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * Should this element animate when it appears?
 * Elements that appear because the presenter pressed "next" animate.
 * Elements that are already there after Back, Reset, a jump or a reload snap into place.
 */
export function useEnterAnim(): boolean {
  const ctx = useContext(Ctx)
  const [anim] = useState(() => (ctx.mounted.current ? true : ctx.enterAnimated))
  return anim
}
