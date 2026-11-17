import { useEffect, useState } from 'react'
import { WAVELENGTHS } from '../levels/types'
import { levelText, translate, type Lang } from '../i18n/strings'
import { useLang, useT } from '../i18n/useT'
import { useGame, type LumenMsg } from '../store/useGame'

function renderLumen(lang: Lang, msg: LumenMsg | undefined) {
  if (!msg) return translate(lang, 'lumen.ready')
  if (msg.levelId) {
    const l = levelText(lang, msg.levelId)
    return translate(lang, 'lumen.levelIntro', { name: l.name, place: l.place, intro: l.intro })
  }
  if (msg.wl) {
    return translate(lang, msg.key, {
      wl: translate(lang, `wl.${msg.wl}.name`),
      nm: WAVELENGTHS[msg.wl].nm,
      hint: translate(lang, `wl.${msg.wl}.hint`),
    })
  }
  return translate(lang, msg.key, msg.params)
}

function Typed({ text, cps = 60 }: { text: string; cps?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setN((v) => {
        if (v + 1 >= text.length) window.clearInterval(id)
        return v + 1
      })
    }, 1000 / cps)
    return () => window.clearInterval(id)
  }, [text, cps])
  return (
    <>
      {text.slice(0, n)}
      <span className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-cyan-300/80 align-middle" />
    </>
  )
}

export function LumenPanel() {
  const t = useT()
  const lang = useLang()
  const lumen = useGame((s) => s.lumen)
  const last = lumen[lumen.length - 1]
  const text = renderLumen(lang, last)

  return (
    <div className="pointer-events-auto absolute inset-x-2 bottom-2 z-20 fade-up sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[420px]">
      <div className="glass scanline relative overflow-hidden rounded-2xl p-3 sm:p-4" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="orb h-7 w-7 shrink-0 rounded-full sm:h-9 sm:w-9" />
          <div className="flex flex-col">
            <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/80">LUMEN · A.I.</span>
            <span className="text-[11px] text-cyan-100/55">{t('lumen.role')}</span>
          </div>
        </div>
        <p className="mt-2 min-h-[2.6rem] text-[12.5px] leading-relaxed text-cyan-50/90 sm:mt-3 sm:min-h-[3.2rem] sm:text-[13.5px]">
          <Typed key={`${last?.id ?? 0}-${lang}`} text={text} />
        </p>
      </div>
    </div>
  )
}
