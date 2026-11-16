import { RotateCcw } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { useGame } from '../store/useGame'

export function StatusBar() {
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const restoration = useGame((s) => s.restoration)
  const phase = useGame((s) => s.phase)
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)
  const restart = useGame((s) => s.restart)
  const pct = Math.round((phase === 'finale' ? 1 : restoration) * 100)

  return (
    <>
      <div className="pointer-events-auto absolute top-24 left-4 z-20 fade-up xl:top-4">
        <div className="glass w-[min(60vw,250px)] rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/80">
              LEVEL {String(levelIndex + 1).padStart(2, '0')} / {String(LEVELS.length).padStart(2, '0')}
            </span>
            <span className="font-display text-[10px] tracking-[0.2em] text-white/70">{pct}%</span>
          </div>
          <div className="mt-1 text-sm font-medium text-white/90">{level.name}</div>
          <div className="text-[11px] text-cyan-100/60">{level.place} · {level.nameEn}</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="meter h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-cyan-100/50">كفاءة الخلية المستعادة</div>
        </div>
      </div>
      <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-2 fade-up">
        <button
          type="button"
          onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
          className="glass rounded-xl px-3 py-2 text-[11px] text-cyan-100/70 transition hover:text-white"
        >
          الجودة: {quality === 'high' ? 'سينمائية' : 'خفيفة'}
        </button>
        <button
          type="button"
          onClick={restart}
          className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] text-cyan-100/70 transition hover:text-white"
        >
          <RotateCcw size={12} /> إعادة
        </button>
      </div>
    </>
  )
}
