import type { Wavelength } from '../levels/types'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let volume = 0.35

function ensure() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = volume
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, master: master! }
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.5, slide = 1) {
  const { ctx, master } = ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), ctx.currentTime + dur)
  g.gain.setValueAtTime(gain, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
  osc.connect(g).connect(master)
  osc.start()
  osc.stop(ctx.currentTime + dur)
}

function noise(dur: number, gain = 0.4, filterFreq = 1200) {
  const { ctx, master } = ensure()
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 0.8
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
  src.connect(filter).connect(g).connect(master)
  src.start()
}

const WL_FREQ: Record<Wavelength, number> = { ir: 420, vis: 720, uv: 980 }

export const sfx = {
  unlock() {
    ensure()
  },
  /** true once a user gesture has created the audio context */
  ready() {
    return ctx !== null
  },
  /** 0..1 user volume; the mix itself peaks around 0.45 */
  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v)) * 0.45
    if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05)
  },
  click(wl: Wavelength) {
    tone(WL_FREQ[wl], 0.12, 'square', 0.12, 1.4)
    tone(WL_FREQ[wl] * 2, 0.2, 'sine', 0.2, 0.9)
  },
  rotate() {
    tone(300, 0.08, 'triangle', 0.15, 1.8)
  },
  hover() {
    tone(1400, 0.04, 'sine', 0.05, 1)
  },
  burn() {
    noise(0.7, 0.35, 600)
    tone(180, 0.6, 'sawtooth', 0.08, 0.4)
  },
  shatter() {
    noise(0.5, 0.5, 3200)
    tone(1600, 0.35, 'triangle', 0.15, 0.3)
  },
  lock() {
    tone(660, 0.18, 'sine', 0.25, 1)
    setTimeout(() => tone(990, 0.3, 'sine', 0.25, 1), 120)
  },
  clear() {
    ;[523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.5, 'sine', 0.25, 1), i * 130))
  },
  achievement() {
    ;[784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.6, 'triangle', 0.18, 1.002), i * 90))
  },
  dive() {
    tone(90, 2.2, 'sawtooth', 0.2, 6)
    noise(2.2, 0.25, 400)
  },
}

/**
 * Generated ambient score. Two detuned drones on the cell's root note, a fifth above,
 * and band-passed noise for wind. A low-pass filter opens as the cell is restored,
 * so the music literally clears up with the image.
 */
const ROOTS = [55, 49, 41.2]

interface AmbientNodes {
  out: GainNode
  filter: BiquadFilterNode
  oscs: OscillatorNode[]
  wind: BiquadFilterNode
  windGain: GainNode
  shimmer: GainNode
}

let amb: AmbientNodes | null = null
let ambOn = false

function buildAmbient(): AmbientNodes {
  const { ctx, master } = ensure()
  const out = ctx.createGain()
  out.gain.value = 0
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 380
  filter.Q.value = 0.7
  filter.connect(out)
  out.connect(master)

  const oscs: OscillatorNode[] = []
  const voices: [number, OscillatorType, number, number][] = [
    [1, 'sawtooth', -7, 0.05],
    [1, 'sawtooth', 7, 0.05],
    [1.5, 'triangle', 3, 0.05],
    [2, 'sine', 0, 0.04],
  ]
  for (const [mult, type, detune, gain] of voices) {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = ROOTS[0] * mult
    o.detune.value = detune
    const g = ctx.createGain()
    g.gain.value = gain
    o.connect(g).connect(filter)
    o.start()
    oscs.push(o)
  }

  // slow movement on the filter
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 120
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()

  // wind: looped noise through a wandering band-pass
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const wind = ctx.createBiquadFilter()
  wind.type = 'bandpass'
  wind.frequency.value = 500
  wind.Q.value = 0.6
  const windGain = ctx.createGain()
  windGain.gain.value = 0.05
  const windLfo = ctx.createOscillator()
  windLfo.frequency.value = 0.08
  const windLfoGain = ctx.createGain()
  windLfoGain.gain.value = 260
  windLfo.connect(windLfoGain).connect(wind.frequency)
  windLfo.start()
  noise.connect(wind).connect(windGain).connect(out)
  noise.start()

  // high shimmer that only appears as the cell gets clean
  const shimmer = ctx.createGain()
  shimmer.gain.value = 0
  for (const mult of [8, 12]) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = ROOTS[0] * mult
    const trem = ctx.createOscillator()
    trem.frequency.value = 0.3 + mult * 0.01
    const tremGain = ctx.createGain()
    tremGain.gain.value = 0.012
    const g = ctx.createGain()
    g.gain.value = 0.012
    trem.connect(tremGain).connect(g.gain)
    o.connect(g).connect(shimmer)
    o.start()
    trem.start()
    oscs.push(o)
  }
  shimmer.connect(out)

  return { out, filter, oscs, wind, windGain, shimmer }
}

export const ambient = {
  /** fade in on the cell's root note (index 0..2); -1 is the menu */
  play(levelIndex: number) {
    const { ctx } = ensure()
    if (!amb) amb = buildAmbient()
    ambOn = true
    const root = levelIndex < 0 ? ROOTS[0] * 0.75 : ROOTS[levelIndex % ROOTS.length]
    const t = ctx.currentTime
    amb.oscs.forEach((o, i) => {
      const base = i < 4 ? [1, 1, 1.5, 2][i] : [8, 12][i - 4]
      o.frequency.setTargetAtTime(root * base, t, 1.2)
    })
    amb.out.gain.setTargetAtTime(levelIndex < 0 ? 0.55 : 0.8, t, 1.5)
  },
  /** 0 = dusty and muffled, 1 = clean and open */
  setClarity(k: number) {
    if (!amb || !ctx) return
    const t = ctx.currentTime
    amb.filter.frequency.setTargetAtTime(380 + k * 1400, t, 0.8)
    amb.windGain.gain.setTargetAtTime(0.05 * (1 - k * 0.7), t, 0.8)
    amb.shimmer.gain.setTargetAtTime(k * k, t, 1.2)
  },
  stop() {
    if (!amb || !ctx || !ambOn) return
    ambOn = false
    amb.out.gain.setTargetAtTime(0, ctx.currentTime, 0.8)
  },
}
