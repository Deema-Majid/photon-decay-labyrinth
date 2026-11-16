import { DIR_VEC, type CellDef, type Dir, type LevelDef, type Wavelength } from '../levels/types'

export interface Segment {
  from: [number, number]
  to: [number, number]
  wl: Wavelength
}

export type HitAction = 'burn' | 'shatter' | 'receive' | 'blocked' | 'none'

export interface Hit {
  cellId: string | null
  action: HitAction
  wl: Wavelength
  at: [number, number]
}

export interface Trace {
  segments: Segment[]
  hit: Hit
  length: number
}

export interface CellRuntime {
  rot: number
  destroyed: boolean
  locked: boolean
}

export const CELL = 2

export function cellToWorld(level: LevelDef, x: number, z: number): [number, number] {
  return [(x - (level.cols - 1) / 2) * CELL, (z - (level.rows - 1) / 2) * CELL]
}

function reflect(dir: Dir, rot: number): Dir {
  // rot even => '/' mirror, rot odd => '\' mirror
  if (rot % 2 === 0) {
    return ([3, 2, 1, 0] as Dir[])[dir]
  }
  return ([1, 0, 3, 2] as Dir[])[dir]
}

export function spherePosition(cell: CellDef, phase: number) {
  if (!cell.path || cell.path.length === 0) return { x: cell.x, z: cell.z }
  return cell.path[phase % cell.path.length]
}

export function computeTrace(
  level: LevelDef,
  runtime: Record<string, CellRuntime>,
  wavelength: Wavelength,
  spherePhase: number,
): Trace {
  const occupancy = new Map<string, CellDef>()
  for (const c of level.cells) {
    const rt = runtime[c.id]
    if (rt?.destroyed) continue
    if (c.kind === 'sphere') {
      const p = spherePosition(c, spherePhase)
      occupancy.set(`${p.x},${p.z}`, c)
    } else {
      occupancy.set(`${c.x},${c.z}`, c)
    }
  }

  const emitter = level.cells.find((c) => c.kind === 'emitter')
  if (!emitter) {
    return { segments: [], hit: { cellId: null, action: 'none', wl: wavelength, at: [0, 0] }, length: 0 }
  }

  let x = emitter.x
  let z = emitter.z
  let dir: Dir = emitter.dir ?? 0
  let wl: Wavelength = wavelength
  const segments: Segment[] = []
  let segStart = cellToWorld(level, x, z)
  const visited = new Set<string>()
  let hit: Hit = { cellId: null, action: 'none', wl, at: segStart }

  for (let step = 0; step < 200; step++) {
    const key = `${x},${z},${dir},${wl}`
    if (visited.has(key)) {
      hit = { cellId: null, action: 'none', wl, at: cellToWorld(level, x, z) }
      break
    }
    visited.add(key)
    const [dx, dz] = DIR_VEC[dir]
    const nx = x + dx
    const nz = z + dz
    if (nx < 0 || nz < 0 || nx >= level.cols || nz >= level.rows) {
      const end = cellToWorld(level, x + dx * 0.5, z + dz * 0.5)
      segments.push({ from: segStart, to: end, wl })
      hit = { cellId: null, action: 'none', wl, at: end }
      break
    }
    const cell = occupancy.get(`${nx},${nz}`)
    if (!cell) {
      x = nx
      z = nz
      continue
    }
    const center = cellToWorld(level, nx, nz)
    const face = cellToWorld(level, nx - dx * 0.5, nz - dz * 0.5)
    const rt = runtime[cell.id]
    const stopAt = (action: HitAction, at: [number, number]) => {
      segments.push({ from: segStart, to: at, wl })
      hit = { cellId: cell.id, action, wl, at }
    }
    if (cell.kind === 'wall' || cell.kind === 'emitter' || cell.kind === 'sphere') {
      stopAt('blocked', face)
      break
    }
    if (cell.kind === 'prism') {
      segments.push({ from: segStart, to: center, wl })
      segStart = center
      dir = reflect(dir, rt?.rot ?? cell.rot ?? 0)
      x = nx
      z = nz
      continue
    }
    if (cell.kind === 'dust') {
      stopAt(wl === 'ir' ? 'burn' : 'blocked', center)
      break
    }
    if (cell.kind === 'crystal') {
      stopAt(wl === 'uv' ? 'shatter' : 'blocked', center)
      break
    }
    if (cell.kind === 'ring') {
      segments.push({ from: segStart, to: center, wl })
      segStart = center
      wl = cell.wl ?? wl
      x = nx
      z = nz
      continue
    }
    if (cell.kind === 'vortex') {
      segments.push({ from: segStart, to: center, wl })
      segStart = center
      dir = ((dir + 1) % 4) as Dir
      x = nx
      z = nz
      continue
    }
    if (cell.kind === 'gate') {
      if (cell.wl === wl) {
        x = nx
        z = nz
        continue
      }
      stopAt('blocked', face)
      break
    }
    if (cell.kind === 'receiver') {
      stopAt(wl === 'vis' ? 'receive' : 'blocked', center)
      break
    }
  }

  let length = 0
  for (const s of segments) {
    length += Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1])
  }
  return { segments, hit, length }
}
