import type { LevelDef, Wavelength } from '../levels/types'
import { computeTrace, type CellRuntime } from './trace'

export type HintAction =
  | { type: 'rotate'; id: string }
  | { type: 'wl'; wl: Wavelength }
  | { type: 'wait' }
  | { type: 'none' }

const WLS: Wavelength[] = ['vis', 'ir', 'uv']

interface Config {
  /** parity per prism (only rot % 2 changes the reflection) */
  parity: number[]
  wl: Wavelength
}

/**
 * Breadth-first search over "events" (a burn, shatter or receiver lock), from the player's
 * current board. Every configuration of prism parities and wavelength is tried at each step.
 * Root configurations are explored in order of how few changes they need, so the first
 * solution found is both shortest in events and cheapest to start.
 */
export function nextHint(
  level: LevelDef,
  runtime: Record<string, CellRuntime>,
  wavelength: Wavelength,
  spherePhase: number,
): HintAction {
  const prisms = level.cells.filter((c) => c.kind === 'prism')
  const receivers = level.cells.filter((c) => c.kind === 'receiver')
  const hasSpheres = level.cells.some((c) => c.kind === 'sphere')
  const phases = hasSpheres ? [spherePhase, spherePhase + 1, spherePhase + 2, spherePhase + 3] : [spherePhase]

  const currentParity = prisms.map((p) => (runtime[p.id]?.rot ?? 0) % 2)

  const configs: Config[] = []
  for (let mask = 0; mask < 1 << prisms.length; mask++) {
    for (const wl of WLS) configs.push({ parity: prisms.map((_, i) => (mask >> i) & 1), wl })
  }
  const cost = (c: Config) =>
    c.parity.reduce((a, p, i) => a + (p !== currentParity[i] ? 1 : 0), 0) + (c.wl !== wavelength ? 0.5 : 0)
  configs.sort((a, b) => cost(a) - cost(b))

  type Node = { destroyed: Set<string>; locked: Set<string>; first: Config | null }
  const key = (n: Node) => [...n.destroyed].sort().join(',') + '|' + [...n.locked].sort().join(',')

  const start: Node = {
    destroyed: new Set(level.cells.filter((c) => runtime[c.id]?.destroyed).map((c) => c.id)),
    locked: new Set(level.cells.filter((c) => runtime[c.id]?.locked).map((c) => c.id)),
    first: null,
  }
  if (receivers.every((r) => start.locked.has(r.id))) return { type: 'none' }

  const seen = new Set([key(start)])
  const queue: Node[] = [start]

  while (queue.length) {
    const node = queue.shift()!
    for (const cfg of configs) {
      const rt: Record<string, CellRuntime> = {}
      for (const c of level.cells) {
        rt[c.id] = { rot: c.rot ?? 0, destroyed: node.destroyed.has(c.id), locked: node.locked.has(c.id) }
      }
      prisms.forEach((p, i) => (rt[p.id].rot = cfg.parity[i]))
      for (const ph of phases) {
        const hit = computeTrace(level, rt, cfg.wl, ph).hit
        if (!hit.cellId) continue
        let next: Node | null = null
        if (hit.action === 'burn' || hit.action === 'shatter') {
          next = { destroyed: new Set([...node.destroyed, hit.cellId]), locked: node.locked, first: node.first ?? cfg }
        } else if (hit.action === 'receive' && !node.locked.has(hit.cellId)) {
          next = { destroyed: node.destroyed, locked: new Set([...node.locked, hit.cellId]), first: node.first ?? cfg }
        }
        if (!next) continue
        if (receivers.every((r) => next!.locked.has(r.id))) return toAction(next.first!, prisms.map((p) => p.id), currentParity, wavelength)
        const k = key(next)
        if (!seen.has(k)) {
          seen.add(k)
          queue.push(next)
        }
        break
      }
    }
  }
  return { type: 'none' }
}

function toAction(cfg: Config, ids: string[], currentParity: number[], wavelength: Wavelength): HintAction {
  const i = cfg.parity.findIndex((p, idx) => p !== currentParity[idx])
  if (i >= 0) return { type: 'rotate', id: ids[i] }
  if (cfg.wl !== wavelength) return { type: 'wl', wl: cfg.wl }
  return { type: 'wait' }
}
