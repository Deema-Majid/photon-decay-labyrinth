import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'

function Typed({ text, cps = 60 }: { text: string; cps?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setN((v) => {
        if (v + 1 >= text.length) window.clearInterval(id)
        return v + 1
      })
    }, 1000 / cps)
    return () => window.clearInterval(id)
  }, [text, cps])
  return (
    <>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-cyan-300/80 align-middle" />
    </>
  )
}

export function LumenPanel() {
  const lumen = useGame((s) => s.lumen)
  const last = lumen[lumen.length - 1]
  const text = last?.text ?? 'لومن جاهز. بانتظار الفوتون الأول.'

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-20 w-[min(92vw,420px)] fade-up">
      <div className="glass scanline relative overflow-hidden rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="orb h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-col">
            <span className="font-display text-[10px] tracking-[0.3em] text-cyan-200/80">LUMEN · A.I.</span>
            <span className="text-[11px] text-cyan-100/55">مساعد هولوغرافي</span>
          </div>
        </div>
        <p className="mt-3 min-h-[3.2rem] text-[13.5px] leading-relaxed text-cyan-50/90">
          <Typed key={last?.id ?? 0} text={text} />
        </p>
      </div>
    </div>
  )
}
