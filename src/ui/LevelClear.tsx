import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { useGame } from '../store/useGame'

export function LevelClear() {
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const stats = useGame((s) => s.stats)
  const nextLevel = useGame((s) => s.nextLevel)
  const seconds = Math.max(1, Math.round((performance.now() - stats.startedAt) / 1000))
  const isLast = levelIndex + 1 >= LEVELS.length

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-4">
      <div className="glass-strong fade-up w-[min(94vw,520px)] rounded-3xl p-7 text-center">
        <div className="flex items-center justify-center gap-2 text-cyan-300">
          <CheckCircle2 size={18} />
          <span className="font-display text-[11px] tracking-[0.35em]">CELL RESTORED</span>
        </div>
        <h2 className="hud-title mt-3 text-3xl font-bold text-white">{level.name}</h2>
        <p className="mt-1 text-sm text-cyan-100/60">
          {level.place} · {level.nameEn}
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            ['تدوير', stats.rotations],
            ['تبخير', stats.burned],
            ['تحطيم', stats.shattered],
            ['ثانية', seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="glass rounded-xl p-3">
              <div className="font-display text-xl text-white">{value}</div>
              <div className="text-[11px] text-cyan-100/60">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-cyan-50/75">
          {isLast
            ? 'اكتملت الخلايا الثلاث. المحطة تعود إلى كفاءتها الكاملة.'
            : 'الشعاع وصل إلى كل المستقبِلات. البيئة تتحول من الغبار إلى زجاج نظيف وقنوات طاقة.'}
        </p>
        <button
          type="button"
          onClick={nextLevel}
          className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-xs tracking-[0.25em]"
        >
          {isLast ? 'عرض الأثر' : 'المستوى التالي'}
          <ArrowLeft size={14} />
        </button>
      </div>
    </div>
  )
}
