import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WAVELENGTHS } from '../levels/types'
import { LAB_Y, useGame } from '../store/useGame'
import { createBeamAuraMaterial } from './materials'
import { flareTexture, streakTexture } from './textures'

const UP = new THREE.Vector3(0, 1, 0)
const BEAM_Y = LAB_Y + 1
const PACKETS = 3
const SPEED = 16

export function Beam() {
  const trace = useGame((s) => s.trace)
  const phase = useGame((s) => s.phase)
  const visible = phase === 'playing' || phase === 'clear' || phase === 'finale'

  const coreGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 1, 8, 1, true), [])
  const auraGeo = useMemo(() => new THREE.CylinderGeometry(0.26, 0.26, 1, 18, 1, true), [])
  const haloGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 1, 18, 1, true), [])
  const coreMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.95 }),
    [],
  )

  const segs = useMemo(
    () =>
      trace.segments.map((s) => {
        const from = new THREE.Vector3(s.from[0], BEAM_Y, s.from[1])
        const to = new THREE.Vector3(s.to[0], BEAM_Y, s.to[1])
        const dir = to.clone().sub(from)
        const len = Math.max(0.001, dir.length())
        const mid = from.clone().add(to).multiplyScalar(0.5)
        const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize())
        const aura = createBeamAuraMaterial(WAVELENGTHS[s.wl].color)
        aura.uniforms.uLen.value = len
        const halo = createBeamAuraMaterial(WAVELENGTHS[s.wl].color)
        halo.uniforms.uLen.value = len
        return { from, to, len, mid, q, aura, halo, wl: s.wl }
      }),
    [trace],
  )

  useEffect(
    () => () => {
      segs.forEach((s) => {
        s.aura.dispose()
        s.halo.dispose()
      })
    },
    [segs],
  )

  const packets = useRef<THREE.Group[]>([])
  const hitLight = useRef<THREE.PointLight>(null)
  const flare = useRef<THREE.Sprite>(null)
  const flareMap = useMemo(() => flareTexture(), [])
  const streakMap = useMemo(() => streakTexture(), [])
  const hitStreak = useRef<THREE.Sprite>(null)
  const lensStreak = useRef<THREE.Sprite>(null)
  const dirTmp = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    segs.forEach((s) => {
      s.aura.uniforms.uTime.value = t
      s.halo.uniforms.uTime.value = t * 0.6
    })
    const total = trace.length
    for (let i = 0; i < PACKETS; i++) {
      const g = packets.current[i]
      if (!g) continue
      if (total <= 0.01) {
        g.visible = false
        continue
      }
      g.visible = true
      let d = (t * SPEED + (i * total) / PACKETS) % total
      let seg = segs[0]
      for (const s of segs) {
        if (d <= s.len) {
          seg = s
          break
        }
        d -= s.len
      }
      if (!seg) continue
      tmp.copy(seg.from).lerp(seg.to, d / seg.len)
      g.position.copy(tmp)
      const light = g.children[0] as THREE.PointLight
      const sphere = g.children[1] as THREE.Mesh
      const streak = g.children[2] as THREE.Sprite
      const col = WAVELENGTHS[seg.wl].color
      light.color.set(col)
      ;(sphere.material as THREE.MeshBasicMaterial).color.set(col)
      ;(streak.material as THREE.SpriteMaterial).color.set(col)
      light.intensity = 10 + Math.sin(t * 20 + i) * 2
    }
    if (lensStreak.current) {
      const s0 = segs[0]
      if (s0) {
        dirTmp.subVectors(s0.to, s0.from).normalize()
        lensStreak.current.position.copy(s0.from).addScaledVector(dirTmp, 0.95)
        lensStreak.current.scale.set(4.5 + Math.sin(t * 7) * 0.3, 0.22, 1)
        ;(lensStreak.current.material as THREE.SpriteMaterial).color.set(WAVELENGTHS[s0.wl].color)
        lensStreak.current.visible = true
      } else {
        lensStreak.current.visible = false
      }
    }
    if (hitLight.current) {
      const h = trace.hit
      hitLight.current.position.set(h.at[0], BEAM_Y + 0.3, h.at[1])
      hitLight.current.color.set(WAVELENGTHS[h.wl].color)
      const base = h.action === 'burn' || h.action === 'shatter' ? 18 : h.action === 'receive' ? 14 : 6
      hitLight.current.intensity = base + Math.sin(t * 31) * base * 0.25
      if (flare.current) {
        flare.current.position.set(h.at[0], BEAM_Y, h.at[1])
        const big = h.action === 'burn' || h.action === 'shatter' || h.action === 'receive'
        const sc = (big ? 1.7 : 1.0) + Math.sin(t * 17) * 0.15
        flare.current.scale.set(sc, sc, 1)
        const fm = flare.current.material as THREE.SpriteMaterial
        fm.color.set(WAVELENGTHS[h.wl].color)
        fm.rotation = t * 0.6
        flare.current.visible = h.action !== 'none'
      }
      if (hitStreak.current) {
        const big = h.action === 'burn' || h.action === 'shatter' || h.action === 'receive'
        hitStreak.current.position.set(h.at[0], BEAM_Y, h.at[1])
        hitStreak.current.scale.set((big ? 7 : 4.2) + Math.sin(t * 13) * 0.4, big ? 0.34 : 0.24, 1)
        ;(hitStreak.current.material as THREE.SpriteMaterial).color.set(WAVELENGTHS[h.wl].color)
        hitStreak.current.visible = h.action !== 'none'
      }
    }
  })

  if (!visible) return null

  return (
    <group>
      {segs.map((s, i) => (
        <group key={i} position={s.mid} quaternion={s.q}>
          <mesh geometry={coreGeo} material={coreMat} scale={[1, s.len, 1]} />
          <mesh geometry={auraGeo} material={s.aura} scale={[1, s.len, 1]} />
          <mesh geometry={haloGeo} material={s.halo} scale={[1, s.len, 1]} />
        </group>
      ))}
      {Array.from({ length: PACKETS }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) packets.current[i] = el
          }}
        >
          <pointLight intensity={10} distance={9} decay={2} color="#00f0ff" />
          <mesh>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <sprite scale={[1.8, 0.1, 1]}>
            <spriteMaterial map={streakMap} color="#00f0ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      ))}
      <pointLight ref={hitLight} intensity={6} distance={7} decay={2} />
      <sprite ref={hitStreak} scale={[5, 0.3, 1]}>
        <spriteMaterial map={streakMap} color="#00f0ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite ref={lensStreak} scale={[4.5, 0.22, 1]}>
        <spriteMaterial map={streakMap} color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite ref={flare} scale={[1.4, 1.4, 1]}>
        <spriteMaterial map={flareMap} color="#00f0ff" transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}
