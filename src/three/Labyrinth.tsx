import { ContactShadows, Edges, Grid, MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { cellToWorld, spherePosition } from '../engine/trace'
import { LAB_Y, useGame } from '../store/useGame'
import { LabDust, LightShafts } from './Atmosphere'
import { Beam } from './Beam'
import { Bursts } from './Bursts'
import { City } from './City'
import { SolarPanelArray } from './SolarPanelArray'
import { Crystal } from './elements/Crystal'
import { DustCloud } from './elements/DustCloud'
import { CarbonSphere, Emitter, EnergyRing, Gate, Receiver, Vortex } from './elements/Nodes'
import { Prism } from './elements/Prism'
import { dampColor } from './materials'
import { hexFloorTexture, noiseTexture } from './textures'

function Conduits({ w, d }: { w: number; d: number }) {
  const restoration = useGame((s) => s.restoration)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
  const clamps = useRef<THREE.InstancedMesh>(null)
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    mats.current.forEach((m, i) => {
      if (!m) return
      const target = 0.2 + restoration * 3.2 + Math.sin(t * 2 + i) * restoration * 0.6
      m.emissiveIntensity += (target - m.emissiveIntensity) * Math.min(1, dt * 2)
    })
  })
  const hw = w / 2 + 1.4
  const hd = d / 2 + 1.4
  const items = useMemo(
    () => [
      { pos: [0, 0.25, -hd] as [number, number, number], rot: [0, 0, Math.PI / 2] as [number, number, number], len: w + 2.8 },
      { pos: [0, 0.25, hd] as [number, number, number], rot: [0, 0, Math.PI / 2] as [number, number, number], len: w + 2.8 },
      { pos: [-hw, 0.25, 0] as [number, number, number], rot: [Math.PI / 2, 0, 0] as [number, number, number], len: d + 2.8 },
      { pos: [hw, 0.25, 0] as [number, number, number], rot: [Math.PI / 2, 0, 0] as [number, number, number], len: d + 2.8 },
    ],
    [w, d, hw, hd],
  )
  const clampCount = Math.round((w + d) / 2)
  useLayoutEffect(() => {
    const inst = clamps.current
    if (!inst) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const v = new THREE.Vector3()
    const one = new THREE.Vector3(1, 1, 1)
    let i = 0
    items.forEach((it) => {
      e.set(it.rot[0], it.rot[1], it.rot[2])
      q.setFromEuler(e)
      const along = new THREE.Vector3(0, 1, 0).applyQuaternion(q)
      for (let k = 0; k < clampCount; k++) {
        v.set(it.pos[0], it.pos[1], it.pos[2]).addScaledVector(along, (k / (clampCount - 1) - 0.5) * (it.len - 1))
        m.compose(v, q, one)
        inst.setMatrixAt(i++, m)
      }
    })
    inst.instanceMatrix.needsUpdate = true
  }, [items, clampCount])
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} rotation={it.rot}>
          <cylinderGeometry args={[0.12, 0.12, it.len, 12]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) mats.current[i] = m
            }}
            color="#0a1418"
            emissive="#00F0FF"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <instancedMesh ref={clamps} args={[undefined, undefined, clampCount * 4]}>
        <torusGeometry args={[0.17, 0.04, 8, 16]} />
        <meshStandardMaterial color="#2a313b" metalness={0.95} roughness={0.3} />
      </instancedMesh>
      {/* corner pylons */}
      {[
        [-hw, -hd],
        [hw, -hd],
        [-hw, hd],
        [hw, hd],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 1.8, 6]} />
            <meshStandardMaterial color="#141a22" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#000" emissive="#00F0FF" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Floor({ w, d }: { w: number; d: number }) {
  const level = useGame((s) => s.level)
  const restoration = useGame((s) => s.restoration)
  const quality = useGame((s) => s.quality)
  const runtime = useGame((s) => s.runtime)
  const spherePhase = useGame((s) => s.spherePhase)
  // contact shadows re-render for a few frames whenever the board changes
  const shadowKey = useMemo(
    () => `${spherePhase}|${Object.values(runtime).map((r) => `${r.rot}${r.destroyed ? 'x' : ''}`).join('')}`,
    [runtime, spherePhase],
  )
  const mat = useRef<THREE.MeshStandardMaterial | null>(null)
  const setMat = (m: THREE.MeshStandardMaterial | null) => {
    mat.current = m
  }
  const target = useMemo(() => new THREE.Color(), [])
  const hex = useMemo(() => hexFloorTexture(), [])
  const noise = useMemo(() => noiseTexture(256, 'noise', 1), [])
  useFrame((_, dt) => {
    if (!mat.current) return
    target.set(level.palette.floor).lerp(new THREE.Color(level.cleanPalette.floor), restoration)
    dampColor(mat.current.color, target, 1.5, dt)
    mat.current.roughness += (0.7 - restoration * 0.45 - mat.current.roughness) * Math.min(1, dt * 1.5)
  })
  const gridColor = useMemo(
    () => new THREE.Color(level.palette.grid).lerp(new THREE.Color(level.cleanPalette.grid), restoration),
    [level, restoration],
  )
  const sectionColor = useMemo(
    () => new THREE.Color(level.palette.accent).lerp(new THREE.Color(level.cleanPalette.accent), restoration),
    [level, restoration],
  )
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[w + 60, d + 60]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial
            ref={setMat as never}
            mirror={0}
            resolution={256}
            mixBlur={1}
            mixStrength={26}
            blur={[400, 120]}
            minDepthThreshold={0.85}
            maxDepthThreshold={1.3}
            depthScale={1.1}
            color={level.palette.floor}
            roughness={0.7}
            roughnessMap={hex}
            metalness={0.55}
          />
        ) : (
          <meshStandardMaterial ref={setMat} color={level.palette.floor} roughness={0.7} roughnessMap={noise} metalness={0.45} />
        )}
      </mesh>
      <Grid
        position={[0, 0.005, 0]}
        args={[w + 2, d + 2]}
        cellSize={1}
        cellThickness={0.6}
        cellColor={gridColor}
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor={sectionColor}
        fadeDistance={34}
        fadeStrength={1.6}
        infiniteGrid
      />
      <ContactShadows
        key={shadowKey}
        position={[0, 0.02, 0]}
        scale={[w + 8, d + 8]}
        blur={2.2}
        far={4}
        opacity={0.6}
        resolution={quality === 'high' ? 512 : 256}
        frames={40}
        color="#000a10"
      />
    </group>
  )
}

function Wall({ x, z, accent }: { x: number; z: number; accent: string }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.9, 1.6, 1.9]} radius={0.09} smoothness={3} position={[0, 0.8, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#121820" metalness={0.75} roughness={0.38} />
        <Edges color={accent} threshold={40} />
      </RoundedBox>
      {/* recessed top panel with emissive seam */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[1.5, 0.04, 1.5]} />
        <meshStandardMaterial color="#0b0f14" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.6, 6]} />
        <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={1.6} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* side panel lines */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.96, 0.8, Math.sin((i * Math.PI) / 2) * 0.96]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[0.02, 1.2, 1.2]} />
          <meshStandardMaterial color="#1c2430" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function Labyrinth() {
  const level = useGame((s) => s.level)
  const runtime = useGame((s) => s.runtime)
  const wavelength = useGame((s) => s.wavelength)
  const spherePhase = useGame((s) => s.spherePhase)
  const w = level.cols * 2
  const d = level.rows * 2
  const accent = level.palette.accent

  return (
    <group position={[0, LAB_Y, 0]}>
      <Floor w={w} d={d} />
      <Conduits w={w} d={d} />
      {level.cells.map((c) => {
        const rt = runtime[c.id]
        if (rt?.destroyed) return null
        const [x, z] = cellToWorld(level, c.x, c.z)
        const pos: [number, number, number] = [x, 0, z]
        switch (c.kind) {
          case 'wall':
            return <Wall key={c.id} x={x} z={z} accent={accent} />
          case 'emitter':
            return <Emitter key={c.id} position={pos} dir={c.dir ?? 0} wl={wavelength} />
          case 'prism':
            return <Prism key={c.id} id={c.id} position={pos} accent={accent} />
          case 'dust':
            return <DustCloud key={c.id} id={c.id} position={pos} />
          case 'crystal':
            return <Crystal key={c.id} id={c.id} position={pos} />
          case 'ring':
            return <EnergyRing key={c.id} position={pos} wl={c.wl ?? 'vis'} />
          case 'vortex':
            return <Vortex key={c.id} position={pos} accent={accent} />
          case 'gate':
            return <Gate key={c.id} position={pos} wl={c.wl ?? 'vis'} />
          case 'receiver':
            return <Receiver key={c.id} id={c.id} position={pos} />
          case 'sphere': {
            const p = spherePosition(c, spherePhase)
            const [sx, sz] = cellToWorld(level, p.x, p.z)
            return <CarbonSphere key={c.id} target={[sx, 0, sz]} />
          }
          default:
            return null
        }
      })}
      <group position={[0, -LAB_Y, 0]}>
        <Beam />
        <Bursts />
        <LabDust />
        <LightShafts />
        <City />
        <SolarPanelArray position={[0, LAB_Y + 0.2, -d / 2 - 16]} cols={16} rows={4} scale={0.55} dust={false} />
      </group>
    </group>
  )
}
