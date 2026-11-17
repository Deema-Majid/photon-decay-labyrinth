import { useEffect } from 'react'
import { useGame, volatile } from './store/useGame'
import { Scene } from './three/Scene'
import { DiveFlash } from './ui/DiveFlash'
import { Finale } from './ui/Finale'
import { IntroOverlay } from './ui/IntroOverlay'
import { Letterbox, ShotFade } from './ui/Letterbox'
import { LevelClear } from './ui/LevelClear'
import { LumenPanel } from './ui/LumenPanel'
import { StatusBar } from './ui/StatusBar'
import { TitleCard } from './ui/TitleCard'
import { TopHUD } from './ui/TopHUD'

export default function App() {
  const phase = useGame((s) => s.phase)
  const levelIndex = useGame((s) => s.levelIndex)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      volatile.mouse = [(e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2]
    }
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState()
      if (e.key === '1') s.setWavelength('ir')
      else if (e.key === '2') s.setWavelength('vis')
      else if (e.key === '3') s.setWavelength('uv')
      else if ((e.key === 'Enter' || e.key === ' ') && s.phase === 'intro') s.activate()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const inGame = phase === 'playing' || phase === 'clear'

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#06080c]">
      <Scene />
      <div className="pointer-events-none absolute inset-0">
        <ShotFade />
        <Letterbox />
        {phase === 'playing' ? <TitleCard key={levelIndex} /> : null}
        {phase === 'intro' ? <IntroOverlay /> : null}
        {phase === 'diving' ? <DiveFlash /> : null}
        {inGame ? <TopHUD /> : null}
        {inGame ? <StatusBar /> : null}
        {inGame ? <LumenPanel /> : null}
        {phase === 'clear' ? <LevelClear /> : null}
        {phase === 'finale' ? <Finale /> : null}
      </div>
    </div>
  )
}
