import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { volatile } from '../store/useGame'
import { dampColor } from './materials'

interface Props {
  position?: [number, number, number]
  cols?: number
  rows?: number
  /** 0 = dusty, salt-crusted ; 1 = clean glossy glass. Undefined => follows worldClean. */
  clean?: number
  dust?: boolean
  scale?: number
}

const DIRTY = new THREE.Color('#4a3a26')
const CLEAN = new THREE.Color('#0a1f45')
const DIRTY_EM = new THREE.Color('#000000')
const CLEAN_EM = new THREE.Color('#0a6a80')

export function SolarPanelArray({
  position = [0, 0, 0],
  cols = 18,
  rows = 13,
  clean,
  dust = true,
  scale = 1,
}: Props) {
  const panels = useRef<THREE.InstancedMesh>(null)
  const frames = useRef<THREE.InstancedMesh>(null)
  const crusts = useRef<THREE.InstancedMesh>(null)
  const panelMat = useRef<THREE.MeshStandardMaterial>(null)
  const count = cols * rows
  const spacingX = 3.6
  const spacingZ = 2.7
  const width = cols * spacingX
  const depth = rows * spacingZ
  const crustCount = 320

  const crustData = useMemo(() => {
    const arr: { x: number; z: number; s: number; r: number }[] = []
    let seed = 7
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    for (let i = 0; i < crustCount; i++) {
      arr.push({
        x: (rnd() - 0.5) * width,
        z: (rnd() - 0.5) * depth,
        s: 0.08 + rnd() * 0.22,
        r: rnd() * Math.PI,
      })
    }
    return arr
  }, [width, depth])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.38, 0, 0))
    const s = new THREE.Vector3(1, 1, 1)
    let i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * spacingX
        const z = (r - (rows - 1) / 2) * spacingZ
        m.compose(new THREE.Vector3(x, 0.9, z), q, s)
        panels.current?.setMatrixAt(i, m)
        frames.current?.setMatrixAt(i, m)
        i++
      }
    }
    if (panels.current) panels.current.instanceMatrix.needsUpdate = true
    if (frames.current) frames.current.instanceMatrix.needsUpdate = true

    const cq = new THREE.Quaternion()
    crustData.forEach((c, idx) => {
      cq.setFromEuler(new THREE.Euler(c.r, c.r * 1.7, 0))
      m.compose(new THREE.Vector3(c.x, 1.05 - (c.z / depth) * 1.0, c.z), cq, new THREE.Vector3(c.s, c.s * 0.7, c.s))
      crusts.current?.setMatrixAt(idx, m)
    })
    if (crusts.current) crusts.current.instanceMatrix.needsUpdate = true
  }, [cols, rows, crustData, depth])

  useFrame((_, dt) => {
    const k = clean ?? volatile.worldClean
    const mat = panelMat.current
    if (!mat) return
    dampColor(mat.color, k > 0.5 ? CLEAN : DIRTY, 1.5, dt)
    dampColor(mat.emissive, k > 0.5 ? CLEAN_EM : DIRTY_EM, 1.5, dt)
    mat.roughness += ((k > 0.5 ? 0.12 : 0.85) - mat.roughness) * Math.min(1, dt * 1.5)
    mat.metalness += ((k > 0.5 ? 0.9 : 0.3) - mat.metalness) * Math.min(1, dt * 1.5)
    if (crusts.current) {
      const target = 1 - Math.min(1, Math.max(0, (k - 0.3) / 0.6))
      crusts.current.scale.setScalar(THREE.MathUtils.lerp(crusts.current.scale.x, target, Math.min(1, dt * 1.5)))
      crusts.current.visible = crusts.current.scale.x > 0.02
    }
  })

  return (
    <group position={position} scale={scale}>
      <instancedMesh ref={panels} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 2.1]} />
        <meshStandardMaterial ref={panelMat} color="#4a3a26" roughness={0.85} metalness={0.3} envMapIntensity={1.2} />
      </instancedMesh>
      <instancedMesh ref={frames} args={[undefined, undefined, count]}>
        <boxGeometry args={[3.35, 0.05, 2.25]} />
        <meshStandardMaterial color="#20232b" roughness={0.6} metalness={0.8} />
      </instancedMesh>
      <instancedMesh ref={crusts} args={[undefined, undefined, crustCount]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#f3f0e6"
          roughness={0.3}
          transmission={0.6}
          thickness={0.4}
          ior={1.54}
          iridescence={0.5}
          iridescenceIOR={1.3}
        />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[width * 2.2, depth * 2.6]} />
        <meshStandardMaterial color="#2b2114" roughness={1} />
      </mesh>
      {dust ? (
        <group position={[-width * 0.9, 16, -depth * 1.6]}>
          <mesh>
            <sphereGeometry args={[5, 24, 24]} />
            <meshBasicMaterial color="#ffe2b0" toneMapped={false} fog={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[11, 24, 24]} />
            <meshBasicMaterial color="#ff9a3c" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
          </mesh>
          <pointLight color="#ffc27a" intensity={400} distance={160} decay={1.4} />
        </group>
      ) : null}
      {dust ? (
        <Sparkles
          count={1800}
          scale={[width * 1.1, 7, depth * 1.1]}
          position={[0, 3.5, 0]}
          size={2.2}
          speed={0.2}
          opacity={0.55}
          color="#ffcf8a"
          noise={1.2}
        />
      ) : null}
    </group>
  )
}
