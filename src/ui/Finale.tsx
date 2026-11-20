import { Building2, Calculator, Droplets, Home, Leaf, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LEVELS } from '../levels/levels'
import { useT } from '../i18n/useT'
import { useGame } from '../store/useGame'
import { activeProfile, totalStars, useProfile } from '../store/useProfile'
import { Avatar, Stars } from './kit'
import { PanelCareModal } from './menu/PanelCareModal'

export function Finale() {
  const t = useT()
  const quitToMenu = useGame((s) => s.quitToMenu)
  const profile = useProfile(activeProfile)
  const [show, setShow] = useState(false)
  const [calc, setCalc] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 2600)
    return () => window.clearTimeout(id)
  }, [])

  if (!show) return null

  const max = LEVELS.length * 3
  const stars = totalStars(profile)
  const rows = [
    { icon: Sun, label: t('finale.effLabel'), value: '100%', note: t('finale.effNote') },
    { icon: Droplets, label: t('finale.lossLabel'), value: '35%', note: t('finale.lossNote') },
    { icon: Building2, label: t('finale.cellsLabel'), value: `${LEVELS.length} / ${LEVELS.length}`, note: t('finale.cellsNote') },
    { icon: Leaf, label: t('finale.energyLabel'), value: t('finale.energyValue'), note: t('finale.energyNote') },
  ]

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:p-8">
      <div className="glass-strong fade-up max-h-[78vh] w-full max-w-[760px] overflow-y-auto rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-[11px] tracking-[0.35em] text-cyan-300">IMPACT TELEMETRY · VISION 2030</div>
            <h2 className="hud-title mt-1 text-xl font-bold text-white sm:text-3xl">{t('finale.title')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCalc(true)}
              className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12px] text-cyan-50/90 hover:text-white"
            >
              <Calculator size={14} /> {t('finale.calc')}
            </button>
            <button
              type="button"
              onClick={quitToMenu}
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[12px]"
            >
              <Home size={14} /> {t('finale.menu')}
            </button>
          </div>
        </div>
        {profile ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] px-3 py-2.5">
            <Avatar index={profile.avatar} size={30} />
            <span className="flex-1 truncate text-[14px] text-white">{profile.name}</span>
            <Stars count={Math.round((stars / max) * 3)} size={16} />
            <span className="text-[12px] text-amber-100/80">{t('finale.stars', { n: stars, max })}</span>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {rows.map(({ icon: Icon, label, value, note }) => (
            <div key={label} className="glass rounded-2xl p-3">
              <Icon size={16} className="text-cyan-300" />
              <div className="mt-2 font-display text-lg text-white sm:text-xl">{value}</div>
              <div className="text-[12px] text-cyan-50/85">{label}</div>
              <div className="mt-1 text-[10px] leading-snug text-cyan-100/50">{note}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-cyan-100/40">{t('finale.disclaimer')}</p>
      </div>
      {calc ? <PanelCareModal onClose={() => setCalc(false)} /> : null}
    </div>
  )
}
