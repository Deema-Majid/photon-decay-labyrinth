import { ArrowLeft, ArrowRight, CheckCircle2, Home, RotateCcw, Trophy } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { formatTime, levelText } from '../i18n/strings'
import { useLang, useT } from '../i18n/useT'
import { useGame } from '../store/useGame'
import { Stars } from './kit'

export function LevelClear() {
  const t = useT()
  const lang = useLang()
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const stats = useGame((s) => s.stats)
  const result = useGame((s) => s.lastResult)
  const nextLevel = useGame((s) => s.nextLevel)
  const retryLevel = useGame((s) => s.retryLevel)
  const quitToMenu = useGame((s) => s.quitToMenu)
  const isLast = levelIndex + 1 >= LEVELS.length
  const txt = levelText(lang, level.id)
  const Forward = lang === 'ar' ? ArrowLeft : ArrowRight

  const tiles: [string, string | number][] = [
    [t('clear.time'), formatTime(result?.seconds ?? 0)],
    [t('clear.rotations'), result?.rotations ?? stats.rotations],
    [t('clear.burned'), stats.burned],
    [t('clear.shattered'), stats.shattered],
  ]

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-strong fade-up w-full max-w-[520px] rounded-3xl p-5 text-center sm:p-7">
        <div className="flex items-center justify-center gap-2 text-cyan-300">
          <CheckCircle2 size={18} />
          <span className="font-display text-[11px] tracking-[0.35em]">CELL RESTORED</span>
        </div>
        <h2 className="hud-title mt-3 text-2xl font-bold text-white sm:text-3xl">{txt.name}</h2>
        <p className="mt-1 text-sm text-cyan-100/60">
          {txt.place} · {txt.altName}
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Stars count={result?.stars ?? 1} size={30} />
          {result?.newRecord ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/15 px-3 py-1 text-[12px] text-amber-200">
              <Trophy size={13} /> {t('clear.newRecord')}
            </span>
          ) : null}
          <span className="text-[11px] text-cyan-100/45">
            {t('clear.par', { s: level.par.seconds, r: level.par.rotations })}
          </span>
          {result && result.hintsUsed > 0 ? (
            <span className="text-[11px] text-amber-200/70">{t('hint.used', { n: result.hintsUsed })}</span>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {tiles.map(([label, value]) => (
            <div key={label} className="glass rounded-xl px-1 py-2.5 sm:p-3">
              <div className="font-display text-lg text-white sm:text-xl">{value}</div>
              <div className="text-[10px] text-cyan-100/60 sm:text-[11px]">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-cyan-50/75 sm:text-sm">
          {isLast ? t('clear.bodyLast') : t('clear.body')}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={quitToMenu}
            className="glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] text-cyan-100/80 hover:text-white"
          >
            <Home size={14} /> {t('clear.menu')}
          </button>
          <button
            type="button"
            onClick={retryLevel}
            className="glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] text-cyan-100/80 hover:text-white"
          >
            <RotateCcw size={14} /> {t('clear.retry')}
          </button>
          <button
            type="button"
            autoFocus
            onClick={nextLevel}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs tracking-[0.2em]"
          >
            {isLast ? t('clear.impact') : t('clear.next')}
            <Forward size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
