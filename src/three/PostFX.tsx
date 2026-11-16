import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { LAB_Y, useGame } from '../store/useGame'
import { useSceneRefs } from './refs'

export function PostFX() {
  const quality = useGame((s) => s.quality)
  const phase = useGame((s) => s.phase)
  const sun = useSceneRefs((s) => s.sun)
  const cinematic = phase === 'intro' || phase === 'diving' || phase === 'finale'
  const focus: [number, number, number] = phase === 'intro' ? [0, 1, 0] : [0, LAB_Y + 1, 0]
  const showRays = (phase === 'intro' || phase === 'diving') && sun !== null && quality === 'high'

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
      <Bloom
        luminanceThreshold={0.82}
        luminanceSmoothing={0.25}
        intensity={quality === 'high' ? 1.35 : 1.0}
        mipmapBlur
        radius={0.72}
      />
      {quality === 'high' ? (
        <DepthOfField
          target={focus}
          focalLength={cinematic ? 0.022 : 0.01}
          bokehScale={cinematic ? 0.9 : 0.3}
          focusRange={cinematic ? 0.05 : 0.12}
          height={480}
        />
      ) : (
        <></>
      )}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0011, 0.0007]}
        radialModulation
        modulationOffset={0.35}
      />
      <HueSaturation saturation={0.12} />
      <BrightnessContrast brightness={0.02} contrast={0.08} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.5} />
      <Vignette eskil={false} offset={0.22} darkness={0.8} />
    </EffectComposer>
  )
}
