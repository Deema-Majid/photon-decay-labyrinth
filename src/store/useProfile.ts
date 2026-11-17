import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Lang } from '../i18n/strings'

export interface BestRecord {
  seconds: number
  rotations: number
  stars: number
  at: number
}

export interface Profile {
  id: string
  name: string
  avatar: number
  createdAt: number
  /** number of cells unlocked (1..LEVEL_COUNT) */
  unlocked: number
  best: Record<number, BestRecord>
  clears: number
  /** achievement id -> unlock time */
  achievements?: Record<string, number>
}

export const ACHIEVEMENTS = ['first_light', 'perfect', 'all_perfect', 'speedrun', 'spectrum', 'restorer', 'photographer'] as const
export type AchievementId = (typeof ACHIEVEMENTS)[number]

export interface Settings {
  quality: 'high' | 'low'
  volume: number
  muted: boolean
  reducedMotion: boolean
  music: boolean
}

export const LEVEL_COUNT = 3
export const NAME_MIN = 2
export const NAME_MAX = 16

function isSmallDevice() {
  try {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  } catch {
    return false
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function newId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }
}

/** localStorage can throw in private windows or when site data is blocked; progress then lives for the session only. */
const safeStorage = createJSONStorage(() => ({
  getItem: (k: string) => {
    try {
      return window.localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      window.localStorage.setItem(k, v)
    } catch {
      /* storage unavailable */
    }
  },
  removeItem: (k: string) => {
    try {
      window.localStorage.removeItem(k)
    } catch {
      /* storage unavailable */
    }
  },
}))

export type NameCheck = 'ok' | 'short' | 'taken'

export function cleanName(raw: string) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX)
}

interface ProfileState {
  lang: Lang
  profiles: Profile[]
  activeId: string | null
  settings: Settings
  setLang: (lang: Lang) => void
  checkName: (raw: string, exceptId?: string) => NameCheck
  createProfile: (name: string, avatar: number) => string | null
  selectProfile: (id: string) => void
  renameProfile: (id: string, name: string) => boolean
  setAvatar: (id: string, avatar: number) => void
  deleteProfile: (id: string) => void
  recordClear: (levelId: number, rec: Omit<BestRecord, 'at'>) => { newRecord: boolean }
  setSettings: (patch: Partial<Settings>) => void
  /** returns true when the achievement is new for the active profile */
  unlock: (id: AchievementId) => boolean
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      lang: 'ar',
      profiles: [],
      activeId: null,
      settings: {
        quality: isSmallDevice() ? 'low' : 'high',
        volume: 0.8,
        muted: false,
        reducedMotion: prefersReducedMotion(),
        music: true,
      },

      setLang(lang) {
        set({ lang })
      },

      checkName(raw, exceptId) {
        const name = cleanName(raw)
        if (name.length < NAME_MIN) return 'short'
        const taken = get().profiles.some((p) => p.id !== exceptId && p.name.toLocaleLowerCase() === name.toLocaleLowerCase())
        return taken ? 'taken' : 'ok'
      },

      createProfile(raw, avatar) {
        if (get().checkName(raw) !== 'ok') return null
        const profile: Profile = {
          id: newId(),
          name: cleanName(raw),
          avatar,
          createdAt: Date.now(),
          unlocked: 1,
          best: {},
          clears: 0,
        }
        set((s) => ({ profiles: [...s.profiles, profile], activeId: profile.id }))
        return profile.id
      },

      selectProfile(id) {
        if (get().profiles.some((p) => p.id === id)) set({ activeId: id })
      },

      renameProfile(id, raw) {
        if (get().checkName(raw, id) !== 'ok') return false
        const name = cleanName(raw)
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, name } : p)) }))
        return true
      },

      setAvatar(id, avatar) {
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, avatar } : p)) }))
      },

      deleteProfile(id) {
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id)
          const activeId = s.activeId === id ? (profiles[0]?.id ?? null) : s.activeId
          return { profiles, activeId }
        })
      },

      recordClear(levelId, rec) {
        const s = get()
        const profile = s.profiles.find((p) => p.id === s.activeId)
        if (!profile) return { newRecord: false }
        const prev = profile.best[levelId]
        const newRecord =
          !prev || rec.stars > prev.stars || (rec.stars === prev.stars && rec.seconds < prev.seconds)
        const updated: Profile = {
          ...profile,
          clears: profile.clears + 1,
          unlocked: Math.max(profile.unlocked, Math.min(LEVEL_COUNT, levelId + 1)),
          best: newRecord ? { ...profile.best, [levelId]: { ...rec, at: Date.now() } } : profile.best,
        }
        set({ profiles: s.profiles.map((p) => (p.id === profile.id ? updated : p)) })
        return { newRecord }
      },

      setSettings(patch) {
        set((s) => ({ settings: { ...s.settings, ...patch } }))
      },

      unlock(id) {
        const s = get()
        const profile = s.profiles.find((p) => p.id === s.activeId)
        if (!profile || profile.achievements?.[id]) return false
        const updated = { ...profile, achievements: { ...(profile.achievements ?? {}), [id]: Date.now() } }
        set({ profiles: s.profiles.map((p) => (p.id === profile.id ? updated : p)) })
        return true
      },
    }),
    {
      name: 'photon-labyrinth/v1',
      version: 1,
      storage: safeStorage,
      partialize: (s) => ({ lang: s.lang, profiles: s.profiles, activeId: s.activeId, settings: s.settings }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProfileState>
        return { ...current, ...p, settings: { ...current.settings, ...(p.settings ?? {}) } }
      },
    },
  ),
)

export function activeProfile(s: { profiles: Profile[]; activeId: string | null }) {
  return s.profiles.find((p) => p.id === s.activeId) ?? null
}

export function totalStars(p: Profile | null) {
  if (!p) return 0
  return Object.values(p.best).reduce((a, b) => a + b.stars, 0)
}
