import * as THREE from 'three'

/** Procedural canvas textures. Each is created once and shared. */

const cache = new Map<string, THREE.Texture>()

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function finish(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number] } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1])
  if (opts.srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

/** Monocrystalline solar cell: dark blue cells, silver busbars, chamfered corners. */
export function solarCellTexture() {
  const key = 'solar'
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(512, 320)
  ctx.fillStyle = '#c9ccd2'
  ctx.fillRect(0, 0, 512, 320)
  const cols = 6
  const rows = 4
  const cw = 512 / cols
  const ch = 320 / rows
  const rnd = seeded(3)
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + 3
      const y = r * ch + 3
      const w = cw - 6
      const h = ch - 6
      const g = ctx.createLinearGradient(x, y, x + w, y + h)
      const v = 0.9 + rnd() * 0.2
      g.addColorStop(0, `rgb(${Math.round(16 * v)}, ${Math.round(34 * v)}, ${Math.round(78 * v)})`)
      g.addColorStop(1, `rgb(${Math.round(8 * v)}, ${Math.round(22 * v)}, ${Math.round(58 * v)})`)
      ctx.fillStyle = g
      const ch2 = 8
      ctx.beginPath()
      ctx.moveTo(x + ch2, y)
      ctx.lineTo(x + w - ch2, y)
      ctx.lineTo(x + w, y + ch2)
      ctx.lineTo(x + w, y + h - ch2)
      ctx.lineTo(x + w - ch2, y + h)
      ctx.lineTo(x + ch2, y + h)
      ctx.lineTo(x, y + h - ch2)
      ctx.lineTo(x, y + ch2)
      ctx.closePath()
      ctx.fill()
      // busbars
      ctx.strokeStyle = 'rgba(214, 220, 230, 0.85)'
      ctx.lineWidth = 1.6
      for (let b = 1; b <= 3; b++) {
        const bx = x + (w * b) / 4
        ctx.beginPath()
        ctx.moveTo(bx, y + 2)
        ctx.lineTo(bx, y + h - 2)
        ctx.stroke()
      }
      // fingers
      ctx.strokeStyle = 'rgba(190, 200, 215, 0.35)'
      ctx.lineWidth = 0.6
      for (let f = 1; f < 14; f++) {
        const fy = y + (h * f) / 14
        ctx.beginPath()
        ctx.moveTo(x + 2, fy)
        ctx.lineTo(x + w - 2, fy)
        ctx.stroke()
      }
    }
  }
  const t = finish(c, { srgb: true })
  cache.set(key, t)
  return t
}

/** Grainy noise used as a roughness / dust map. */
export function noiseTexture(size = 256, key = 'noise', contrast = 1) {
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(size, size)
  const img = ctx.createImageData(size, size)
  const rnd = seeded(11)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.min(255, Math.max(0, 128 + (rnd() - 0.5) * 255 * contrast))
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  // soften with a few blurred blotches
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 40; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 10 + rnd() * 50
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const l = rnd() > 0.5 ? 255 : 60
    g.addColorStop(0, `rgba(${l},${l},${l},0.7)`)
    g.addColorStop(1, `rgba(${l},${l},${l},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  const t = finish(c, { repeat: [4, 4] })
  cache.set(key, t)
  return t
}

/** Soft radial puff for sprite-based dust clouds. */
export function puffTexture() {
  const key = 'puff'
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(256, 256)
  const rnd = seeded(5)
  for (let i = 0; i < 9; i++) {
    const x = 128 + (rnd() - 0.5) * 90
    const y = 128 + (rnd() - 0.5) * 90
    const r = 50 + rnd() * 60
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  cache.set(key, t)
  return t
}

/** Lens-flare style glow: hot core with streaks. */
export function flareTexture() {
  const key = 'flare'
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(256, 256)
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.12, 'rgba(255,255,255,0.7)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  ctx.globalCompositeOperation = 'lighter'
  for (const [w, h] of [
    [250, 6],
    [6, 250],
    [170, 3],
  ] as const) {
    const sg = ctx.createLinearGradient(128 - w / 2, 0, 128 + w / 2, 0)
    sg.addColorStop(0, 'rgba(255,255,255,0)')
    sg.addColorStop(0.5, 'rgba(255,255,255,0.75)')
    sg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = sg
    ctx.save()
    ctx.translate(128, 128)
    if (h > w) ctx.rotate(Math.PI / 2)
    ctx.fillRect(-Math.max(w, h) / 2, -Math.min(w, h) / 2, Math.max(w, h), Math.min(w, h))
    ctx.restore()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  cache.set(key, t)
  return t
}

/** Anamorphic lens streak: a thin horizontal line with a soft falloff. */
export function streakTexture() {
  const key = 'streak'
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(512, 32)
  const gx = ctx.createLinearGradient(0, 0, 512, 0)
  gx.addColorStop(0, 'rgba(255,255,255,0)')
  gx.addColorStop(0.35, 'rgba(255,255,255,0.25)')
  gx.addColorStop(0.5, 'rgba(255,255,255,1)')
  gx.addColorStop(0.65, 'rgba(255,255,255,0.25)')
  gx.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gx
  ctx.fillRect(0, 0, 512, 32)
  // vertical falloff
  ctx.globalCompositeOperation = 'destination-in'
  const gy = ctx.createLinearGradient(0, 0, 0, 32)
  gy.addColorStop(0, 'rgba(0,0,0,0)')
  gy.addColorStop(0.5, 'rgba(0,0,0,1)')
  gy.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gy
  ctx.fillRect(0, 0, 512, 32)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  cache.set(key, t)
  return t
}

/** Random lit windows for city facades (emissive map). */
export function windowsTexture() {
  const key = 'windows'
  if (cache.has(key)) return cache.get(key)!
  const { c, ctx } = canvas(128, 256)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 128, 256)
  const rnd = seeded(21)
  const cols = 6
  const rows = 16
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      if (rnd() < 0.45) continue
      const x = col * (128 / cols) + 4
      const y = r * (256 / rows) + 3
      const warm = rnd() < 0.25
      const a = 0.4 + rnd() * 0.6
      ctx.fillStyle = warm ? `rgba(255,214,150,${a})` : `rgba(140,245,255,${a})`
      ctx.fillRect(x, y, 128 / cols - 8, 256 / rows - 6)
    }
  }
  const t = finish(c, { srgb: true, repeat: [1, 1] })
  cache.set(key, t)
  return t
}

/** Hexagonal silicon cell pattern for the labyrinth floor (used as roughness + faint emissive). */
export function hexFloorTexture() {
  const key = 'hex'
  if (cache.has(key)) return cache.get(key)!
  const size = 512
  const { c, ctx } = canvas(size, size)
  ctx.fillStyle = '#9a9a9a'
  ctx.fillRect(0, 0, size, size)
  const r = 26
  const h = Math.sqrt(3) * r
  ctx.strokeStyle = '#3a3a3a'
  ctx.lineWidth = 3
  for (let y = -h; y < size + h; y += h) {
    for (let x = -r, i = 0; x < size + r; x += 3 * r, i++) {
      const cx = x + (Math.round(y / h) % 2 ? 1.5 * r : 0)
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k
        const px = cx + r * Math.cos(a)
        const py = y + r * Math.sin(a)
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }
  const t = finish(c, { repeat: [6, 6] })
  cache.set(key, t)
  return t
}
