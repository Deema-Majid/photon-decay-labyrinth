import { BookOpen, Cpu, Layers, MousePointerClick, Settings, Trophy, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { LEVELS } from '../levels/levels'
import { useLang, useT } from '../i18n/useT'
import { useGame } from '../store/useGame'
import { activeProfile, totalStars, useProfile } from '../store/useProfile'
import { Avatar, MenuButton, Stars } from './kit'
import { GuideModal } from './menu/GuideModal'
import { LevelSelect } from './menu/LevelSelect'
import { ProfileModal } from './menu/ProfileModal'
import { RecordsModal } from './menu/RecordsModal'
import { SettingsModal } from './menu/SettingsModal'

type ModalKind = null | 'profiles' | 'create' | 'levels' | 'settings' | 'records' | 'guide'

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
    window.addEventListener('pointerdown', wake)
    window.addEventListener('keydown', wake)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [ms])
  return idle
}

export function IntroOverlay() {
  const t = useT()
  const lang = useLang()
  const setLang = useProfile((s) => s.setLang)
  const profile = useProfile(activeProfile)
  const startRun = useGame((s) => s.startRun)
  const [modal, setModal] = useState<ModalKind>(null)
  const [startAfterCreate, setStartAfterCreate] = useState(false)
  const idle = useIdle(6000) && modal === null
  const dim = { opacity: idle ? 0 : 1, transition: 'opacity 1400ms ease' }

  const continueIndex = profile ? Math.min(LEVELS.length, profile.unlocked) - 1 : 0
  const finishedAll = !!profile && LEVELS.every((l) => profile.best[l.id])
  const primaryLabel = finishedAll
    ? t('menu.replay')
    : profile && continueIndex > 0
      ? t('menu.continue', { n: continueIndex + 1 })
      : t('menu.start')

  const primary = useCallback(() => {
    if (!profile) {
      setStartAfterCreate(true)
      setModal('create')
      return
    }
    if (finishedAll) {
      setModal('levels')
      return
    }
    startRun(continueIndex)
  }, [profile, continueIndex, startRun, finishedAll])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modal !== null) return
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement)) primary()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, primary])

  const close = useCallback(() => {
    setModal(null)
    setStartAfterCreate(false)
  }, [])

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-between px-4 py-[max(13vh,4.5rem)] sm:px-10">
      {/* top bar: profile on the start side, language and settings on the end side */}
      <div className="w-full" style={dim}>
        <div className="fade-up flex w-full items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setModal(profile ? 'profiles' : 'create')}
            className="glass flex min-w-0 items-center gap-2.5 rounded-2xl py-1.5 ps-1.5 pe-4 text-start transition hover:border-cyan-300/40"
          >
            {profile ? (
              <>
                <Avatar index={profile.avatar} size={34} />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[14px] font-medium text-white">{profile.name}</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-cyan-100/55">
                    <Stars count={1} max={1} size={10} /> {totalStars(profile)} / {LEVELS.length * 3}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dashed border-cyan-300/50 text-cyan-200">
                  <UserPlus size={16} />
                </span>
                <span className="text-[13px] text-cyan-50/85">{t('menu.createProfile')}</span>
              </>
            )}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="glass rounded-xl px-3 py-2 font-display text-[11px] tracking-[0.2em] text-cyan-100/80 transition hover:text-white"
              aria-label={t('settings.language')}
            >
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <button
              type="button"
              onClick={() => setModal('settings')}
              className="glass rounded-xl p-2 text-cyan-100/80 transition hover:text-white"
              aria-label={t('menu.settings')}
              title={t('menu.settings')}
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-3xl flex-col items-center text-center">
        <div className="fade-up mb-4 flex items-center gap-2 text-[11px] text-cyan-200/70" style={{ animationDelay: '100ms' }}>
          <span className={lang === 'ar' ? 'font-display tracking-[0.35em]' : 'tracking-[0.1em]'}>{t('app.kicker')}</span>
        </div>
        <h1
          className={`hud-title fade-up font-bold leading-tight text-white ${
            lang === 'ar' ? 'text-4xl sm:text-7xl' : 'font-display text-3xl tracking-[0.06em] sm:text-6xl'
          }`}
          style={{ animationDelay: '220ms' }}
        >
          {t('app.title')}
        </h1>
        <div style={dim}>
          <p
            className="fade-up mt-5 max-w-xl text-[15px] leading-relaxed text-cyan-50/75 sm:text-lg"
            style={{ animationDelay: '360ms' }}
          >
            {t('app.tagline')}
          </p>
        </div>
        <button
          type="button"
          onClick={primary}
          className="btn-primary fade-up mt-8 rounded-2xl px-8 py-4 font-display text-sm tracking-[0.2em] sm:text-base"
          style={{ animationDelay: '520ms' }}
        >
          [ {primaryLabel} ]
        </button>
        <div className="fade-up mt-4 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: '620ms', ...dim }}>
          <MenuButton icon={<Layers size={15} />} onClick={() => setModal(profile ? 'levels' : 'create')}>
            {t('menu.levels')}
          </MenuButton>
          <MenuButton icon={<Trophy size={15} />} onClick={() => setModal('records')}>
            {t('menu.records')}
          </MenuButton>
          <MenuButton icon={<BookOpen size={15} />} onClick={() => setModal('guide')}>
            {t('menu.guide')}
          </MenuButton>
        </div>
      </div>

      <div style={dim}>
        <div
          className="fade-up hidden flex-wrap items-center justify-center gap-3 text-[11px] text-cyan-100/60 sm:flex"
          style={{ animationDelay: '700ms' }}
        >
          <span className="glass flex items-center gap-2 rounded-lg px-3 py-2">
            <MousePointerClick size={13} /> {t('intro.hintRotate')}
          </span>
          <span className="glass flex items-center gap-2 rounded-lg px-3 py-2">
            <Cpu size={13} /> {t('intro.hintSwitch')}
          </span>
        </div>
      </div>

      {modal === 'profiles' || modal === 'create' ? (
        <ProfileModal
          initial={modal === 'create' ? 'create' : 'list'}
          onClose={close}
          onCreated={() => {
            const go = startAfterCreate
            close()
            if (go) startRun(0)
          }}
        />
      ) : null}
      {modal === 'levels' ? (
        <LevelSelect
          onClose={close}
          onPlay={(i) => {
            close()
            startRun(i)
          }}
        />
      ) : null}
      {modal === 'settings' ? <SettingsModal onClose={close} /> : null}
      {modal === 'records' ? <RecordsModal onClose={close} /> : null}
      {modal === 'guide' ? <GuideModal onClose={close} /> : null}
    </div>
  )
}
