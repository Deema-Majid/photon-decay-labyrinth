import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { DIR_VEC, WAVELENGTHS, type Dir, type Wavelength } from '../../levels/types'
import { useGame, useHQ, volatile } from '../../store/useGame'
import { damp } from '../materials'

type P = { position: [number, number, number] }

const METAL = { color: '#1a2129', metalness: 0.9, roughness: 0.3 }
const DARK = { color: '#0b0f14', metalness: 1, roughness: 0.2 }

export function Emitter({ position, dir, wl }: P & { dir: Dir; wl: Wavelength }) {
  const [dx, dz] = DIR_VEC[dir]
  const yaw = Math.atan2(dx, dz)
  const lens = useRef<THREE.MeshStandardMaterial>(null)
  const strip = useRef<THREE.MeshStandardMaterial>(null)
  const color = WAVELENGTHS[wl].color
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    if (lens.current) {
      lens.current.emissive.lerp(new THREE.Color(color), Math.min(1, dt * 8))
      lens.current.emissiveIntensity = 3.5 + Math.sin(t * 9) * 0.6
    }
    if (strip.current) {
      strip.current.emissive.lerp(new THREE.Color(color), Math.min(1, dt * 8))
      strip.current.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.5
    }
  })
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* base plate + housing */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.16, 6]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 0.7, -0.1]} castShadow>
        <boxGeometry args={[1.3, 1.1, 1.1]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* side vents */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={i} position={[0.66, 0.7 + y, -0.1]}>
          <boxGeometry args={[0.03, 0.12, 0.8]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={i} position={[-0.66, 0.7 + y, -0.1]}>
          <boxGeometry args={[0.03, 0.12, 0.8]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
      ))}
      {/* status strip */}
      <mesh position={[0, 1.27, -0.1]}>
        <boxGeometry args={[1.0, 0.03, 0.9]} />
        <meshStandardMaterial ref={strip} color="#000" emissive={color} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {/* barrel with cooling rings */}
      <mesh position={[0, 1, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.55, 24]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {[0.5, 0.68, 0.86].map((z, i) => (
        <mesh key={i} position={[0, 1, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36 - i * 0.03, 0.03, 8, 32]} />
          <meshStandardMaterial color="#39424d" metalness={0.95} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 1, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
        <meshStandardMaterial ref={lens} color="#fff" emissive={color} emissiveIntensity={3.5} toneMapped={false} />
      </mesh>
      {/* antenna */}
      <mesh position={[-0.4, 1.55, -0.4]}>
        <cylinderGeometry args={[0.02, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#39424d" metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[-0.4, 1.88, -0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000" emissive="#ff3b30" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Receiver({ id, position }: P & { id: string }) {
  const hq = useHQ()
  const locked = useGame((s) => s.runtime[id]?.locked ?? false)
  const core = useRef<THREE.MeshStandardMaterial>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const petals = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const level = useRef(0)
  useFrame(({ clock }, dt) => {
    const charge = locked ? 1 : Math.min(1, volatile.charge[id] ?? 0)
    level.current = damp(level.current, charge, 6, dt)
    const t = clock.getElapsedTime()
    if (core.current) core.current.emissiveIntensity = 0.3 + level.current * 4 + (locked ? Math.sin(t * 4) * 0.5 + 0.5 : 0)
    const spin = 0.4 + level.current * 4
    if (ringA.current) ringA.current.rotation.y = t * spin
    if (ringB.current) ringB.current.rotation.x = t * spin * 0.7
    if (petals.current) {
      petals.current.children.forEach((p, i) => {
        p.rotation.x = -0.9 + level.current * 0.7 + Math.sin(t * 2 + i) * 0.03
      })
    }
    if (light.current) light.current.intensity = level.current * 16
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.24, 6]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.2, 6]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* three petal plates that open as the receiver charges */}
      <group ref={petals} position={[0, 0.4, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
            <group position={[0, 0, 0.45]}>
              <mesh position={[0, 0.35, 0]} rotation={[-0.9, 0, 0]}>
                <boxGeometry args={[0.5, 0.7, 0.05]} />
                <meshStandardMaterial color="#1f2730" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
      <mesh position={[0, 1.05, 0]}>
        <icosahedronGeometry args={[0.3, 2]} />
        <meshStandardMaterial ref={core} color="#dffcff" emissive="#00F0FF" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <mesh ref={ringA} position={[0, 1.05, 0]}>
        <torusGeometry args={[0.62, 0.035, 8, 48]} />
        <meshStandardMaterial color="#223" emissive="#00F0FF" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.52, 0.03, 8, 48]} />
        <meshStandardMaterial color="#223" emissive="#9ff8ff" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <pointLight visible={hq} ref={light} color="#00F0FF" intensity={0} distance={6} position={[0, 1.2, 0]} />
      {locked ? <Sparkles count={30} scale={[1.6, 2, 1.6]} position={[0, 1.2, 0]} size={3} speed={0.8} color="#00F0FF" /> : null}
    </group>
  )
}

export function EnergyRing({ position, wl }: P & { wl: Wavelength }) {
  const hq = useHQ()
  const g = useRef<THREE.Group>(null)
  const color = WAVELENGTHS[wl].color
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      g.current.rotation.y = t * 0.9
      g.current.position.y = 1 + Math.sin(t * 1.3) * 0.06
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.2, 6]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.55, 0.3, Math.sin((i * Math.PI) / 2) * 0.55]}>
          <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#39424d" metalness={0.95} roughness={0.25} />
        </mesh>
      ))}
      <group ref={g} position={[0, 1, 0]}>
        <mesh>
          <torusGeometry args={[0.8, 0.05, 10, 60]} />
          <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.8, 0.05, 10, 60]} />
          <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.02, 8, 60]} />
          <meshStandardMaterial color="#223" emissive={color} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>
      <Sparkles count={40} scale={[2, 2, 2]} position={[0, 1, 0]} size={2.5} speed={1.2} color={color} />
      <pointLight visible={hq} color={color} intensity={6} distance={5} position={[0, 1, 0]} />
    </group>
  )
}

export function Vortex({ position, accent }: P & { accent: string }) {
  const hq = useHQ()
  const g = useRef<THREE.Group>(null)
  const disc = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) g.current.rotation.y = t * 3.2
    if (disc.current) disc.current.rotation.z = -t * 1.1
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.1, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh ref={disc} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.95, 48, 1]} />
        <meshStandardMaterial color="#0a0a14" emissive={accent} emissiveIntensity={1.2} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <group ref={g} position={[0, 1, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 3]}>
            <torusGeometry args={[0.55 + i * 0.15, 0.04, 8, 40, Math.PI * 0.9]} />
            <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={3.5} toneMapped={false} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#fff" toneMapped={false} />
        </mesh>
      </group>
      <Sparkles count={80} scale={[2.4, 2.4, 2.4]} position={[0, 1, 0]} size={3} speed={2.5} color={accent} noise={2} />
      <pointLight visible={hq} color={accent} intensity={8} distance={6} position={[0, 1, 0]} />
    </group>
  )
}

export function Gate({ position, wl }: P & { wl: Wavelength }) {
  const color = WAVELENGTHS[wl].color
  const field = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (field.current) field.current.opacity = 0.22 + Math.sin(t * 5) * 0.06
    if (ring.current) ring.current.position.y = 0.3 + ((t * 0.8) % 1.6)
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.16, 6]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 3) * 0.8, 1, Math.sin((i * Math.PI) / 3) * 0.8]}>
          <cylinderGeometry args={[0.035, 0.035, 1.9, 8]} />
          <meshStandardMaterial color="#39424d" metalness={0.95} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 1.9, 24, 1, true]} />
        <meshStandardMaterial
          ref={field}
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.74, 0.03, 8, 48]} />
        <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.06, 8, 48]} />
        <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function CarbonSphere({ target }: { target: [number, number, number] }) {
  const hq = useHQ()
  const g = useRef<THREE.Group>(null)
  const pos = useRef(new THREE.Vector3(...target))
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    const k = 1 - Math.exp(-6 * dt)
    pos.current.x += (target[0] - pos.current.x) * k
    pos.current.z += (target[2] - pos.current.z) * k
    if (g.current) {
      g.current.position.set(pos.current.x, target[1] + 0.9 + Math.sin(t * 2.2) * 0.08, pos.current.z)
      g.current.rotation.y = t * 0.6
      g.current.rotation.x = t * 0.4
    }
  })
  return (
    <group ref={g} position={[target[0], target[1] + 0.9, target[2]]}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial color="#0c0c0e" metalness={0.75} roughness={0.3} emissive="#ff3a00" emissiveIntensity={0.25} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.66, 0]} />
        <meshStandardMaterial color="#000" emissive="#ff5a1f" emissiveIntensity={1.2} wireframe toneMapped={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#000" emissive="#ff2200" emissiveIntensity={0.5} wireframe transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <pointLight visible={hq} color="#ff5a1f" intensity={3} distance={4} />
    </group>
  )
}
