import type { Wavelength } from '../levels/types'

export type BurstKind = 'shards' | 'embers' | 'spark'

export interface BurstEvent {
  kind: BurstKind
  position: [number, number, number]
  color: string
  count: number
}

export interface GameEvents {
  burst: BurstEvent
  wavelength: { wl: Wavelength }
}

type Handler<T> = (payload: T) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = new Map<keyof GameEvents, Set<Handler<any>>>()

export function on<K extends keyof GameEvents>(name: K, fn: Handler<GameEvents[K]>) {
  let set = handlers.get(name)
  if (!set) {
    set = new Set()
    handlers.set(name, set)
  }
  set.add(fn)
  return () => {
    set.delete(fn)
  }
}

export function emit<K extends keyof GameEvents>(name: K, payload: GameEvents[K]) {
  handlers.get(name)?.forEach((fn) => fn(payload))
}
