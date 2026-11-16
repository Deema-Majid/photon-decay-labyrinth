import { Sparkles } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame, volatile } from '../store/useGame'
import { createShaftMaterial, dampColor } from './materials'

/** Animated exponential fog + ambient/key lights that drift between the dirty and the clean palette. */
export function Fog() {
  const scene = useThree((s) => s.scene)
  const phase = useGame((s) => s.phase)
  const level = useGame((s) => s.level)
  const restoration = useGame((s) => s.restoration)
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const fog = useMemo(() => new THREE.FogExp2('#3a2410', 0.03), [])
  const smooth = useRef(0)

  useEffect(() => {
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene, fog])

  const dirty = useMemo(() => new THREE.Color(level.palette.fog), [level])
  const clean = useMemo(() => new THREE.Color(level.cleanPalette.fog), [level])
  const amb0 = useMemo(() => new THREE.Color(level.palette.ambient), [level])
  const amb1 = useMemo(() => new THREE.Color(level.cleanPalette.ambient), [level])
  const key0 = useMemo(() => new THREE.Color(level.palette.key), [level])
  const key1 = useMemo(() => new THREE.Color(level.cleanPalette.key), [level])
  const introFog = useMemo(() => new THREE.Color('#5c3d1c'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const goal = phase === 'finale' ? 1 : phase === 'clear' ? 1 : restoration
    smooth.current += (goal - smooth.current) * Math.min(1, d * 1.2)
    const k = smooth.current
    if (phase === 'intro' || phase === 'diving') {
      dampColor(fog.color, introFog, 2, d)
      fog.density += (0.028 - fog.density) * Math.min(1, d * 2)
      if (ambient.current) dampColor(ambient.current.color, amb0, 2, d)
      if (key.current) dampColor(key.current.color, key0, 2, d)
    } else {
      tmp.copy(dirty).lerp(clean, k)
      dampColor(fog.color, tmp, 2, d)
      const dens = THREE.MathUtils.lerp(level.palette.fogDensity, level.cleanPalette.fogDensity, k)
      fog.density += (dens * (phase === 'finale' ? 0.5 : 1) - fog.density) * Math.min(1, d * 2)
      if (ambient.current) dampColor(ambient.current.color, tmp.copy(amb0).lerp(amb1, k), 2, d)
      if (key.current) dampColor(key.current.color, tmp.copy(key0).lerp(key1, k), 2, d)
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.9} color={level.palette.ambient} />
      <hemisphereLight args={['#5b6f8a', '#2a1a0a', 0.5]} />
      <directionalLight
        ref={key}
        position={[12, 30, 8]}
        intensity={2.6}
        color={level.palette.key}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-20, LAB_Y + 20, -10]} intensity={1.2} color="#7ad7ff" />
    </>
  )
}

/** Floating micro-dust inside the labyrinth cavern. */
export function LabDust() {
  const level = useGame((s) => s.level)
  const quality = useGame((s) => s.quality)
  const w = level.cols * 2 + 14
  const d = level.rows * 2 + 14
  return (
    <group position={[0, LAB_Y + 3.5, 0]}>
      <Sparkles
        count={quality === 'high' ? 2600 : 900}
        scale={[w, 8, d]}
        size={quality === 'high' ? 2.6 : 3.4}
        speed={0.22}
        opacity={0.6}
        color={level.palette.accent}
        noise={1.4}
      />
      <Sparkles count={quality === 'high' ? 500 : 150} scale={[w * 0.7, 5, d * 0.7]} size={5} speed={0.1} opacity={0.35} color="#ffffff" />
    </group>
  )
}

/** Volumetric light shafts falling into the cavern. */
export function LightShafts() {
  const level = useGame((s) => s.level)
  const mats = useMemo(() => [0, 1, 2, 3].map(() => createShaftMaterial(level.palette.key)), [level])
  const target = useMemo(() => new THREE.Color(), [])
  const restoration = useGame((s) => s.restoration)

  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    target.set(level.palette.key).lerp(new THREE.Color(level.cleanPalette.key), restoration)
    mats.forEach((m, i) => {
      m.uniforms.uTime.value = t + i * 3
      dampColor(m.uniforms.uColor.value as THREE.Color, target, 1.5, dt)
      m.uniforms.uStrength.value = 0.22 + Math.sin(t * 0.4 + i) * 0.06 + volatile.worldClean * 0.12
    })
  })

  const positions: [number, number, number][] = [
    [-level.cols * 0.6, 0, -level.rows * 0.4],
    [level.cols * 0.7, 0, level.rows * 0.3],
    [-level.cols * 0.2, 0, level.rows * 0.8],
    [level.cols * 0.3, 0, -level.rows * 0.9],
  ]

  return (
    <group position={[0, LAB_Y, 0]}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], 9, p[2]]} rotation={[0, 0, 0.08 * (i % 2 ? 1 : -1)]} material={mats[i]}>
          <coneGeometry args={[4.5 + i, 18, 24, 1, true]} />
        </mesh>
      ))}
    </group>
  )
}
