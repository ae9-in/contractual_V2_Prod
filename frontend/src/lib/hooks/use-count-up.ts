"use client"

import { useEffect, useRef, useState } from "react"

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

export function useCountUp(target: number, durationMs = 1500, start = 0, enabled = true) {
  const [value, setValue] = useState(start)
  const raf = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }
    startTime.current = null

    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const t = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(t)
      setValue(start + (target - start) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, durationMs, start, enabled])

  return Math.round(value)
}
