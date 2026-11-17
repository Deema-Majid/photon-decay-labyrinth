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
  dive() {
    tone(90, 2.2, 'sawtooth', 0.2, 6)
    noise(2.2, 0.25, 400)
  },
}
