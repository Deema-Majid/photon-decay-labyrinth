import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { volatile } from '../store/useGame'
import { dampColor } from './materials'
import { useSceneRefs } from './refs'
import { flareTexture, noiseTexture, solarCellTexture } from './textures'

interface Props {
  position?: [number, number, number]
  cols?: number
  rows?: number
  /** 0 = dusty, salt-crusted ; 1 = clean glossy glass. Undefined => follows worldClean. */
  clean?: number
  /** intro mode: airborne dust, sun, dunes */
  dust?: boolean
  scale?: number
}

const DIRTY_TINT = new THREE.Color('#8a7a62')
const CLEAN_TINT = new THREE.Color('#ffffff')
const CLEAN_EM = new THREE.Color('#0a6a80')
const DIRTY_EM = new THREE.Color('#000000')

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
  const dustLayer = useRef<THREE.InstancedMesh>(null)
  const legs = useRef<THREE.InstancedMesh>(null)
  const crusts = useRef<THREE.InstancedMesh>(null)
  const panelMat = useRef<THREE.MeshStandardMaterial>(null)
  const dustMat = useRef<THREE.MeshStandardMaterial>(null)
  const setSun = useSceneRefs((s) => s.setSun)
  const count = cols * rows
  const spacingX = 3.6
  const spacingZ = 2.7
  const width = cols * spacingX
  const depth = rows * spacingZ
  const crustCount = 320

  const cellMap = useMemo(() => solarCellTexture(), [])
  const noise = useMemo(() => noiseTexture(256, 'noise', 1), [])

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
    const tilt = -0.38
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0))
    const s = new THREE.Vector3(1, 1, 1)
    const legQ = new THREE.Quaternion()
    let i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * spacingX
        const z = (r - (rows - 1) / 2) * spacingZ
        m.compose(new THREE.Vector3(x, 0.9, z), q, s)
        panels.current?.setMatrixAt(i, m)
        frames.current?.setMatrixAt(i, m)
        m.compose(new THREE.Vector3(x, 0.955, z), q, s)
        dustLayer.current?.setMatrixAt(i, m)
        // two legs per panel: back leg taller (panel tilts toward the camera side)
        m.compose(new THREE.Vector3(x - 1.1, 0.45, z - 0.4), legQ, new THREE.Vector3(1, 1, 1))
        legs.current?.setMatrixAt(i * 2, m)
        m.compose(new THREE.Vector3(x + 1.1, 0.45, z - 0.4), legQ, new THREE.Vector3(1, 1, 1))
        legs.current?.setMatrixAt(i * 2 + 1, m)
        i++
      }
    }
    for (const ref of [panels, frames, dustLayer, legs]) {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true
    }

    const cq = new THREE.Quaternion()
    crustData.forEach((c, idx) => {
      cq.setFromEuler(new THREE.Euler(c.r, c.r * 1.7, 0))
      m.compose(new THREE.Vector3(c.x, 1.05 - (c.z / depth) * 1.0, c.z), cq, new THREE.Vector3(c.s, c.s * 0.7, c.s))
      crusts.current?.setMatrixAt(idx, m)
    })
    if (crusts.current) crusts.current.instanceMatrix.needsUpdate = true
  }, [cols, rows, crustData, depth])

  useEffect(() => () => setSun(null), [setSun])

  useFrame((_, dt) => {
    const k = clean ?? volatile.worldClean
    const mat = panelMat.current
    if (mat) {
      dampColor(mat.color, k > 0.5 ? CLEAN_TINT : DIRTY_TINT, 1.5, dt)
      dampColor(mat.emissive, k > 0.5 ? CLEAN_EM : DIRTY_EM, 1.5, dt)
      mat.roughness += ((k > 0.5 ? 0.18 : 0.75) - mat.roughness) * Math.min(1, dt * 1.5)
      mat.metalness += ((k > 0.5 ? 0.55 : 0.2) - mat.metalness) * Math.min(1, dt * 1.5)
    }
    if (dustMat.current) {
      dustMat.current.opacity += ((k > 0.5 ? 0 : 0.85) - dustMat.current.opacity) * Math.min(1, dt * 1.5)
    }
    if (crusts.current) {
      const target = 1 - Math.min(1, Math.max(0, (k - 0.3) / 0.6))
      crusts.current.scale.setScalar(THREE.MathUtils.lerp(crusts.current.scale.x, target, Math.min(1, dt * 1.5)))
      crusts.current.visible = crusts.current.scale.x > 0.02
    }
  })

  const dunes = useMemo(() => {
    const arr: { x: number; z: number; sx: number; sy: number; sz: number }[] = []
    let seed = 99
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    for (let i = 0; i < 9; i++) {
      arr.push({
        x: (rnd() - 0.5) * width * 2.4,
        z: -depth * 0.9 - rnd() * depth * 1.2,
        sx: 25 + rnd() * 40,
        sy: 4 + rnd() * 7,
        sz: 14 + rnd() * 20,
      })
    }
    return arr
  }, [width, depth])

  return (
    <group position={position} scale={scale}>
      <instancedMesh ref={panels} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 2.1]} />
        <meshStandardMaterial
          ref={panelMat}
          map={cellMap}
          roughnessMap={noise}
          color="#8a7a62"
          roughness={0.75}
          metalness={0.2}
          envMapIntensity={1.6}
        />
      </instancedMesh>
      <instancedMesh ref={dustLayer} args={[undefined, undefined, count]}>
        <planeGeometry args={[3.1, 2.0]} />
        <meshStandardMaterial
          ref={dustMat}
          color="#c7a46e"
          alphaMap={noise}
          transparent
          opacity={0.85}
          roughness={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh ref={frames} args={[undefined, undefined, count]}>
        <boxGeometry args={[3.35, 0.05, 2.25]} />
        <meshStandardMaterial color="#20232b" roughness={0.6} metalness={0.8} />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, count * 2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.5} metalness={0.9} />
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
        <planeGeometry args={[width * 3, depth * 4]} />
        <meshStandardMaterial color="#5c4631" roughness={1} roughnessMap={noise} />
      </mesh>
      {dust ? (
        <>
          {dunes.map((d, i) => (
            <mesh key={i} position={[d.x, -1, d.z]} scale={[d.sx, d.sy, d.sz]}>
              <sphereGeometry args={[1, 24, 12]} />
              <meshStandardMaterial color="#6b4f33" roughness={1} />
            </mesh>
          ))}
          <group position={[-width * 0.9, 22, -depth * 2.2]}>
            <mesh ref={(m) => setSun(m)}>
              <sphereGeometry args={[4.5, 32, 32]} />
              <meshBasicMaterial color="#fff1d6" toneMapped={false} fog={false} />
            </mesh>
            <sprite scale={[70, 70, 1]}>
              <spriteMaterial
                map={flareTexture()}
                color="#ffb060"
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </sprite>
            <pointLight color="#ffc27a" intensity={600} distance={220} decay={1.4} />
          </group>
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
        </>
      ) : null}
    </group>
  )
}
