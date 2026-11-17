import { Cpu, MousePointerClick, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'

/** True after a few seconds without pointer or key input. */
function useIdle(ms: number) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let id = window.setTimeout(() => setIdle(true), ms)
    const wake = () => {
      setIdle(false)
      window.clearTimeout(id)
      id = window.setTimeout(() => setIdle(true), ms)
    }
    window.addEventListener('pointermove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [ms])
  return idle
}

export function IntroOverlay() {
  const activate = useGame((s) => s.activate)
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)
  const idle = useIdle(5000)
  const dim = { opacity: idle ? 0 : 1, transition: 'opacity 1400ms ease' }

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-between px-6 py-[13vh] sm:px-10">
      <div className="w-full" style={dim}>
      <div className="flex w-full items-start justify-between fade-up">
        <div className="glass rounded-xl px-4 py-2 text-[11px] text-cyan-100/70">
          <span className="font-display tracking-[0.25em] text-cyan-200/80">PV CELL · SOILING LAB</span>
        </div>
        <button
          type="button"
          onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
          className="glass rounded-xl px-3 py-2 text-[11px] text-cyan-100/70 transition hover:text-white"
        >
          الجودة: {quality === 'high' ? 'سينمائية' : 'خفيفة'}
        </button>
      </div>
      </div>

      <div className="flex max-w-3xl flex-col items-center text-center">
        <div className="fade-up mb-4 flex items-center gap-2 text-[11px] text-cyan-200/70" style={{ animationDelay: '100ms' }}>
          <Sun size={14} />
          <span className="font-display tracking-[0.35em]">PHOTON DECAY LABYRINTH</span>
        </div>
        <h1
          className="hud-title fade-up text-5xl font-bold leading-tight text-white sm:text-7xl"
          style={{ animationDelay: '220ms' }}
        >
          متاهة الذاكرة الضوئية
        </h1>
        <div style={dim}>
        <p
          className="fade-up mt-5 max-w-xl text-base leading-relaxed text-cyan-50/75 sm:text-lg"
          style={{ animationDelay: '360ms' }}
        >
          الغبار والملح والسخام يحجبون الضوء عن خلايا السيليكون. انزل داخل الخلية، وجّه الفوتونات عبر المناشير،
          وبدّل طول الموجة لتنظيف المسار وإعادة المحطة الشمسية إلى كفاءتها الكاملة.
        </p>
        </div>
        <button
          type="button"
          onClick={activate}
          className="btn-primary fade-up mt-10 rounded-2xl px-8 py-4 font-display text-sm tracking-[0.25em] sm:text-base"
          style={{ animationDelay: '520ms' }}
        >
          [ تفعيل بروتوكول الفوتون ]
        </button>
      </div>

      <div style={dim}>
      <div className="fade-up flex flex-wrap items-center justify-center gap-3 text-[11px] text-cyan-100/60" style={{ animationDelay: '700ms' }}>
        <span className="glass flex items-center gap-2 rounded-lg px-3 py-2">
          <MousePointerClick size={13} /> اضغط على المنشور لتدويره
        </span>
        <span className="glass flex items-center gap-2 rounded-lg px-3 py-2">
          <Cpu size={13} /> بدّل الطيف من الشريط العلوي أو المفاتيح 1 · 2 · 3
        </span>
      </div>
      </div>
    </div>
  )
}
