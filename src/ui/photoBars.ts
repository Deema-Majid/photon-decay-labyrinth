import { create } from 'zustand'

/** Whether photo mode frames the shot with 2.39:1 cinema bars. */
export const usePhotoBars = create<{ on: boolean; toggle: () => void }>((set) => ({
  on: true,
  toggle: () => set((s) => ({ on: !s.on })),
}))
