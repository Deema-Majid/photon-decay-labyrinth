import { Home, Play, RotateCcw, Settings } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../i18n/useT'
import { useGame } from '../store/useGame'
import { SettingsModal } from './menu/SettingsModal'

export function PauseMenu() {
  const t = useT()
  const setPaused = useGame((s) => s.setPaused)
  const retryLevel = useGame((s) => s.retryLevel)
  const quitToMenu = useGame((s) => s.quitToMenu)
  const [settings, setSettings] = useState(false)

  const item =
    'glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-cyan-50/90 transition hover:border-cyan-300/40 hover:text-white'

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[3px]">
      <div className="glass-strong fade-up w-full max-w-[340px] rounded-3xl p-5" role="dialog" aria-modal="true" aria-label={t('pause.title')}>
        <div className="mb-4 text-center">
          <span className="font-display text-[10px] tracking-[0.4em] text-cyan-300/80">PAUSED</span>
          <h2 className="mt-1 text-xl font-bold text-white">{t('pause.title')}</h2>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" autoFocus onClick={() => setPaused(false)} className="btn-primary flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px]">
            <Play size={16} /> {t('pause.resume')}
          </button>
          <button type="button" onClick={retryLevel} className={item}>
            <RotateCcw size={16} /> {t('pause.retry')}
          </button>
          <button type="button" onClick={() => setSettings(true)} className={item}>
            <Settings size={16} /> {t('menu.settings')}
          </button>
          <button type="button" onClick={quitToMenu} className={item}>
            <Home size={16} /> {t('pause.quit')}
          </button>
        </div>
      </div>
      {settings ? <SettingsModal onClose={() => setSettings(false)} /> : null}
    </div>
  )
}
