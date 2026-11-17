import { useFBO } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store/useGame'
import { transmissive, useSceneRefs } from './refs'

/**
 * Renders the scene once per frame into a shared texture that every refractive
 * prism and crystal samples, instead of each one rendering its own buffer.
 */
export function TransmissionBuffer() {
  const quality = useGame((s) => s.quality)
  const fbo = useFBO(quality === 'high' ? 320 : 192, quality === 'high' ? 320 : 192, {
    type: THREE.HalfFloatType,
  })
  const setBuffer = useSceneRefs((s) => s.setBuffer)
  const frame = useRef(0)

  useEffect(() => {
    setBuffer(fbo.texture)
    if (import.meta.env.DEV) (window as unknown as { __fbo: unknown }).__fbo = fbo
    return () => setBuffer(null)
  }, [fbo, setBuffer])

  useFrame(({ gl, scene, camera }) => {
    // the refracted background barely changes frame to frame; Performance refreshes it less often
    frame.current++
    if (quality !== 'high' && frame.current % 3 !== 0) return
    const hidden: THREE.Object3D[] = []
    transmissive.forEach((o) => {
      if (o.visible) {
        o.visible = false
        hidden.push(o)
      }
    })
    // particles and sprites are invisible through refraction anyway; skip their draw calls
    scene.traverse((o) => {
      if (((o as THREE.Points).isPoints || (o as THREE.Sprite).isSprite) && o.visible) {
        o.visible = false
        hidden.push(o)
      }
    })
    const prevTarget = gl.getRenderTarget()
    gl.setRenderTarget(fbo)
    gl.render(scene, camera)
    gl.setRenderTarget(prevTarget)
    hidden.forEach((o) => (o.visible = true))
  }, 0)

  return null
}
