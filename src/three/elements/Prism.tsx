import { useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGame } from '../../store/useGame'
import { damp } from '../materials'

interface Props {
  id: string
  position: [number, number, number]
  accent: string
}

export function Prism({ id, position, accent }: Props) {
  const rot = useGame((s) => s.runtime[id]?.rot ?? 0)
  const rotatePrism = useGame((s) => s.rotatePrism)
  const setHovered = useGame((s) => s.setHovered)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const slab = useRef<THREE.Group>(null)
  const frameMat = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)
  const targetY = Math.PI / 4 - rot * (Math.PI / 2)
  const spin = useRef(targetY)

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    spin.current = damp(spin.current, targetY, 10, dt)
    if (slab.current) {
      slab.current.rotation.y = spin.current
      slab.current.position.y = 1 + Math.sin(t * 1.6 + position[0]) * 0.05
      const sc = damp(slab.current.scale.x, hover ? 1.1 : 1, 10, dt)
      slab.current.scale.setScalar(sc)
    }
    if (frameMat.current) {
      frameMat.current.emissiveIntensity = damp(frameMat.current.emissiveIntensity, hover ? 4.5 : 1.8, 8, dt)
    }
    if (ring.current) ring.current.rotation.y = t * 0.8
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    rotatePrism(id)
  }

  return (
    <group position={position}>
      {/* pedestal */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.24, 24]} />
        <meshStandardMaterial color="#141a22" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh ref={ring} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.025, 8, 48]} />
        <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <group
        ref={slab}
        position={[0, 1, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          setHovered(id)
        }}
        onPointerOut={() => {
          setHover(false)
          setHovered(null)
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.15, 0.16]} />
          <meshPhysicalMaterial
            color="#d9f4ff"
            transmission={0.96}
            thickness={0.7}
            ior={1.76}
            roughness={0.06}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            iridescence={1}
            iridescenceIOR={1.6}
            iridescenceThicknessMinimum={120}
            iridescenceThicknessMaximum={560}
            attenuationColor="#9fe8ff"
            attenuationDistance={1.6}
          />
        </mesh>
        {/* glowing frame edges */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.56, 0.05, 0.2]} />
          <meshStandardMaterial ref={frameMat} color="#000" emissive={accent} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[1.56, 0.05, 0.2]} />
          <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        {/* invisible wider hit target */}
        <mesh visible={false}>
          <boxGeometry args={[1.9, 1.5, 0.9]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  )
}
