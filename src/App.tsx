import { useEffect } from 'react'
import { translate } from './i18n/strings'
import { useLang } from './i18n/useT'
import { sfx } from './audio/sfx'
import { useGame, volatile } from './store/useGame'
import { useProfile } from './store/useProfile'
import { Scene } from './three/Scene'
import { DiveFlash } from './ui/DiveFlash'
import { Finale } from './ui/Finale'
import { IntroOverlay } from './ui/IntroOverlay'
import { Letterbox, ShotFade } from './ui/Letterbox'
import { LevelClear } from './ui/LevelClear'
import { LoadingScreen } from './ui/LoadingScreen'
import { LumenPanel } from './ui/LumenPanel'
import { PauseMenu } from './ui/PauseMenu'
import { StatusBar } from './ui/StatusBar'
import { TitleCard } from './ui/TitleCard'
import { TopHUD } from './ui/TopHUD'

export default function App() {
  const phase = useGame((s) => s.phase)
  const paused = useGame((s) => s.paused)
  const runId = useGame((s) => s.runId)
  const lang = useLang()
  const volume = useProfile((s) => s.settings.volume)
  const muted = useProfile((s) => s.settings.muted)

  // document language and direction follow the selected language
  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = `${translate(lang, 'app.title')} · ${translate(lang === 'ar' ? 'en' : 'ar', 'app.title')}`
  }, [lang])

  useEffect(() => {
    sfx.setVolume(muted ? 0 : volume)
  }, [volume, muted])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      volatile.mouse = [(e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2]
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const s = useGame.getState()
      if (e.key === 'Escape') {
        if (s.phase === 'playing') s.setPaused(!s.paused)
        return
      }
      if (s.phase !== 'playing' || s.paused) return
      if (e.key === '1') s.setWavelength('ir')
      else if (e.key === '2') s.setWavelength('vis')
      else if (e.key === '3') s.setWavelength('uv')
    }
    // pause automatically when the tab is hidden
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') useGame.getState().setPaused(true)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const inGame = phase === 'playing' || phase === 'clear'

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#06080c]">
      <Scene />
      <div className="pointer-events-none absolute inset-0">
        <ShotFade />
        <Letterbox />
        {phase === 'playing' ? <TitleCard key={runId} /> : null}
        {phase === 'intro' ? <IntroOverlay /> : null}
        {phase === 'diving' ? <DiveFlash /> : null}
        {inGame ? <TopHUD /> : null}
        {inGame ? <StatusBar /> : null}
        {inGame ? <LumenPanel /> : null}
        {phase === 'clear' ? <LevelClear /> : null}
        {phase === 'finale' ? <Finale /> : null}
        {paused && phase === 'playing' ? <PauseMenu /> : null}
        <LoadingScreen />
      </div>
    </div>
  )
}
