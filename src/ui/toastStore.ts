import { create } from 'zustand'
import type { StringKey } from '../i18n/strings'
import type { AchievementId } from '../store/useProfile'

export interface Toast {
  id: number
  kind: 'ach' | 'info'
  ach?: AchievementId
  key?: StringKey
}

let nextId = 0

export const useToasts = create<{
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id: ++nextId }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
