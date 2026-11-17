import { Lock, Play } from 'lucide-react'
import { LEVELS } from '../../levels/levels'
import { formatTime, levelText } from '../../i18n/strings'
import { useLang, useT } from '../../i18n/useT'
import { activeProfile, useProfile } from '../../store/useProfile'
import { Modal, Stars } from '../kit'

const SWATCH = ['#ffb347', '#5ab8ff', '#ff2bd6']

export function LevelSelect({ onClose, onPlay }: { onClose: () => void; onPlay: (index: number) => void }) {
  const t = useT()
  const lang = useLang()
  const profile = useProfile(activeProfile)
  const unlocked = profile?.unlocked ?? 1

  return (
    <Modal title={t('levels.title')} onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((level, i) => {
          const txt = levelText(lang, level.id)
          const locked = i + 1 > unlocked
          const best = profile?.best[level.id]
          return (
            <div
              key={level.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-4 ${locked ? 'border-white/5 bg-white/[0.02]' : 'border-cyan-200/15 bg-white/[0.03]'}`}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-40"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${SWATCH[i]}66, transparent 70%)` }}
              />
              <span className="font-display text-[10px] tracking-[0.35em] text-cyan-200/70">CELL {String(level.id).padStart(2, '0')}</span>
              <span className={`mt-2 text-base font-bold ${locked ? 'text-white/40' : 'text-white'}`}>{txt.name}</span>
              <span className="text-[12px] text-cyan-100/55">{txt.place}</span>
              <div className="mt-3 flex items-center justify-between">
                <Stars count={best?.stars ?? 0} size={14} />
                <span className="text-[11px] text-cyan-100/55">
                  {best ? t('levels.best', { time: formatTime(best.seconds) }) : t('levels.notPlayed')}
                </span>
              </div>
              {locked ? (
                <div className="mt-4 flex items-center gap-2 text-[12px] text-white/45">
                  <Lock size={14} /> {t('levels.locked')}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onPlay(i)}
                  className="btn-primary mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px]"
                >
                  <Play size={14} /> {t('levels.play')}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
