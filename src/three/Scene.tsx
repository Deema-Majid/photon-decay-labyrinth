import { Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { useGame } from '../store/useGame'
import { Fog } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { GameLoop } from './GameLoop'
import { Labyrinth } from './Labyrinth'
import { PostFX } from './PostFX'
import { SolarPanelArray } from './SolarPanelArray'
import { TransmissionBuffer } from './TransmissionBuffer'

export function Scene() {
  const phase = useGame((s) => s.phase)
  const quality = useGame((s) => s.quality)
  const showIntro = phase === 'intro' || phase === 'diving'
  const showLab = phase !== 'intro'

  return (
    <Canvas
      dpr={[1, quality === 'high' ? 1.5 : 1]}
      shadows="percentage"
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      camera={{ fov: 42, near: 0.1, far: 420, position: [0, 10, 27] }}
      onCreated={(state) => {
        if (import.meta.env.DEV) (window as unknown as { __r3f: unknown }).__r3f = state.get
      }}
    >
      <Suspense fallback={null}>
        <Fog />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.5} color="#ffd6a0" position={[10, 8, -10]} scale={[12, 4, 1]} />
          <Lightformer intensity={3} color="#7df9ff" position={[-12, 6, 6]} scale={[10, 3, 1]} />
          <Lightformer intensity={1.2} color="#ffffff" position={[0, 14, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
        </Environment>
        <CameraRig />
        <GameLoop />
        {showIntro ? <SolarPanelArray clean={0} /> : null}
        {showLab ? <TransmissionBuffer /> : null}
        {showLab ? <Labyrinth /> : null}
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
