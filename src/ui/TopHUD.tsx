import { Flame, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WAVELENGTHS, type Wavelength } from '../levels/types'
import { useGame } from '../store/useGame'

const ORDER: Wavelength[] = ['ir', 'vis', 'uv']
const ICONS = { ir: Flame, vis: Zap, uv: Sparkles }

export function TopHUD() {
  const active = useGame((s) => s.wavelength)
  const setWavelength = useGame((s) => s.setWavelength)
  const [just, setJust] = useState<Wavelength | null>(null)

  useEffect(() => {
    setJust(active)
    const id = window.setTimeout(() => setJust(null), 650)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div className="pointer-events-auto absolute top-4 left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 fade-up" dir="ltr">
      <div className="glass flex items-center gap-1.5 rounded-2xl p-1.5 sm:gap-2 sm:p-2">
        <div className="hidden items-center gap-2 px-3 lg:flex" dir="rtl">
          <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/70">PHOTON</span>
          <span className="text-xs text-cyan-100/60">طول الموجة</span>
        </div>
        <div className="hidden h-7 w-px bg-cyan-200/15 lg:block" />
        {ORDER.map((wl) => {
          const meta = WAVELENGTHS[wl]
          const Icon = ICONS[wl]
          return (
            <button
              key={wl}
              type="button"
              className="wl-btn flex items-center gap-2 rounded-xl px-2.5 py-2 text-left sm:gap-3 sm:px-3"
              style={{ ['--c' as string]: meta.color }}
              data-active={active === wl}
              data-just={just === wl}
              onClick={() => setWavelength(wl)}
              title={`${meta.name} — مفتاح ${meta.key}`}
            >
              <span className="ripple" />
              <span className="dot h-2 w-2 rounded-full" />
              <Icon size={16} strokeWidth={1.8} style={{ color: meta.color }} />
              <span className="flex flex-col leading-tight" dir="rtl">
                <span className="text-[13px] font-medium text-white/90">{meta.name}</span>
                <span className="hidden font-display text-[9px] tracking-[0.18em] text-white/50 sm:block">{meta.nm}</span>
              </span>
              <kbd className="ml-1 hidden rounded border border-white/15 px-1.5 py-0.5 font-display text-[9px] text-white/50 sm:inline">
                {meta.key}
              </kbd>
            </button>
          )
        })}
      </div>
    </div>
  )
}
