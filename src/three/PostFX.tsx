import { useFrame } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode, type DepthOfFieldEffect } from 'postprocessing'
import { useMemo, useRef } from 'react'
import { useGame, volatile } from '../store/useGame'
import { CinematicGradeEffect } from './CinematicGrade'
import { useSceneRefs } from './refs'

const FOCUS_INIT: [number, number, number] = [0, 1, 0]

export function PostFX() {
  const quality = useGame((s) => s.quality)
  const phase = useGame((s) => s.phase)
  const sun = useSceneRefs((s) => s.sun)
  const dof = useRef<DepthOfFieldEffect>(null)
  const grade = useMemo(() => new CinematicGradeEffect(), [])
  const showRays = (phase === 'intro' || phase === 'diving') && sun !== null && quality === 'high'

  // focus pulls: ease the DoF target, range and bokeh toward what the camera director asks for
  useFrame((_, dt) => {
    const e = dof.current
    if (!e) return
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.05))
    const [x, y, z] = volatile.focus
    if (e.target) {
      e.target.x += (x - e.target.x) * k
      e.target.y += (y - e.target.y) * k
      e.target.z += (z - e.target.z) * k
    }
    e.cocMaterial.focusRange += (volatile.focusRange - e.cocMaterial.focusRange) * k
    e.bokehScale += (volatile.bokeh - e.bokehScale) * k
  })

  return (
    <EffectComposer multisampling={quality === 'high' ? 2 : 0} enableNormalPass={false}>
      {showRays && sun ? (
        <GodRays
          sun={sun}
          blendFunction={BlendFunction.SCREEN}
          samples={48}
          density={0.96}
          decay={0.93}
          weight={0.35}
          exposure={0.4}
          clampMax={1}
          blur
        />
      ) : (
        <></>
      )}
      {quality === 'high' ? (
        <DepthOfField ref={dof} target={FOCUS_INIT} focusRange={20} bokehScale={0.8} height={480} />
      ) : (
        <></>
      )}
      <Bloom
        luminanceThreshold={0.9}
        luminanceSmoothing={0.3}
        intensity={quality === 'high' ? 1.25 : 0.95}
        mipmapBlur
        radius={0.75}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0009, 0.0006]}
        radialModulation
        modulationOffset={0.4}
      />
      <primitive object={grade} dispose={null} />
      <HueSaturation saturation={0.08} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.28} />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}
