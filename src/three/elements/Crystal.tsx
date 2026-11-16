import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { volatile } from '../../store/useGame'

interface Props {
  id: string
  position: [number, number, number]
}

export function Crystal({ id, position }: Props) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const light = useRef<THREE.PointLight>(null)

  const spires = useMemo(() => {
    let seed = position[0] * 13 + position[2] * 7 + 11
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 6 }).map((_, i) => ({
      x: (rnd() - 0.5) * 0.9,
      z: (rnd() - 0.5) * 0.9,
      h: 0.8 + rnd() * 1.3 + (i === 0 ? 0.6 : 0),
      r: 0.18 + rnd() * 0.18,
      tilt: (rnd() - 0.5) * 0.5,
      yaw: rnd() * Math.PI,
    }))
  }, [position])

  useFrame(({ clock }, dt) => {
    const dmg = volatile.damage[id] ?? 0
    const t = clock.getElapsedTime()
    if (group.current) {
      const shake = dmg * dmg * 0.12
      group.current.position.set(
        position[0] + Math.sin(t * 70) * shake,
        position[1] + Math.sin(t * 1.2 + position[0]) * 0.02,
        position[2] + Math.cos(t * 63) * shake,
      )
    }
    if (mat.current) {
      mat.current.emissiveIntensity += (dmg * 3.5 - mat.current.emissiveIntensity) * Math.min(1, dt * 10)
    }
    if (light.current) light.current.intensity = dmg * 12
  })

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.1, 7]} />
        <meshStandardMaterial color="#1c2a33" roughness={0.6} metalness={0.5} />
      </mesh>
      {spires.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.h / 2, s.z]}
          rotation={[s.tilt, s.yaw, s.tilt * 0.7]}
          scale={[s.r, s.h / 2, s.r]}
          castShadow
        >
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            ref={i === 0 ? mat : undefined}
            color="#e8f8ff"
            transmission={0.9}
            thickness={1.2}
            ior={1.54}
            roughness={0.12}
            iridescence={0.8}
            iridescenceIOR={1.4}
            emissive="#A855F7"
            emissiveIntensity={0}
            attenuationColor="#c7f1ff"
            attenuationDistance={2}
          />
        </mesh>
      ))}
      <pointLight ref={light} color="#A855F7" intensity={0} distance={5} position={[0, 1, 0]} />
    </group>
  )
}
