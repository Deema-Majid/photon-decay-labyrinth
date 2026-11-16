// Brute-force solvability check: tries every prism rotation combo and wavelength sequence.
import { LEVELS } from '../src/levels/levels'
import { computeTrace, type CellRuntime } from '../src/engine/trace'
import type { Wavelength } from '../src/levels/types'

const WLS: Wavelength[] = ['ir', 'vis', 'uv']

for (const level of LEVELS) {
  const prisms = level.cells.filter((c) => c.kind === 'prism')
  const receivers = level.cells.filter((c) => c.kind === 'receiver')
  const spheres = level.cells.filter((c) => c.kind === 'sphere')
  const phases = spheres.length ? 4 : 1
  // state: destroyed set + locked set ; BFS over actions (rotate prism, pick wl, wait a phase)
  type State = { destroyed: string[]; locked: string[] }
  const key = (s: State) => s.destroyed.slice().sort().join(',') + '|' + s.locked.slice().sort().join(',')
  const seen = new Set<string>()
  const queue: State[] = [{ destroyed: [], locked: [] }]
  seen.add(key(queue[0]))
  let solved = false
  let expansions = 0
  while (queue.length && !solved) {
    const st = queue.shift()!
    expansions++
    const rotCombos = 2 ** prisms.length
    for (let combo = 0; combo < rotCombos; combo++) {
      const runtime: Record<string, CellRuntime> = {}
      for (const c of level.cells) {
        runtime[c.id] = { rot: c.rot ?? 0, destroyed: st.destroyed.includes(c.id), locked: st.locked.includes(c.id) }
      }
      prisms.forEach((p, i) => (runtime[p.id].rot = (combo >> i) & 1))
      for (const wl of WLS) {
        for (let ph = 0; ph < phases; ph++) {
          const tr = computeTrace(level, runtime, wl, ph)
          const h = tr.hit
          if (!h.cellId) continue
          let next: State | null = null
          if (h.action === 'burn' || h.action === 'shatter') {
            next = { destroyed: [...st.destroyed, h.cellId], locked: st.locked }
          } else if (h.action === 'receive' && !st.locked.includes(h.cellId)) {
            next = { destroyed: st.destroyed, locked: [...st.locked, h.cellId] }
          }
          if (next) {
            if (next.locked.length === receivers.length) {
              solved = true
              console.log(`Level ${level.id} (${level.nameEn}): SOLVABLE  destroyed=${next.destroyed.length} locked=${next.locked.length} expansions=${expansions}`)
              break
            }
            const k = key(next)
            if (!seen.has(k)) {
              seen.add(k)
              queue.push(next)
            }
          }
        }
        if (solved) break
      }
      if (solved) break
    }
  }
  if (!solved) console.log(`Level ${level.id} (${level.nameEn}): NOT SOLVABLE (states explored: ${seen.size})`)
}
