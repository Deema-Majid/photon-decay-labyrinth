import { Sparkles, SpotLight } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame } from '../store/useGame'
import { dampColor } from './materials'

/** Animated exponential fog + ambient/key lights that drift between the dirty and the clean palette. */
export function Fog() {
  const scene = useThree((s) => s.scene)
  const phase = useGame((s) => s.phase)
  const level = useGame((s) => s.level)
  const restoration = useGame((s) => s.restoration)
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const fog = useMemo(() => new THREE.FogExp2('#3a2410', 0.03), [])
  const smooth = useRef(0)

  useEffect(() => {
    scene.fog = fog
    scene.background = fog.color
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
  const introFog = useMemo(() => new THREE.Color('#6a4522'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const goal = phase === 'finale' ? 1 : phase === 'clear' ? 1 : restoration
    smooth.current += (goal - smooth.current) * Math.min(1, d * 1.2)
    const k = smooth.current
    if (phase === 'intro' || phase === 'diving') {
      dampColor(fog.color, introFog, 2, d)
      fog.density += (0.016 - fog.density) * Math.min(1, d * 2)
      if (ambient.current) dampColor(ambient.current.color, amb0, 2, d)
      if (key.current) dampColor(key.current.color, key0, 2, d)
    } else {
      tmp.copy(dirty).lerp(clean, k)
      dampColor(fog.color, tmp, 2, d)
      const dens = THREE.MathUtils.lerp(level.palette.fogDensity, level.cleanPalette.fogDensity, k) * 0.75
      fog.density += (dens * (phase === 'finale' ? 0.5 : 1) - fog.density) * Math.min(1, d * 2)
      if (ambient.current) dampColor(ambient.current.color, tmp.copy(amb0).lerp(amb1, k), 2, d)
      if (key.current) dampColor(key.current.color, tmp.copy(key0).lerp(key1, k), 2, d)
      if (rim.current) rim.current.intensity += ((0.8 + k * 1.6) - rim.current.intensity) * Math.min(1, d * 2)
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.1} color={level.palette.ambient} />
      <hemisphereLight args={['#5b6f8a', '#2a1a0a', 0.45]} />
      <directionalLight
        ref={key}
        position={[12, 30, 8]}
        intensity={3.4}
        color={level.palette.key}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={120}
      />
      {/* cool rim / back light separates prisms and crystals from the floor */}
      <directionalLight ref={rim} position={[-18, LAB_Y + 14, -16]} intensity={0.9} color="#7ad7ff" />
      <directionalLight position={[20, 40, -30]} intensity={0.5} color="#ffd9b0" />
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
        size={quality === 'high' ? 2.4 : 3.2}
        speed={0.22}
        opacity={0.55}
        color={level.palette.accent}
        noise={1.4}
      />
      <Sparkles count={quality === 'high' ? 400 : 120} scale={[w * 0.7, 5, d * 0.7]} size={4.5} speed={0.1} opacity={0.3} color="#ffffff" />
    </group>
  )
}

/** Volumetric spotlights falling into the cavern. */
export function LightShafts() {
  const level = useGame((s) => s.level)
  const quality = useGame((s) => s.quality)
  const restoration = useGame((s) => s.restoration)
  const targets = useMemo(() => [0, 1, 2].map(() => new THREE.Object3D()), [])
  const lights = useRef<THREE.SpotLight[]>([])
  const color = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    color.set(level.palette.key).lerp(new THREE.Color(level.cleanPalette.key), restoration)
    lights.current.forEach((l, i) => {
      if (!l) return
      dampColor(l.color, color, 1.5, dt)
      l.intensity = 60 + Math.sin(t * 0.5 + i * 2) * 14
    })
  })

  const w = level.cols
  const d = level.rows
  const spots: { p: [number, number, number]; t: [number, number, number] }[] = [
    { p: [-w * 0.8, 15, -d * 0.6], t: [-w * 0.4, 0, -d * 0.2] },
    { p: [w * 0.9, 16, d * 0.5], t: [w * 0.4, 0, d * 0.1] },
    { p: [0, 17, -d * 1.3], t: [0, 0, -d * 0.6] },
  ]
  const count = quality === 'high' ? 3 : 1

  return (
    <group position={[0, LAB_Y, 0]}>
      {spots.slice(0, count).map((s, i) => (
        <group key={i}>
          <primitive object={targets[i]} position={s.t} />
          <SpotLight
            ref={(l: THREE.SpotLight | null) => {
              if (l) lights.current[i] = l
            }}
            position={s.p}
            target={targets[i]}
            color={level.palette.key}
            intensity={60}
            distance={30}
            angle={0.42}
            penumbra={0.6}
            attenuation={18}
            anglePower={5}
            radiusTop={0.4}
            radiusBottom={9}
            opacity={0.35}
            volumetric
          />
        </group>
      ))}
    </group>
  )
}
