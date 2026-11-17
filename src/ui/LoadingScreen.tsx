import { useEffect, useState } from 'react'
import { useT } from '../i18n/useT'
import { volatile } from '../store/useGame'

/**
 * Covers the first frames while WebGL compiles every shader (several seconds on phones).
 * The spinner animates on the compositor, so it keeps turning while the main thread is busy.
 */
export function LoadingScreen() {
  const t = useT()
  const [state, setState] = useState<'on' | 'fading' | 'off'>('on')

  useEffect(() => {
    let raf = 0
    let readyAt = 0
    const tick = () => {
      if (volatile.frames >= 4 && !readyAt) {
        readyAt = performance.now()
        setState('fading')
      }
      if (readyAt && performance.now() - readyAt > 900) {
        setState('off')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (state === 'off') return null

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[#06080c]"
      style={{ opacity: state === 'fading' ? 0 : 1, transition: 'opacity 900ms ease' }}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border border-cyan-300/15" />
        <div className="loader-ring absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-300" />
        <div className="orb absolute inset-[22px] rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[11px] tracking-[0.45em] text-cyan-200/80">PHOTON DECAY LABYRINTH</span>
        <span className="text-[13px] text-cyan-50/60">{t('loading.text')}</span>
      </div>
    </div>
  )
}
