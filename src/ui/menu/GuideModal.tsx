import {
  CircleDot,
  Flame,
  Gem,
  Keyboard,
  Lightbulb,
  MousePointerClick,
  Pause,
  Radio,
  RectangleVertical,
  Square,
  Star,
  Target,
  Tornado,
  Wind,
  Zap,
  Sparkles,
  Orbit,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { WAVELENGTHS, type Wavelength } from '../../levels/types'
import type { StringKey } from '../../i18n/strings'
import { useT } from '../../i18n/useT'
import { Modal } from '../kit'

const ELEMENTS: { id: string; icon: LucideIcon; color: string }[] = [
  { id: 'emitter', icon: Radio, color: '#9ff8ff' },
  { id: 'prism', icon: RectangleVertical, color: '#d6f3ff' },
  { id: 'dust', icon: Wind, color: '#c29a5e' },
  { id: 'crystal', icon: Gem, color: '#c4b5fd' },
  { id: 'receiver', icon: Target, color: '#00f0ff' },
  { id: 'ring', icon: Orbit, color: '#a855f7' },
  { id: 'vortex', icon: Tornado, color: '#ff2bd6' },
  { id: 'gate', icon: CircleDot, color: '#00f0ff' },
  { id: 'sphere', icon: CircleDot, color: '#ff5a1f' },
  { id: 'wall', icon: Square, color: '#64748b' },
]

const WAVE_ICONS: Record<Wavelength, LucideIcon> = { ir: Flame, vis: Zap, uv: Sparkles }

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 last:mb-1">
      <h3 className="mb-2 font-display text-[10px] tracking-[0.3em] text-cyan-200/70">{title}</h3>
      {children}
    </section>
  )
}

export function GuideModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const controls: [LucideIcon, StringKey][] = [
    [MousePointerClick, 'guide.ctrl.prism'],
    [Keyboard, 'guide.ctrl.keys'],
    [Pause, 'guide.ctrl.pause'],
    [Lightbulb, 'guide.ctrl.hint'],
  ]
  return (
    <Modal title={t('guide.title')} onClose={onClose} wide>
      <Section title={t('guide.goal.title')}>
        <p className="text-[14px] leading-relaxed text-cyan-50/85">{t('guide.goal')}</p>
        <p className="mt-2 flex items-start gap-2 text-[12px] leading-relaxed text-amber-100/75">
          <Star size={14} className="mt-0.5 shrink-0 text-amber-300" /> {t('guide.stars')}
        </p>
      </Section>
      <Section title={t('guide.controls.title')}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {controls.map(([Icon, key]) => (
            <li key={key} className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[13px] text-cyan-50/85">
              <Icon size={16} className="mt-0.5 shrink-0 text-cyan-300" /> {t(key)}
            </li>
          ))}
        </ul>
      </Section>
      <Section title={t('guide.waves.title')}>
        <ul className="grid gap-2 sm:grid-cols-3">
          {(['ir', 'vis', 'uv'] as Wavelength[]).map((wl) => {
            const Icon = WAVE_ICONS[wl]
            const color = WAVELENGTHS[wl].color
            return (
              <li key={wl} className="rounded-xl border px-3 py-2.5" style={{ borderColor: `${color}44`, background: `${color}0d` }}>
                <span className="flex items-center gap-2 text-[13px] font-medium text-white">
                  <Icon size={15} style={{ color }} /> {t(`wl.${wl}.name`)}
                  <kbd className="ms-auto rounded border border-white/15 px-1.5 font-display text-[9px] text-white/50">{WAVELENGTHS[wl].key}</kbd>
                </span>
                <span className="mt-1 block text-[12px] text-cyan-50/65">{t(`wl.${wl}.hint`)}</span>
              </li>
            )
          })}
        </ul>
      </Section>
      <Section title={t('guide.elements.title')}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ELEMENTS.map(({ id, icon: Icon, color }) => (
            <li key={id} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}1f`, color }}>
                <Icon size={16} />
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-medium text-white">{t(`el.${id}.name` as StringKey)}</span>
                <span className="text-[12px] leading-snug text-cyan-50/65">{t(`el.${id}.desc` as StringKey)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </Modal>
  )
}
