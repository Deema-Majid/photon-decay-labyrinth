import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame, volatile } from '../store/useGame'
import { flareTexture, windowsTexture } from './textures'

const COUNT = 260

export function City() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const spires = useRef<THREE.Group>(null)
  const glow = useRef<THREE.SpriteMaterial>(null)
  const windows = useMemo(() => windowsTexture(), [])
  const flare = useMemo(() => flareTexture(), [])

  const data = useMemo(() => {
    const arr: { x: number; z: number; w: number; h: number; d: number }[] = []
    let seed = 42
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    for (let i = 0; i < COUNT; i++) {
      const z = -30 - rnd() * 52
      const far = (-z - 30) / 52
      arr.push({
        x: (rnd() - 0.5) * (64 + far * 70),
        z,
        w: 1.5 + rnd() * 3.2,
        h: 3 + rnd() * rnd() * 26 + far * 8,
        d: 1.5 + rnd() * 3.2,
      })
    }
    return arr
  }, [])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  const lastEased = useRef(-1)

  useLayoutEffect(() => {
    if (!mesh.current) return
    const c = new THREE.Color()
    data.forEach((_, i) => {
      c.setHSL(0.52 + Math.random() * 0.05, 0.5, 0.1 + Math.random() * 0.1)
      mesh.current!.setColorAt(i, c)
    })
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [data])

  useFrame(({ clock }, dt) => {
    const rise = volatile.worldClean
    const eased = rise * rise * (3 - 2 * rise)
    if (mesh.current && Math.abs(eased - lastEased.current) > 1e-4) {
      lastEased.current = eased
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
    if (mat.current) mat.current.emissiveIntensity = 0.2 + eased * 2.2
    if (spires.current) {
      spires.current.scale.y = Math.max(0.01, eased)
      spires.current.rotation.y += dt * 0.05
      spires.current.visible = eased > 0.01
    }
    if (glow.current) glow.current.opacity = eased * 0.55 + Math.sin(clock.getElapsedTime() * 0.7) * 0.03
  })

  const completed = useGame((s) => s.completed)
  const phase = useGame((s) => s.phase)
  const lightsOpacity = phase === 'finale' ? 0.95 : (completed / 3) * 0.8

  return (
    <group position={[0, LAB_Y - 0.2, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={mat}
          color="#0b1a24"
          emissive="#ffffff"
          emissiveMap={windows}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
          toneMapped={false}
        />
      </instancedMesh>
      <group ref={spires} position={[0, 0, -50]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[(i - 1) * 15, 0, (i % 2) * -6]}>
            <mesh position={[0, 16, 0]}>
              <cylinderGeometry args={[0.25, 1.6, 32, 6]} />
              <meshStandardMaterial color="#061217" emissive="#00f0ff" emissiveIntensity={2.4} toneMapped={false} />
            </mesh>
            {[8, 16, 24].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.9 - y * 0.04, 0.08, 6, 24]} />
                <meshStandardMaterial color="#061217" emissive="#9ff8ff" emissiveIntensity={2} toneMapped={false} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, 33, 0]}>
          <torusGeometry args={[5, 0.18, 8, 48]} />
          <meshStandardMaterial color="#061217" emissive="#9ff8ff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
      {/* horizon glow */}
      <sprite position={[0, 6, -82]} scale={[160, 36, 1]}>
        <spriteMaterial ref={glow} map={flare} color="#17b8c9" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {lightsOpacity > 0.01 ? (
        <Sparkles count={700} scale={[110, 26, 50]} position={[0, 12, -54]} size={3} speed={0.08} color="#7df9ff" opacity={lightsOpacity} />
      ) : null}
    </group>
  )
}
