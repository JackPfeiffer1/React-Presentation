type Finish = () => void

const running = new Set<Finish>()

/** Register a running animation. Returns an unregister function. */
export function registerRunning(finish: Finish): () => void {
  running.add(finish)
  return () => {
    running.delete(finish)
  }
}

export function isBusy(): boolean {
  return running.size > 0
}

/** Jump every running animation to its end state. */
export function finishAll(): void {
  const all = [...running]
  running.clear()
  for (const finish of all) {
    try {
      finish()
    } catch (err) {
      console.error(err)
    }
  }
}

export function clearRunning(): void {
  running.clear()
}
