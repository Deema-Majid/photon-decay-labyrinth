import { useEffect, useState } from 'react'
import { LEVELS } from '../levels/levels'
import { useGame } from '../store/useGame'

type Stage = 'in' | 'hold' | 'out' | 'gone'

/** Film-style chapter card shown over the crane shot at the start of each cell. */
export function TitleCard() {
  const level = useGame((s) => s.level)
  const levelIndex = useGame((s) => s.levelIndex)
  const [stage, setStage] = useState<Stage>('in')

  useEffect(() => {
    // stage is derived from elapsed time, so late or clumped frames can't skip the hold
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const t = performance.now() - start
      const next: Stage = t < 60 ? 'in' : t < 3000 ? 'hold' : t < 4100 ? 'out' : 'gone'
      setStage(next)
      if (next !== 'gone') raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (stage === 'gone') return null
  const visible = stage === 'hold'

  return (
    <div
      className="absolute inset-0 z-[15] flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 900ms ease',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, transparent 80%)',
      }}
    >
      <div className="flex flex-col items-center text-center">
        <span
          className="font-display text-[11px] tracking-[0.6em] text-cyan-200/80"
          style={{ transform: visible ? 'none' : 'translateY(8px)', transition: 'transform 1200ms ease' }}
        >
          CELL {String(levelIndex + 1).padStart(2, '0')} / {String(LEVELS.length).padStart(2, '0')}
        </span>
        <h2
          className="hud-title mt-3 text-5xl font-bold text-white sm:text-6xl"
          style={{
            letterSpacing: visible ? '0' : '0.08em',
            transition: 'letter-spacing 2400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {level.name}
        </h2>
        <div
          className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
          style={{ width: visible ? '260px' : '0px', transition: 'width 1400ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />
        <span className="mt-3 text-sm text-cyan-50/75">
          {level.place} · <span className="font-display text-[11px] tracking-[0.25em]">{level.nameEn.toUpperCase()}</span>
        </span>
      </div>
    </div>
  )
}
