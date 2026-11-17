import { useEffect, useState } from 'react'
import { useGame, volatile } from '../store/useGame'

function useViewport() {
  const [vp, setVp] = useState(() => [window.innerWidth, window.innerHeight] as const)
  useEffect(() => {
    const on = () => setVp([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

/**
 * Cinematic black bars. Full 2.39:1 scope for the intro, the dive and the finale,
 * a thinner 2.1:1 frame during play. Both are capped so narrow windows keep their content.
 */
export function Letterbox() {
  const phase = useGame((s) => s.phase)
  const [w, h] = useViewport()
  const scope = phase === 'intro' || phase === 'diving' || phase === 'finale'
  const bar = scope
    ? Math.min(h * 0.12, Math.max(h * 0.06, (h - w / 2.39) / 2))
    : Math.min(h * 0.045, Math.max(0, (h - w / 2.1) / 2))
  const style = {
    transition: 'height 1100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    height: `${bar}px`,
  }
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-10 bg-black" style={style} />
      <div className="absolute inset-x-0 bottom-0 z-10 bg-black" style={style} />
    </>
  )
}

/** Dip-to-black between intro camera shots, driven by the camera director. */
export function ShotFade() {
  const phase = useGame((s) => s.phase)
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!el) return
    let raf = 0
    const tick = () => {
      el.style.opacity = String(volatile.cut)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [el])
  if (phase !== 'intro') return null
  return <div ref={setEl} className="absolute inset-0 z-[5] bg-black" style={{ opacity: 0 }} />
}
