import { MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { volatile } from '../../store/useGame'
import { registerTransmissive, unregisterTransmissive, useSceneRefs } from '../refs'

interface Props {
  id: string
  position: [number, number, number]
}

export function Crystal({ id, position }: Props) {
  const group = useRef<THREE.Group>(null)
  const spiresGroup = useRef<THREE.Group>(null)
  const mats = useRef<THREE.MeshPhysicalMaterial[]>([])
  const light = useRef<THREE.PointLight>(null)
  const buffer = useSceneRefs((s) => s.buffer)

  const spires = useMemo(() => {
    let seed = position[0] * 13 + position[2] * 7 + 11
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 5 }).map((_, i) => ({
      x: (rnd() - 0.5) * 1.1,
      z: (rnd() - 0.5) * 1.1,
      h: 1.0 + rnd() * 1.3 + (i === 0 ? 0.9 : 0),
      r: 0.18 + rnd() * 0.2,
      tilt: (rnd() - 0.5) * 0.6,
      yaw: rnd() * Math.PI,
    }))
  }, [position])

  const rocks = useMemo(() => {
    let seed = position[0] * 3 + position[2] * 17 + 5
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 5 }).map(() => ({
      x: (rnd() - 0.5) * 1.5,
      z: (rnd() - 0.5) * 1.5,
      s: 0.18 + rnd() * 0.25,
      r: rnd() * Math.PI,
    }))
  }, [position])

  useEffect(() => {
    const g = spiresGroup.current
    const list: THREE.Object3D[] = []
    g?.children.forEach((c) => {
      registerTransmissive(c)
      list.push(c)
    })
    return () => list.forEach((c) => unregisterTransmissive(c))
  }, [])

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
    mats.current.forEach((m) => {
      if (m) m.emissiveIntensity += (0.45 + dmg * 3.5 - m.emissiveIntensity) * Math.min(1, dt * 10)
    })
    if (light.current) light.current.intensity = dmg * 14 + 2
  })

  return (
    <group ref={group} position={position}>
      {/* rocky salt base */}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s * 0.5, r.z]} rotation={[r.r, r.r * 2, 0]} scale={r.s} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#dfe6ea" roughness={0.85} metalness={0.05} flatShading />
        </mesh>
      ))}
      <group ref={spiresGroup}>
        {spires.map((s, i) => (
          <mesh
            key={i}
            position={[s.x, s.h / 2 + 0.1, s.z]}
            rotation={[s.tilt, s.yaw, s.tilt * 0.7]}
            scale={[s.r, s.h / 2, s.r]}
            castShadow
          >
            <octahedronGeometry args={[1, 0]} />
            <MeshTransmissionMaterial
              ref={((m: THREE.MeshPhysicalMaterial | null) => {
                if (m) mats.current[i] = m
              }) as never}
              buffer={buffer ?? undefined}
              resolution={32}
              backsideResolution={32}
              samples={3}
              transmission={1}
              thickness={0.8}
              ior={1.54}
              chromaticAberration={0.06}
              anisotropicBlur={0.2}
              distortion={0.15}
              distortionScale={0.5}
              temporalDistortion={0.05}
              roughness={0.12}
              iridescence={0.7}
              iridescenceIOR={1.4}
              color="#d4f4ff"
              emissive="#7fb4ff"
              emissiveIntensity={0.45}
              attenuationColor="#c7f1ff"
              attenuationDistance={4}
              envMapIntensity={2}
            />
          </mesh>
        ))}
      </group>
      <pointLight ref={light} color="#bfe9ff" intensity={2} distance={5} position={[0, 1.2, 0]} />
    </group>
  )
}
