import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { on, type BurstKind } from '../engine/events'
import { LAB_Y } from '../store/useGame'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  max: number
  rx: number
  ry: number
  spin: number
  size: number
}

interface PoolProps {
  kind: BurstKind
  max: number
  gravity: number
  drag: number
  life: [number, number]
  speed: number
  size: [number, number]
  bounce: boolean
  children: React.ReactNode
}

function Pool({ kind, max, gravity, drag, life, speed, size, bounce, children }: PoolProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const parts = useRef<Particle[]>([])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const s = useMemo(() => new THREE.Vector3(), [])
  const col = useMemo(() => new THREE.Color(), [])

  useEffect(
    () =>
      on('burst', (ev) => {
        if (ev.kind !== kind || !mesh.current) return
        col.set(ev.color)
        for (let i = 0; i < ev.count; i++) {
          if (parts.current.length >= max) parts.current.shift()
          const a = Math.random() * Math.PI * 2
          const b = (Math.random() - 0.2) * Math.PI
          const sp = speed * (0.4 + Math.random() * 0.9)
          parts.current.push({
            x: ev.position[0] + (Math.random() - 0.5) * 0.6,
            y: ev.position[1] + Math.random() * 0.8,
            z: ev.position[2] + (Math.random() - 0.5) * 0.6,
            vx: Math.cos(a) * Math.cos(b) * sp,
            vy: Math.abs(Math.sin(b)) * sp * (gravity > 0 ? 0.9 : 1.1),
            vz: Math.sin(a) * Math.cos(b) * sp,
            life: 0,
            max: life[0] + Math.random() * (life[1] - life[0]),
            rx: Math.random() * Math.PI,
            ry: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 12,
            size: size[0] + Math.random() * (size[1] - size[0]),
          })
        }
        for (let i = 0; i < max; i++) mesh.current.setColorAt(i, col)
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
      }),
    [kind, max, speed, life, size, gravity, col],
  )

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const list = parts.current
    const floor = LAB_Y + 0.05
    let i = 0
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k]
      p.life += d
      if (p.life >= p.max) {
        list.splice(k, 1)
        continue
      }
      p.vy += gravity * d
      p.vx *= 1 - drag * d
      p.vz *= 1 - drag * d
      p.x += p.vx * d
      p.y += p.vy * d
      p.z += p.vz * d
      if (bounce && p.y < floor) {
        p.y = floor
        p.vy = -p.vy * 0.35
        p.vx *= 0.6
        p.vz *= 0.6
      }
      p.rx += p.spin * d
      p.ry += p.spin * 0.7 * d
    }
    if (!mesh.current) return
    for (const p of list) {
      const t = p.life / p.max
      const fade = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3
      v.set(p.x, p.y, p.z)
      e.set(p.rx, p.ry, 0)
      q.setFromEuler(e)
      s.setScalar(p.size * fade)
      m.compose(v, q, s)
      mesh.current.setMatrixAt(i++, m)
    }
    s.setScalar(0)
    v.set(0, LAB_Y - 10, 0)
    m.compose(v, q, s)
    for (; i < max; i++) mesh.current.setMatrixAt(i, m)
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, max]} frustumCulled={false}>
      {children}
    </instancedMesh>
  )
}

export function Bursts() {
  return (
    <>
      <Pool kind="shards" max={260} gravity={-16} drag={0.6} life={[1.2, 2.4]} speed={7} size={[0.08, 0.22]} bounce>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#a0e8ff" emissiveIntensity={1.2} metalness={0.3} roughness={0.15} toneMapped={false} />
      </Pool>
      <Pool kind="embers" max={300} gravity={2.2} drag={1.2} life={[0.8, 1.8]} speed={3.2} size={[0.04, 0.11]} bounce={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </Pool>
      <Pool kind="spark" max={200} gravity={-5} drag={1.5} life={[0.3, 0.8]} speed={9} size={[0.03, 0.07]} bounce={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </Pool>
    </>
  )
}
