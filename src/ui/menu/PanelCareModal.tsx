import { Building2, Droplets, Leaf, Sun, Waves, Wind, Zap } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { estimate, PRESETS, type Environment } from '../../engine/soiling'
import { formatDays, type StringKey } from '../../i18n/strings'
import { useLang, useT } from '../../i18n/useT'
import { Modal, Segmented } from '../kit'

const ENV_ICON: Record<Environment, typeof Wind> = { desert: Wind, coast: Waves, city: Building2 }

function fmt(n: number, lang: string, digits = 1) {
  if (!Number.isFinite(n)) return '∞'
  return n.toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { maximumFractionDigits: digits })
}

function Field({ label, value, hint, children }: { label: string; value: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3 text-[13px] text-cyan-50/85">
        {label}
        <span className="font-display text-[12px] text-white" dir="ltr">
          {value}
        </span>
      </span>
      {children}
      {hint ? <span className="text-[11px] leading-snug text-cyan-100/45">{hint}</span> : null}
    </label>
  )
}

function Result({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-3">
      <span className="flex items-center gap-1.5 text-[11px] text-cyan-100/60">
        {icon} {label}
      </span>
      <span className={`mt-1 block font-display text-lg ${accent ?? 'text-white'}`} dir="ltr">
        {value}
      </span>
    </div>
  )
}

export function PanelCareModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const [env, setEnv] = useState<Environment>('desert')
  const [kwp, setKwp] = useState(5)
  const [days, setDays] = useState(14)
  const [rate, setRate] = useState(PRESETS.desert.rate)
  const [threshold, setThreshold] = useState(5)
  const r = useMemo(() => estimate({ kwp, days, rate, threshold }), [kwp, days, rate, threshold])
  const preset = PRESETS[env]
  const kwh = t('calc.unit.kwh')
  const kg = t('calc.unit.kg')

  const chooseEnv = (e: Environment) => {
    setEnv(e)
    setRate(PRESETS[e].rate)
  }

  const verdict =
    r.daysToThreshold === 0 ? t('calc.cleanNow') : Number.isFinite(r.daysToThreshold) ? t('calc.cleanIn', { d: formatDays(lang, r.daysToThreshold) }) : t('calc.never')

  return (
    <Modal title={t('calc.title')} onClose={onClose} wide>
      <p className="mb-4 text-[13px] leading-relaxed text-cyan-50/75">{t('calc.intro')}</p>

      <div className="mb-4 flex flex-col gap-2">
        <span className="text-[13px] text-cyan-50/85">{t('calc.env')}</span>
        <Segmented<Environment>
          value={env}
          onChange={chooseEnv}
          options={(['desert', 'coast', 'city'] as Environment[]).map((e) => ({ value: e, label: t(`calc.env.${e}` as StringKey) }))}
        />
        <span className="flex items-start gap-1.5 text-[11px] text-cyan-100/50">
          {(() => {
            const Icon = ENV_ICON[env]
            return <Icon size={13} className="mt-0.5 shrink-0 text-cyan-300/70" />
          })()}
          {t(`calc.envHint.${env}` as StringKey)}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('calc.kwp')} value={`${fmt(kwp, lang)} kWp`} hint={t('calc.kwpHint')}>
          <input type="range" min={0.4} max={20} step={0.2} value={kwp} onChange={(e) => setKwp(Number(e.target.value))} className="accent-cyan-300" aria-label={t('calc.kwp')} />
        </Field>
        <Field label={t('calc.days')} value={`${days}`}>
          <input type="range" min={0} max={90} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="accent-cyan-300" aria-label={t('calc.days')} />
        </Field>
        <Field
          label={t('calc.rate')}
          value={`${fmt(rate, lang, 2)} %/d`}
          hint={t('calc.rateRange', { min: preset.range[0], max: preset.range[1] })}
        >
          <input type="range" min={0.05} max={1} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="accent-cyan-300" aria-label={t('calc.rate')} />
        </Field>
        <Field label={t('calc.threshold')} value={`${threshold}%`}>
          <input type="range" min={2} max={10} step={1} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-cyan-300" aria-label={t('calc.threshold')} />
        </Field>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Result icon={<Sun size={12} />} label={t('calc.loss')} value={`${fmt(r.loss, lang)}%`} accent={r.loss >= threshold ? 'text-amber-300' : 'text-white'} />
        <Result icon={<Zap size={12} />} label={t('calc.lostSoFar')} value={`${fmt(r.lostSoFar, lang)} ${kwh}`} />
        <Result icon={<Leaf size={12} />} label={t('calc.co2SoFar')} value={`${fmt(r.co2SoFar, lang)} ${kg}`} />
        <Result icon={<Droplets size={12} />} label={t('calc.saved')} value={`${fmt(r.savedIfCleanNow, lang)} ${kwh}`} accent="text-cyan-200" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] px-4 py-3">
        <span className={`text-[15px] font-bold ${r.daysToThreshold === 0 ? 'text-amber-200' : 'text-white'}`}>{verdict}</span>
        <span className="text-[12px] text-cyan-100/65">
          {Number.isFinite(r.interval) ? t('calc.interval', { d: formatDays(lang, r.interval) }) : ''}
          {r.co2Saved > 0 ? ` · ${t('calc.co2Saved', { v: fmt(r.co2Saved, lang) })}` : ''}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl bg-white/[0.03] p-3.5">
          <h3 className="mb-2 text-[13px] font-bold text-white">{t('calc.tipsTitle')}</h3>
          <ul className="flex flex-col gap-1.5 text-[12px] leading-relaxed text-cyan-50/70">
            <li>• {t('calc.tip1')}</li>
            <li>• {t('calc.tip2')}</li>
            <li>• {t('calc.tip3')}</li>
          </ul>
        </section>
        <section className="rounded-2xl bg-white/[0.03] p-3.5">
          <h3 className="mb-2 text-[13px] font-bold text-white">{t('calc.assumptions')}</h3>
          <ul className="flex flex-col gap-1.5 text-[11px] leading-relaxed text-cyan-100/55">
            <li>• {t('calc.assumption1')}</li>
            <li>• {t('calc.assumption2')}</li>
            <li>• {t('calc.assumption3')}</li>
            <li>• {t('calc.assumption4')}</li>
          </ul>
        </section>
      </div>
    </Modal>
  )
}
