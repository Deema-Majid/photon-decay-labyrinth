import { useEffect, useState } from 'react'
import { translate } from './i18n/strings'
import { useLang } from './i18n/useT'
import { ambient, sfx } from './audio/sfx'
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
import { PhotoBar } from './ui/PhotoBar'
import { StatusBar } from './ui/StatusBar'
import { TitleCard } from './ui/TitleCard'
import { Toasts } from './ui/Toasts'
import { TopHUD } from './ui/TopHUD'
import { SceneBoundary, WebGLFallback, webglAvailable } from './ui/WebGLFallback'

export default function App() {
  const phase = useGame((s) => s.phase)
  const [noWebGL, setNoWebGL] = useState(() => !webglAvailable())
  const paused = useGame((s) => s.paused)
  const photo = useGame((s) => s.photo)
  const levelIndex = useGame((s) => s.levelIndex)
  const music = useProfile((s) => s.settings.music)
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

  // ambient score: one root note per cell, the menu gets a softer drone once audio is unlocked
  useEffect(() => {
    if (!music) {
      ambient.stop()
      return
    }
    if (phase === 'intro') {
      if (sfx.ready()) ambient.play(-1)
    } else {
      ambient.play(phase === 'finale' ? 2 : levelIndex)
    }
  }, [music, phase, levelIndex])

  // the score clears up as the cell is restored
  useEffect(
    () =>
      useGame.subscribe((s, prev) => {
        if (s.phase === prev.phase && s.restoration === prev.restoration) return
        ambient.setClarity(s.phase === 'clear' || s.phase === 'finale' ? 1 : s.phase === 'playing' ? s.restoration : 0.2)
      }),
    [],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      volatile.mouse = [(e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2]
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const s = useGame.getState()
      if (e.key === 'Escape') {
        if (s.photo) s.setPhoto(false)
        else if (s.phase === 'playing') s.setPaused(!s.paused)
        return
      }
      if (s.phase !== 'playing' || s.paused) return
      if (e.key === 'h' || e.key === 'H') s.takeHint()
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
      {noWebGL ? null : (
        <SceneBoundary onError={() => setNoWebGL(true)}>
          <Scene />
        </SceneBoundary>
      )}
      <div className="pointer-events-none absolute inset-0">
        <ShotFade />
        <Letterbox />
        {phase === 'playing' ? <TitleCard key={runId} /> : null}
        {phase === 'intro' ? <IntroOverlay /> : null}
        {phase === 'diving' ? <DiveFlash /> : null}
        {inGame && !photo ? <TopHUD /> : null}
        {inGame && !photo ? <StatusBar /> : null}
        {inGame && !photo ? <LumenPanel /> : null}
        {phase === 'clear' ? <LevelClear /> : null}
        {phase === 'finale' ? <Finale /> : null}
        {paused && phase === 'playing' && !photo ? <PauseMenu /> : null}
        {photo ? <PhotoBar /> : null}
        <Toasts />
        {noWebGL ? <WebGLFallback /> : <LoadingScreen />}
      </div>
    </div>
  )
}
