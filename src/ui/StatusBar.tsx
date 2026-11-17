import { Clock, Lightbulb, Pause, RotateCw, Target, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { LEVELS } from '../levels/levels'
import { formatTime, levelText } from '../i18n/strings'
import { useLang, useT } from '../i18n/useT'
import { useGame, volatile } from '../store/useGame'
import { useProfile } from '../store/useProfile'

/** Updates its own text every frame so the HUD does not re-render 60 times a second. */
function LiveClock({ par }: { par: number }) {
  const t = useT()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const s = useGame.getState()
      const el = ref.current
      if (el) {
        if (!s.stats.startedAt) {
          el.textContent = '0:00'
          el.title = t('hud.clockWaiting')
          el.dataset.state = 'waiting'
        } else {
          const now = s.paused ? volatile.pauseStart : performance.now()
          const secs = (now - s.stats.startedAt) / 1000
          el.textContent = formatTime(secs)
          el.title = ''
          el.dataset.state = secs > par ? 'over' : 'ok'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [par, t])
  return <span ref={ref} className="hud-num font-display">0:00</span>
}

export function StatusBar() {
  const t = useT()
  const lang = useLang()
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const restoration = useGame((s) => s.restoration)
  const phase = useGame((s) => s.phase)
  const rotations = useGame((s) => s.stats.rotations)
  const hintsUsed = useGame((s) => s.stats.hintsUsed)
  const runtime = useGame((s) => s.runtime)
  const setPaused = useGame((s) => s.setPaused)
  const takeHint = useGame((s) => s.takeHint)
  const muted = useProfile((s) => s.settings.muted)
  const setSettings = useProfile((s) => s.setSettings)
  const pct = Math.round((phase === 'clear' ? 1 : restoration) * 100)
  const txt = levelText(lang, level.id)
  const receivers = level.cells.filter((c) => c.kind === 'receiver')
  const locked = receivers.filter((c) => runtime[c.id]?.locked).length
  const overMoves = rotations > level.par.rotations

  return (
    <div
      className="pointer-events-auto absolute top-[68px] left-2 z-20 flex items-start gap-2 fade-up sm:top-24 sm:left-4 xl:top-4"
      dir="ltr"
    >
      <div className="glass w-[min(56vw,260px)] rounded-2xl p-2.5 sm:p-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
        {/* objectives: each value is shown against its star target */}
        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-cyan-100/60" dir="ltr">
          <span className="flex items-center gap-1" title={`${t('hud.time')} ≤ ${formatTime(level.par.seconds)}`}>
            <Clock size={11} className="shrink-0 text-cyan-300/70" />
            <LiveClock par={level.par.seconds} />
          </span>
          <span className="flex items-center gap-1" title={`${t('hud.rotations')} ≤ ${level.par.rotations}`}>
            <RotateCw size={11} className="shrink-0 text-cyan-300/70" />
            <span className={`font-display ${overMoves ? 'text-amber-300' : 'text-white/85'}`}>
              {rotations}
              <span className="text-cyan-100/40">/{level.par.rotations}</span>
            </span>
          </span>
          <span className="flex items-center gap-1" title={t('hud.receivers')}>
            <Target size={11} className="shrink-0 text-cyan-300/70" />
            <span className="font-display text-white/85">
              {locked}
              <span className="text-cyan-100/40">/{receivers.length}</span>
            </span>
          </span>
        </div>
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
        <button
          type="button"
          onClick={takeHint}
          disabled={phase !== 'playing'}
          aria-label={t('hint.button')}
          title={`${t('hint.button')} · H — ${t('hint.penalty')}`}
          className="glass relative rounded-xl p-2.5 text-amber-200/80 transition hover:text-amber-100 disabled:opacity-40"
        >
          <Lightbulb size={16} />
          {hintsUsed > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 font-display text-[9px] text-black">
              {hintsUsed}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
