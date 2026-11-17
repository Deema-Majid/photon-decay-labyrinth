import { Pause, Volume2, VolumeX } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { levelText } from '../i18n/strings'
import { useLang, useT } from '../i18n/useT'
import { useGame } from '../store/useGame'
import { useProfile } from '../store/useProfile'

export function StatusBar() {
  const t = useT()
  const lang = useLang()
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const restoration = useGame((s) => s.restoration)
  const phase = useGame((s) => s.phase)
  const setPaused = useGame((s) => s.setPaused)
  const muted = useProfile((s) => s.settings.muted)
  const setSettings = useProfile((s) => s.setSettings)
  const pct = Math.round((phase === 'clear' ? 1 : restoration) * 100)
  const txt = levelText(lang, level.id)

  return (
    <div
      className="pointer-events-auto absolute top-[68px] left-2 z-20 flex items-start gap-2 fade-up sm:top-24 sm:left-4 xl:top-4"
      dir="ltr"
    >
      <div className="glass w-[min(52vw,250px)] rounded-2xl p-2.5 sm:p-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <span className="font-display text-[9px] tracking-[0.3em] text-cyan-200/80 sm:text-[10px]">
            CELL {String(levelIndex + 1).padStart(2, '0')} / {String(LEVELS.length).padStart(2, '0')}
          </span>
          <span className="font-display text-[10px] tracking-[0.2em] text-white/70">{pct}%</span>
        </div>
        <div className="mt-1 truncate text-[13px] font-medium text-white/90 sm:text-sm">{txt.name}</div>
        <div className="hidden truncate text-[11px] text-cyan-100/60 sm:block">
          {txt.place} · {txt.altName}
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="meter h-full rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 hidden text-[10px] text-cyan-100/50 sm:block">{t('hud.efficiency')}</div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setPaused(true)}
          disabled={phase !== 'playing'}
          aria-label={t('hud.pause')}
          title={`${t('hud.pause')} · Esc`}
          className="glass rounded-xl p-2.5 text-cyan-100/80 transition hover:text-white disabled:opacity-40"
        >
          <Pause size={16} />
        </button>
        <button
          type="button"
          onClick={() => setSettings({ muted: !muted })}
          aria-label={muted ? t('hud.unmute') : t('hud.mute')}
          title={muted ? t('hud.unmute') : t('hud.mute')}
          className="glass rounded-xl p-2.5 text-cyan-100/80 transition hover:text-white"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  )
}
