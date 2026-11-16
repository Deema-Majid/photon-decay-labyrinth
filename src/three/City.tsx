import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame, volatile } from '../store/useGame'

const COUNT = 240

export function City() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const spires = useRef<THREE.Group>(null)
  const group = useRef<THREE.Group>(null)

  const data = useMemo(() => {
    const arr: { x: number; z: number; w: number; h: number; d: number }[] = []
    let seed = 42
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    for (let i = 0; i < COUNT; i++) {
      const z = -30 - rnd() * 48
      const far = (-z - 30) / 48
      arr.push({
        x: (rnd() - 0.5) * (60 + far * 60),
        z,
        w: 1.5 + rnd() * 3,
        h: 3 + rnd() * rnd() * 24 + far * 6,
        d: 1.5 + rnd() * 3,
      })
    }
    return arr
  }, [])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const c = new THREE.Color()
    data.forEach((_, i) => {
      c.setHSL(0.52 + Math.random() * 0.05, 0.6, 0.08 + Math.random() * 0.08)
      mesh.current!.setColorAt(i, c)
    })
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [data])

  useFrame(({ clock }, dt) => {
    const rise = volatile.worldClean
    const eased = rise * rise * (3 - 2 * rise)
    if (mesh.current) {
      data.forEach((b, i) => {
        const h = Math.max(0.05, b.h * eased)
        v.set(b.x, h / 2, b.z)
        sc.set(b.w, h, b.d)
        m.compose(v, q, sc)
        mesh.current!.setMatrixAt(i, m)
      })
      mesh.current.instanceMatrix.needsUpdate = true
      mesh.current.visible = eased > 0.01
    }
    if (mat.current) mat.current.emissiveIntensity = 0.15 + eased * 1.6
    if (spires.current) {
      spires.current.scale.y = Math.max(0.01, eased)
      spires.current.rotation.y += dt * 0.05
      spires.current.visible = eased > 0.01
    }
    if (group.current) {
      const t = clock.getElapsedTime()
      group.current.position.y = LAB_Y - 0.2 + Math.sin(t * 0.5) * 0.02
    }
  })

  const completed = useGame((s) => s.completed)
  const phase = useGame((s) => s.phase)
  const lightsOpacity = phase === 'finale' ? 0.95 : (completed / 3) * 0.8

  return (
    <group ref={group} position={[0, LAB_Y - 0.2, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={mat}
          color="#0b1a24"
          emissive="#00c8d8"
          emissiveIntensity={0.2}
          roughness={0.25}
          metalness={0.7}
          toneMapped={false}
        />
      </instancedMesh>
      <group ref={spires} position={[0, 0, -48]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 14, 16, (i % 2) * -6]}>
            <cylinderGeometry args={[0.25, 1.4, 32, 6]} />
            <meshStandardMaterial color="#061217" emissive="#00f0ff" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 33, 0]}>
          <torusGeometry args={[5, 0.18, 8, 48]} />
          <meshStandardMaterial color="#061217" emissive="#9ff8ff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
      {lightsOpacity > 0.01 ? (
        <Sparkles count={700} scale={[110, 26, 50]} position={[0, 12, -54]} size={3} speed={0.08} color="#7df9ff" opacity={lightsOpacity} />
      ) : null}
    </group>
  )
}
