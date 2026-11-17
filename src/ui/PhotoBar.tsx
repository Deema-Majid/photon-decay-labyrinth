import { Camera, Film, X } from 'lucide-react'
import { useT } from '../i18n/useT'
import { useGame, volatile } from '../store/useGame'
import { sfx } from '../audio/sfx'
import { usePhotoBars } from './photoBars'

export function PhotoBar() {
  const t = useT()
  const setPhoto = useGame((s) => s.setPhoto)
  const bars = usePhotoBars((s) => s.on)
  const toggleBars = usePhotoBars((s) => s.toggle)

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[max(14vh,1rem)] z-40 flex flex-col items-center gap-2 px-3 fade-up">
      <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-cyan-50/70 backdrop-blur">{t('photo.hint')}</span>
      <div className="glass flex items-center gap-2 rounded-2xl p-1.5">
        <span className="hidden px-3 font-display text-[10px] tracking-[0.35em] text-cyan-200/80 sm:inline">{t('photo.title')}</span>
        <button
          type="button"
          onClick={() => {
            sfx.rotate()
            volatile.captureRequested = true
          }}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px]"
        >
          <Camera size={16} /> {t('photo.capture')}
        </button>
        <button
          type="button"
          aria-pressed={bars}
          onClick={toggleBars}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] transition ${bars ? 'bg-cyan-300/15 text-white' : 'text-cyan-100/70 hover:text-white'}`}
        >
          <Film size={16} /> {t('photo.bars')}
        </button>
        <button
          type="button"
          onClick={() => setPhoto(false)}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] text-cyan-100/70 hover:text-white"
        >
          <X size={16} /> {t('photo.exit')}
        </button>
      </div>
    </div>
  )
}
