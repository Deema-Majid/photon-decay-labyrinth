import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { LAB_Y, useGame } from '../store/useGame'

export function PostFX() {
  const quality = useGame((s) => s.quality)
  const phase = useGame((s) => s.phase)
  const cinematic = phase === 'intro' || phase === 'diving' || phase === 'finale'
  const focus: [number, number, number] = phase === 'intro' ? [0, 1, 0] : [0, LAB_Y + 1, 0]

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
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
          focalLength={cinematic ? 0.022 : 0.012}
          bokehScale={cinematic ? 1.1 : 0.55}
          focusRange={cinematic ? 0.04 : 0.08}
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
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
    </EffectComposer>
  )
}
