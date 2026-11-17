import { create } from 'zustand'
import { LEVELS } from '../levels/levels'
import { WAVELENGTHS, type LevelDef, type Wavelength } from '../levels/types'
import { computeTrace, cellToWorld, type CellRuntime, type Trace } from '../engine/trace'
import { emit } from '../engine/events'
import { sfx } from '../audio/sfx'

export type Phase = 'intro' | 'diving' | 'playing' | 'clear' | 'finale'
export type Quality = 'high' | 'low'

export interface LumenMsg {
  id: number
  text: string
}

export interface Stats {
  rotations: number
  burned: number
  shattered: number
  switches: number
  startedAt: number
}

/** Per-frame mutable values that never trigger React renders. */
export const volatile = {
  damage: {} as Record<string, number>,
  charge: {} as Record<string, number>,
  trauma: 0,
  mouse: [0, 0] as [number, number],
  diveStart: 0,
  sphereClock: 0,
  worldClean: 0,
  autoQualityDone: false,
  /** depth-of-field focus point, range (world units) and bokeh, written by the camera director */
  focus: [0, 1, 0] as [number, number, number],
  focusRange: 30,
  bokeh: 0.8,
  /** 0..1 black dip between intro shots */
  cut: 0,
  /** brief camera push-in toward a gameplay event */
  focusEvent: null as null | { x: number; z: number; t0: number },
  levelStart: 0,
}

export const LAB_Y = -60

interface GameState {
  phase: Phase
  levelIndex: number
  level: LevelDef
  runtime: Record<string, CellRuntime>
  wavelength: Wavelength
  spherePhase: number
  trace: Trace
  restoration: number
  completed: number
  lumen: LumenMsg[]
  quality: Quality
  hovered: string | null
  stats: Stats
  activate: () => void
  beginPlay: () => void
  setWavelength: (wl: Wavelength) => void
  rotatePrism: (id: string) => void
  destroyCell: (id: string) => void
  lockReceiver: (id: string) => void
  advanceSpheres: () => void
  nextLevel: () => void
  restart: () => void
  setHovered: (id: string | null) => void
  setQuality: (q: Quality) => void
  say: (text: string) => void
}

let lumenId = 0

function buildRuntime(level: LevelDef): Record<string, CellRuntime> {
  const rt: Record<string, CellRuntime> = {}
  for (const c of level.cells) {
    rt[c.id] = { rot: c.rot ?? 0, destroyed: false, locked: false }
  }
  return rt
}

function restorationOf(level: LevelDef, runtime: Record<string, CellRuntime>) {
  let total = 0
  let done = 0
  for (const c of level.cells) {
    if (c.kind === 'dust' || c.kind === 'crystal') {
      total++
      if (runtime[c.id]?.destroyed) done++
    } else if (c.kind === 'receiver') {
      total++
      if (runtime[c.id]?.locked) done++
    }
  }
  return total === 0 ? 1 : done / total
}

function freshStats(): Stats {
  return { rotations: 0, burned: 0, shattered: 0, switches: 0, startedAt: performance.now() }
}

export const useGame = create<GameState>((set, get) => {
  const level0 = LEVELS[0]
  const runtime0 = buildRuntime(level0)

  const recompute = (partial: Partial<GameState> = {}) => {
    const s = { ...get(), ...partial }
    const trace = computeTrace(s.level, s.runtime, s.wavelength, s.spherePhase)
    const restoration = restorationOf(s.level, s.runtime)
    set({ ...partial, trace, restoration })
  }

  const say = (text: string) => {
    lumenId++
    set((s) => ({ lumen: [...s.lumen.slice(-4), { id: lumenId, text }] }))
  }

  return {
    phase: 'intro',
    levelIndex: 0,
    level: level0,
    runtime: runtime0,
    wavelength: 'vis',
    spherePhase: 0,
    trace: computeTrace(level0, runtime0, 'vis', 0),
    restoration: 0,
    completed: 0,
    lumen: [],
    quality: 'high',
    hovered: null,
    stats: freshStats(),

    say,

    activate() {
      if (get().phase !== 'intro') return
      sfx.unlock()
      sfx.dive()
      volatile.diveStart = performance.now()
      set({ phase: 'diving' })
    },

    beginPlay() {
      const s = get()
      if (s.phase !== 'diving') return
      volatile.damage = {}
      volatile.charge = {}
      volatile.levelStart = performance.now()
      set({ phase: 'playing', stats: freshStats() })
      say(`${s.level.name} — ${s.level.place}. ${s.level.intro}`)
    },

    setWavelength(wl) {
      const s = get()
      if (s.wavelength === wl) return
      sfx.click(wl)
      emit('wavelength', { wl })
      recompute({ wavelength: wl, stats: { ...s.stats, switches: s.stats.switches + 1 } })
      if (s.phase === 'playing') say(`تم التبديل إلى ${WAVELENGTHS[wl].name} (${WAVELENGTHS[wl].nm}): ${WAVELENGTHS[wl].hint}.`)
    },

    rotatePrism(id) {
      const s = get()
      const rt = s.runtime[id]
      if (!rt || s.phase !== 'playing') return
      sfx.rotate()
      recompute({
        runtime: { ...s.runtime, [id]: { ...rt, rot: (rt.rot + 1) % 4 } },
        stats: { ...s.stats, rotations: s.stats.rotations + 1 },
      })
    },

    destroyCell(id) {
      const s = get()
      const cell = s.level.cells.find((c) => c.id === id)
      const rt = s.runtime[id]
      if (!cell || !rt || rt.destroyed) return
      const [wx, wz] = cellToWorld(s.level, cell.x, cell.z)
      const pos: [number, number, number] = [wx, LAB_Y + 1, wz]
      volatile.focusEvent = { x: wx, z: wz, t0: performance.now() }
      if (cell.kind === 'dust') {
        sfx.burn()
        emit('burst', { kind: 'embers', position: pos, color: '#ff7a1a', count: 90 })
        volatile.trauma = Math.min(1, volatile.trauma + 0.25)
        say('تبخّرت سحابة الغبار. الأشعة تحت الحمراء تحمل طاقة حرارية تفكك الجسيمات الناعمة بدون تلامس.')
      } else {
        sfx.shatter()
        emit('burst', { kind: 'shards', position: pos, color: '#c8f0ff', count: 70 })
        emit('burst', { kind: 'spark', position: pos, color: '#A855F7', count: 40 })
        volatile.trauma = Math.min(1, volatile.trauma + 0.55)
        say('تحطّمت البلورة الملحية. طاقة الفوتونات فوق البنفسجية أعلى من طاقة الروابط الأيونية في الملح.')
      }
      delete volatile.damage[id]
      recompute({
        runtime: { ...s.runtime, [id]: { ...rt, destroyed: true } },
        stats: {
          ...s.stats,
          burned: s.stats.burned + (cell.kind === 'dust' ? 1 : 0),
          shattered: s.stats.shattered + (cell.kind === 'crystal' ? 1 : 0),
        },
      })
    },

    lockReceiver(id) {
      const s = get()
      const rt = s.runtime[id]
      if (!rt || rt.locked) return
      sfx.lock()
      const cell = s.level.cells.find((c) => c.id === id)
      if (cell) {
        const [wx, wz] = cellToWorld(s.level, cell.x, cell.z)
        emit('burst', { kind: 'spark', position: [wx, LAB_Y + 1, wz], color: '#00F0FF', count: 60 })
        volatile.focusEvent = { x: wx, z: wz, t0: performance.now() }
      }
      const runtime = { ...s.runtime, [id]: { ...rt, locked: true } }
      recompute({ runtime })
      const all = s.level.cells.filter((c) => c.kind === 'receiver').every((c) => runtime[c.id].locked)
      if (all) {
        sfx.clear()
        volatile.trauma = Math.min(1, volatile.trauma + 0.3)
        set({ phase: 'clear', completed: s.levelIndex + 1 })
        say('اكتملت استعادة الخلية. تيار الطاقة يتدفق بكفاءة كاملة.')
      } else {
        say('المستقبِل مقفل على الطيف المرئي. وجّه الشعاع إلى المستقبِل التالي.')
      }
    },

    advanceSpheres() {
      const s = get()
      if (!s.level.cells.some((c) => c.kind === 'sphere')) return
      recompute({ spherePhase: s.spherePhase + 1 })
    },

    nextLevel() {
      const s = get()
      const next = s.levelIndex + 1
      if (next >= LEVELS.length) {
        set({ phase: 'finale' })
        say('المحطة الشمسية تعمل بكفاءة 100%. الطاقة النظيفة تضيء المدينة.')
        return
      }
      const level = LEVELS[next]
      const runtime = buildRuntime(level)
      volatile.damage = {}
      volatile.charge = {}
      volatile.levelStart = performance.now()
      volatile.focusEvent = null
      recompute({
        levelIndex: next,
        level,
        runtime,
        spherePhase: 0,
        wavelength: 'vis',
        phase: 'playing',
        hovered: null,
        stats: freshStats(),
      })
      say(`${level.name} — ${level.place}. ${level.intro}`)
    },

    restart() {
      const level = LEVELS[0]
      const runtime = buildRuntime(level)
      volatile.damage = {}
      volatile.charge = {}
      volatile.trauma = 0
      volatile.worldClean = 0
      recompute({
        phase: 'intro',
        levelIndex: 0,
        level,
        runtime,
        spherePhase: 0,
        wavelength: 'vis',
        completed: 0,
        lumen: [],
        hovered: null,
        stats: freshStats(),
      })
    },

    setHovered(id) {
      if (get().hovered !== id) set({ hovered: id })
    },

    setQuality(q) {
      set({ quality: q })
    },
  }
})

export const BURN_TIME = 1.1
export const SHATTER_TIME = 0.9
export const CHARGE_TIME = 1.4
export const SPHERE_PERIOD = 1.6
