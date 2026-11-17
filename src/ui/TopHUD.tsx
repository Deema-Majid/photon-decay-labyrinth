import { Flame, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { WAVELENGTHS, type Wavelength } from '../levels/types'
import { useLang, useT } from '../i18n/useT'
import { useGame } from '../store/useGame'

const ORDER: Wavelength[] = ['ir', 'vis', 'uv']
const ICONS = { ir: Flame, vis: Zap, uv: Sparkles }

export function TopHUD() {
  const t = useT()
  const lang = useLang()
  const active = useGame((s) => s.wavelength)
  const setWavelength = useGame((s) => s.setWavelength)
  const tipWl = useGame((s) => s.tipWl)
  const [just, setJust] = useState<Wavelength | null>(null)
  const textDir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    setJust(active)
    const id = window.setTimeout(() => setJust(null), 650)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div
      className="pointer-events-auto absolute top-3 left-1/2 z-20 max-w-[calc(100vw-1rem)] -translate-x-1/2 fade-up sm:top-4"
      dir="ltr"
    >
      <div className="glass flex items-center gap-1 rounded-2xl p-1 sm:gap-2 sm:p-2">
        <div className="hidden items-center gap-2 px-3 lg:flex" dir={textDir}>
          <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/70">PHOTON</span>
          <span className="text-xs text-cyan-100/60">{t('hud.wavelength')}</span>
        </div>
        <div className="hidden h-7 w-px bg-cyan-200/15 lg:block" />
        {ORDER.map((wl) => {
          const meta = WAVELENGTHS[wl]
          const Icon = ICONS[wl]
          const name = t(`wl.${wl}.name`)
          const cssVars = { '--c': meta.color } as CSSProperties
          return (
            <button
              key={wl}
              type="button"
              className="wl-btn flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-left sm:gap-3 sm:px-3"
              style={cssVars}
              data-active={active === wl}
              data-just={just === wl}
              data-tip={tipWl === wl && active !== wl}
              aria-pressed={active === wl}
              onClick={() => setWavelength(wl)}
              title={`${name} · ${t('hud.key')} ${meta.key}`}
            >
              <span className="ripple" />
              <span className="dot hidden h-2 w-2 rounded-full sm:block" />
              <Icon size={16} strokeWidth={1.8} style={{ color: meta.color }} />
              <span className="flex flex-col leading-tight" dir={textDir}>
                <span className="whitespace-nowrap text-[12px] font-medium text-white/90 sm:text-[13px]">{name}</span>
                <span className="hidden font-display text-[9px] tracking-[0.18em] text-white/50 sm:block">{meta.nm}</span>
              </span>
              <kbd className="ml-1 hidden rounded border border-white/15 px-1.5 py-0.5 font-display text-[9px] text-white/50 md:inline">
                {meta.key}
              </kbd>
            </button>
          )
        })}
      </div>
    </div>
  )
}
