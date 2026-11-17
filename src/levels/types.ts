export type Wavelength = 'ir' | 'vis' | 'uv'

/** 0: +x (east), 1: +z (south), 2: -x (west), 3: -z (north) */
export type Dir = 0 | 1 | 2 | 3

export type CellKind =
  | 'wall'
  | 'emitter'
  | 'prism'
  | 'dust'
  | 'crystal'
  | 'ring'
  | 'vortex'
  | 'receiver'
  | 'gate'
  | 'sphere'

export interface CellDef {
  id: string
  kind: CellKind
  x: number
  z: number
  /** emitter facing direction */
  dir?: Dir
  /** prism initial rotation (0..3) */
  rot?: number
  /** ring / gate wavelength */
  wl?: Wavelength
  /** moving sphere path (cycled) */
  path?: { x: number; z: number }[]
}

export interface Palette {
  fog: string
  fogDensity: number
  floor: string
  grid: string
  accent: string
  ambient: string
  key: string
}

export interface LevelDef {
  id: number
  cols: number
  rows: number
  cells: CellDef[]
  palette: Palette
  cleanPalette: Palette
  /** star targets: one star for clearing, one for time, one for rotations */
  par: { seconds: number; rotations: number }
}

/** Display names and hints live in i18n under wl.<id>.name / wl.<id>.hint. */
export const WAVELENGTHS: Record<Wavelength, { color: string; nm: string; key: string }> = {
  ir: { color: '#FF3B30', nm: 'IR · 850nm', key: '1' },
  vis: { color: '#00F0FF', nm: 'VIS · 500nm', key: '2' },
  uv: { color: '#A855F7', nm: 'UV · 365nm', key: '3' },
}

export const DIR_VEC: Record<Dir, [number, number]> = {
  0: [1, 0],
  1: [0, 1],
  2: [-1, 0],
  3: [0, -1],
}
