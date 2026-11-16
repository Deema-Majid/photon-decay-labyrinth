import { Edges, Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
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

function Conduits({ w, d }: { w: number; d: number }) {
  const restoration = useGame((s) => s.restoration)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
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
  const items: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [
    { pos: [0, 0.25, -hd], rot: [0, 0, Math.PI / 2], len: w + 2.8 },
    { pos: [0, 0.25, hd], rot: [0, 0, Math.PI / 2], len: w + 2.8 },
    { pos: [-hw, 0.25, 0], rot: [Math.PI / 2, 0, 0], len: d + 2.8 },
    { pos: [hw, 0.25, 0], rot: [Math.PI / 2, 0, 0], len: d + 2.8 },
  ]
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
    </group>
  )
}

function Floor({ w, d }: { w: number; d: number }) {
  const level = useGame((s) => s.level)
  const restoration = useGame((s) => s.restoration)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const target = useMemo(() => new THREE.Color(), [])
  useFrame((_, dt) => {
    if (!mat.current) return
    target.set(level.palette.floor).lerp(new THREE.Color(level.cleanPalette.floor), restoration)
    dampColor(mat.current.color, target, 1.5, dt)
    mat.current.roughness += (0.55 - restoration * 0.4 - mat.current.roughness) * Math.min(1, dt * 1.5)
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
        <meshStandardMaterial ref={mat} color={level.palette.floor} roughness={0.55} metalness={0.45} />
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
            return (
              <mesh key={c.id} position={[x, 0.8, z]} castShadow receiveShadow>
                <boxGeometry args={[1.9, 1.6, 1.9]} />
                <meshStandardMaterial color="#121820" metalness={0.7} roughness={0.4} />
                <Edges color={accent} threshold={15} />
              </mesh>
            )
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
