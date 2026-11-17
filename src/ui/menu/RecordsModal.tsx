import { Lock, Trophy } from 'lucide-react'
import { LEVELS } from '../../levels/levels'
import { formatTime, levelText } from '../../i18n/strings'
import { useLang, useT } from '../../i18n/useT'
import { ACHIEVEMENTS, activeProfile, useProfile } from '../../store/useProfile'
import { Avatar, Modal, Stars } from '../kit'

export function RecordsModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const profiles = useProfile((s) => s.profiles)
  const activeId = useProfile((s) => s.activeId)
  const active = useProfile(activeProfile)
  const unlockedCount = ACHIEVEMENTS.filter((a) => active?.achievements?.[a]).length

  const sections = LEVELS.map((level) => {
    const rows = profiles
      .filter((p) => p.best[level.id])
      .map((p) => ({ profile: p, rec: p.best[level.id] }))
      .sort((a, b) => b.rec.stars - a.rec.stars || a.rec.seconds - b.rec.seconds || a.rec.rotations - b.rec.rotations)
      .slice(0, 5)
    return { level, rows }
  })
  const empty = sections.every((s) => s.rows.length === 0)

  return (
    <Modal title={t('records.title')} onClose={onClose} wide>
      {active ? (
        <section className="mb-5">
          <h3 className="mb-2 flex items-baseline justify-between">
            <span className="text-[14px] font-bold text-white">{t('ach.title')}</span>
            <span className="font-display text-[11px] text-amber-200/80">
              {t('ach.progress', { n: unlockedCount, max: ACHIEVEMENTS.length })}
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACHIEVEMENTS.map((a) => {
              const got = !!active.achievements?.[a]
              return (
                <div
                  key={a}
                  className={`flex items-start gap-2.5 rounded-xl border p-2.5 ${got ? 'border-amber-300/30 bg-amber-300/[0.06]' : 'border-white/5 bg-white/[0.02]'}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${got ? 'bg-gradient-to-br from-amber-200 to-amber-500 text-black' : 'bg-white/5 text-white/30'}`}
                  >
                    {got ? <Trophy size={13} /> : <Lock size={12} />}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className={`text-[12px] font-medium ${got ? 'text-white' : 'text-white/45'}`}>{t(`ach.${a}.name`)}</span>
                    <span className="text-[10.5px] leading-snug text-cyan-100/50">{t(`ach.${a}.desc`)}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
      <p className="mb-3 text-[12px] text-cyan-100/55">{t('records.note')}</p>
      {empty ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center text-cyan-100/60">
          <Trophy size={28} className="text-cyan-300/60" />
          <span className="text-[13px]">{t('records.empty')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map(({ level, rows }) => (
            <section key={level.id}>
              <h3 className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/70">CELL {String(level.id).padStart(2, '0')}</span>
                <span className="text-[14px] font-bold text-white">{levelText(lang, level.id).name}</span>
              </h3>
              {rows.length === 0 ? (
                <div className="rounded-xl border border-white/5 px-3 py-2.5 text-[12px] text-white/35">—</div>
              ) : (
                <table className="w-full border-separate border-spacing-y-1 text-[13px]">
                  <thead>
                    <tr className="text-[11px] text-cyan-100/45">
                      <th className="w-6 text-start font-normal">#</th>
                      <th className="text-start font-normal">{t('records.player')}</th>
                      <th className="text-center font-normal">{t('records.stars')}</th>
                      <th className="text-center font-normal">{t('records.time')}</th>
                      <th className="text-center font-normal">{t('records.moves')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ profile, rec }, i) => (
                      <tr key={profile.id} className={profile.id === activeId ? 'bg-cyan-300/[0.07]' : 'bg-white/[0.02]'}>
                        <td className="rounded-s-lg px-1 py-2 font-display text-[11px] text-cyan-100/60">{i + 1}</td>
                        <td className="py-2">
                          <span className="flex items-center gap-2">
                            <Avatar index={profile.avatar} size={22} />
                            <span className="truncate text-white/90">{profile.name}</span>
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <Stars count={rec.stars} size={12} />
                        </td>
                        <td className="py-2 text-center font-display text-[12px] text-white/85">{formatTime(rec.seconds)}</td>
                        <td className="rounded-e-lg py-2 text-center font-display text-[12px] text-white/85">{rec.rotations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      )}
    </Modal>
  )
}
