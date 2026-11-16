import { useEffect, useRef } from 'react'
import { volatile } from '../store/useGame'

/** White-out flash while the camera passes through the panel surface. */
export function DiveFlash() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = (performance.now() - volatile.diveStart) / 2800
      const peak = 0.5
      const a = Math.max(0, 1 - Math.abs(p - peak) / 0.14)
      if (el.current) el.current.style.opacity = String(Math.min(1, a * a))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div
      ref={el}
      className="absolute inset-0 bg-white"
      style={{ opacity: 0, mixBlendMode: 'screen' }}
    />
  )
}
