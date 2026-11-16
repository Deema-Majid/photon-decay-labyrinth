import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { volatile } from '../../store/useGame'

interface Props {
  id: string
  position: [number, number, number]
}

export function DustCloud({ id, position }: Props) {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
  const light = useRef<THREE.PointLight>(null)

  const puffs = useMemo(() => {
    let seed = position[0] * 5 + position[2] * 3 + 23
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 7 }).map(() => ({
      x: (rnd() - 0.5) * 1.3,
      y: 0.5 + rnd() * 1.1,
      z: (rnd() - 0.5) * 1.3,
      r: 0.38 + rnd() * 0.42,
      sp: 0.3 + rnd() * 0.6,
    }))
  }, [position])

  useFrame(({ clock }, dt) => {
    const dmg = volatile.damage[id] ?? 0
    const t = clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.25
      const sc = 1 - dmg * 0.45
      group.current.scale.setScalar(sc)
    }
    mats.current.forEach((m, i) => {
      if (!m) return
      m.emissiveIntensity += (dmg * 4 - m.emissiveIntensity) * Math.min(1, dt * 8)
      m.opacity = 0.55 - dmg * 0.25 + Math.sin(t * puffs[i].sp + i) * 0.05
    })
    if (light.current) light.current.intensity = dmg * 10
  })

  return (
    <group position={position}>
      <group ref={group}>
        {puffs.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]} scale={p.r}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              ref={(m) => {
                if (m) mats.current[i] = m
              }}
              color="#b98b4a"
              emissive="#ff5a00"
              emissiveIntensity={0}
              transparent
              opacity={0.55}
              roughness={1}
              flatShading
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <Sparkles count={40} scale={[1.8, 1.8, 1.8]} position={[0, 1, 0]} size={3} speed={0.6} color="#ffd79a" opacity={0.7} />
      <pointLight ref={light} color="#ff7a1a" intensity={0} distance={5} position={[0, 1, 0]} />
    </group>
  )
}
