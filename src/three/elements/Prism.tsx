import { MeshTransmissionMaterial, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGame } from '../../store/useGame'
import { damp } from '../materials'
import { registerTransmissive, unregisterTransmissive, useSceneRefs } from '../refs'

interface Props {
  id: string
  position: [number, number, number]
  accent: string
}

export function Prism({ id, position, accent }: Props) {
  const rot = useGame((s) => s.runtime[id]?.rot ?? 0)
  const rotatePrism = useGame((s) => s.rotatePrism)
  const setHovered = useGame((s) => s.setHovered)
  const buffer = useSceneRefs((s) => s.buffer)
  const hinted = useGame((s) => !s.photo && s.hint?.type === 'rotate' && s.hint.id === id)
  const beacon = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const slab = useRef<THREE.Group>(null)
  const glass = useRef<THREE.Mesh>(null)
  const frameMat = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)
  const targetY = Math.PI / 4 - rot * (Math.PI / 2)
  const spin = useRef(targetY)

  useEffect(() => {
    const m = glass.current
    registerTransmissive(m)
    return () => unregisterTransmissive(m)
  }, [])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    spin.current = damp(spin.current, targetY, 10, dt)
    if (slab.current) {
      slab.current.rotation.y = spin.current
      slab.current.position.y = 1.05 + Math.sin(t * 1.6 + position[0]) * 0.05
      const sc = damp(slab.current.scale.x, hover ? 1.08 : 1, 10, dt)
      slab.current.scale.setScalar(sc)
    }
    if (frameMat.current) {
      frameMat.current.emissiveIntensity = damp(frameMat.current.emissiveIntensity, hover ? 5 : 2, 8, dt)
    }
    if (ring.current) ring.current.rotation.y = t * 0.8
    if (beacon.current) {
      const pulse = 0.75 + Math.sin(t * 6) * 0.25
      beacon.current.scale.set(pulse, 1, pulse)
      beacon.current.rotation.y = t * 1.5
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    rotatePrism(id)
  }

  return (
    <group position={position}>
      {/* hex pedestal with inset ring and pivot column */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.78, 0.9, 0.2, 6]} />
        <meshStandardMaterial color="#141a22" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.08, 24]} />
        <meshStandardMaterial color="#0b0f14" metalness={1} roughness={0.25} />
      </mesh>
      <mesh ref={ring} position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.025, 8, 48]} />
        <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {hinted ? (
        <group ref={beacon}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.55, 0.85, 6, 24, 1, true]} />
            <meshBasicMaterial
              color="#fcd34d"
              transparent
              opacity={0.16}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95, 1.12, 40]} />
            <meshBasicMaterial color="#fcd34d" transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.5, 12]} />
        <meshStandardMaterial color="#232a33" metalness={0.9} roughness={0.3} />
      </mesh>
      <group
        ref={slab}
        position={[0, 1.05, 0]}
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
        <mesh ref={glass} castShadow>
          <boxGeometry args={[1.5, 1.15, 0.18]} />
          <MeshTransmissionMaterial
            buffer={buffer ?? undefined}
            resolution={32}
            backsideResolution={32}
            samples={4}
            transmission={1}
            thickness={0.6}
            ior={1.62}
            chromaticAberration={0.1}
            anisotropicBlur={0.15}
            distortion={0.25}
            distortionScale={0.4}
            temporalDistortion={0.08}
            roughness={0.04}
            clearcoat={1}
            iridescence={1}
            iridescenceIOR={1.5}
            color="#dff6ff"
            attenuationColor="#9fe8ff"
            attenuationDistance={1.5}
            envMapIntensity={2.2}
          />
        </mesh>
        {/* inner lattice seen through the glass */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.3, 1.0, 6, 4]} />
          <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={0.9} wireframe toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.2, 24]} />
          <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* bevelled metal frame: four bars */}
        {[
          { p: [0, 0.6, 0] as [number, number, number], a: [1.6, 0.07, 0.24] as [number, number, number] },
          { p: [0, -0.6, 0] as [number, number, number], a: [1.6, 0.07, 0.24] as [number, number, number] },
          { p: [0.78, 0, 0] as [number, number, number], a: [0.07, 1.25, 0.24] as [number, number, number] },
          { p: [-0.78, 0, 0] as [number, number, number], a: [0.07, 1.25, 0.24] as [number, number, number] },
        ].map((b, i) => (
          <mesh key={i} position={b.p}>
            <boxGeometry args={b.a} />
            <meshStandardMaterial color="#2a313b" metalness={0.95} roughness={0.25} />
          </mesh>
        ))}
        {/* emissive trim strips inside the frame */}
        <mesh position={[0, 0.555, 0]}>
          <boxGeometry args={[1.5, 0.02, 0.26]} />
          <meshStandardMaterial ref={frameMat} color="#000" emissive={accent} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.555, 0]}>
          <boxGeometry args={[1.5, 0.02, 0.26]} />
          <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={2} toneMapped={false} />
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
