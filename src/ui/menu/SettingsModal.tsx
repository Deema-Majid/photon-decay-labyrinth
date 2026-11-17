import { Volume2, VolumeX } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Lang } from '../../i18n/strings'
import { useLang, useT } from '../../i18n/useT'
import { useGame, type Quality } from '../../store/useGame'
import { useProfile } from '../../store/useProfile'
import { Modal, Segmented, Toggle } from '../kit'

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 py-4 first:pt-1 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14px] text-white/90">{label}</span>
        {children}
      </div>
      {hint ? <span className="text-[11px] leading-relaxed text-cyan-100/45">{hint}</span> : null}
    </div>
  )
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const setLang = useProfile((s) => s.setLang)
  const settings = useProfile((s) => s.settings)
  const setSettings = useProfile((s) => s.setSettings)
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)

  return (
    <Modal title={t('settings.title')} onClose={onClose}>
      <Row label={t('settings.language')}>
        <Segmented<Lang>
          value={lang}
          onChange={setLang}
          options={[
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Row>
      <Row label={t('settings.quality')} hint={t('settings.qualityHint')}>
        <Segmented<Quality>
          value={quality}
          onChange={setQuality}
          options={[
            { value: 'high', label: t('quality.high') },
            { value: 'low', label: t('quality.low') },
          ]}
        />
      </Row>
      <Row label={t('settings.volume')}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSettings({ muted: !settings.muted })}
            aria-label={settings.muted ? t('hud.unmute') : t('hud.mute')}
            className="rounded-lg p-1.5 text-cyan-100/70 hover:text-white"
          >
            {settings.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(e) => setSettings({ volume: Number(e.target.value) / 100, muted: false })}
            aria-label={t('settings.volume')}
            className="w-36 accent-cyan-300"
          />
          <span className="w-9 text-end font-display text-[11px] text-cyan-100/60">
            {settings.muted ? 0 : Math.round(settings.volume * 100)}
          </span>
        </div>
      </Row>
      <Row label={t('settings.motion')} hint={t('settings.motionHint')}>
        <Toggle
          checked={settings.reducedMotion}
          onChange={(v) => setSettings({ reducedMotion: v })}
          label={t('settings.motion')}
        />
      </Row>
    </Modal>
  )
}
