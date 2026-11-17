import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BURN_TIME, CHARGE_TIME, SHATTER_TIME, SPHERE_PERIOD, useGame, volatile } from '../store/useGame'

/** Drives burn / shatter / charge timers and moving obstacles. Runs every frame, renders nothing. */
export function GameLoop() {
  const fpsAcc = useRef({ t: 0, n: 0, slow: 0 })

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const s = useGame.getState()
    volatile.frames++

    // auto quality: drop to the light preset after sustained low frame rate while playing
    const acc = fpsAcc.current
    acc.t += dt
    acc.n += 1
    if (acc.t >= 1) {
      const fps = acc.n / acc.t
      acc.t = 0
      acc.n = 0
      if (s.phase === 'playing' && !s.paused && s.quality === 'high' && !volatile.autoQualityDone && document.visibilityState === 'visible') {
        acc.slow = fps < 27 ? acc.slow + 1 : 0
        if (acc.slow >= 3) {
          volatile.autoQualityDone = true
          s.setQuality('low')
          s.say('lumen.autoQuality')
        }
      }
    }

    volatile.trauma = Math.max(0, volatile.trauma - d * 1.6)

    const targetClean = (s.completed + (s.phase === 'playing' ? s.restoration : 0)) / 3
    volatile.worldClean += (Math.min(1, targetClean) - volatile.worldClean) * Math.min(1, d * 0.8)

    if (s.phase !== 'playing' || s.paused) return

    const hit = s.trace.hit
    if (hit.cellId) {
      if (hit.action === 'burn' || hit.action === 'shatter') {
        const total = hit.action === 'burn' ? BURN_TIME : SHATTER_TIME
        const v = (volatile.damage[hit.cellId] ?? 0) + d / total
        volatile.damage[hit.cellId] = v
        if (v >= 1) s.destroyCell(hit.cellId)
      } else if (hit.action === 'receive') {
        const v = (volatile.charge[hit.cellId] ?? 0) + d / CHARGE_TIME
        volatile.charge[hit.cellId] = v
        if (v >= 1 && !s.runtime[hit.cellId]?.locked) s.lockReceiver(hit.cellId)
      }
    }
    for (const id of Object.keys(volatile.charge)) {
      if (id !== hit.cellId && !s.runtime[id]?.locked) {
        volatile.charge[id] = Math.max(0, (volatile.charge[id] ?? 0) - d * 0.5)
      }
    }
    for (const id of Object.keys(volatile.damage)) {
      if (id !== hit.cellId) {
        volatile.damage[id] = Math.max(0, (volatile.damage[id] ?? 0) - d * 0.4)
      }
    }

    volatile.sphereClock += d
    if (volatile.sphereClock >= SPHERE_PERIOD) {
      volatile.sphereClock = 0
      s.advanceSpheres()
    }
  })
  return null
}
