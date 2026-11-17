import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js'

interface Props {
  width: number
  height: number
  position?: [number, number, number]
  resolution?: number
  blur?: number
  far?: number
  opacity?: number
  color?: string
  /** bump to redraw the shadow for a few frames (board changed) instead of remounting */
  version: string | number
}

const REDRAW_FRAMES = 6

/**
 * Soft contact shadows under the board. Same technique as drei's ContactShadows,
 * but its GPU resources are created once, reused across board changes and disposed
 * on unmount. drei's version rebuilt two 512² render targets whenever its props changed
 * and never freed them, which leaked GPU memory until the driver reset the context.
 */
export function BoardShadows({
  width,
  height,
  position = [0, 0, 0],
  resolution = 512,
  blur = 2.2,
  far = 4,
  opacity = 0.6,
  color = '#000a10',
  version,
}: Props) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const group = useRef<THREE.Group>(null)
  const pending = useRef(REDRAW_FRAMES)

  const res = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(resolution, resolution)
    const targetBlur = new THREE.WebGLRenderTarget(resolution, resolution)
    target.texture.generateMipmaps = targetBlur.texture.generateMipmaps = false
    const plane = new THREE.PlaneGeometry(width, height).rotateX(Math.PI / 2)
    const blurPlane = new THREE.Mesh(plane)
    const depth = new THREE.MeshDepthMaterial()
    depth.depthTest = depth.depthWrite = false
    const shadowColor = new THREE.Color(color)
    depth.onBeforeCompile = (shader) => {
      shader.uniforms.ucolor = { value: shadowColor }
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform vec3 ucolor;\nvoid main() {')
        .replace('vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );')
    }
    const hBlur = new THREE.ShaderMaterial(HorizontalBlurShader)
    const vBlur = new THREE.ShaderMaterial(VerticalBlurShader)
    hBlur.depthTest = vBlur.depthTest = false
    const display = new THREE.MeshBasicMaterial({ map: target.texture, transparent: true, opacity, depthWrite: false })
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, far)
    return { target, targetBlur, plane, blurPlane, depth, hBlur, vBlur, display, camera }
  }, [resolution, width, height, color, far, opacity])

  useEffect(
    () => () => {
      res.target.dispose()
      res.targetBlur.dispose()
      res.plane.dispose()
      res.depth.dispose()
      res.hBlur.dispose()
      res.vBlur.dispose()
      res.display.dispose()
    },
    [res],
  )

  // redraw for a few frames whenever the board changes (objects settle, spheres glide)
  useEffect(() => {
    pending.current = REDRAW_FRAMES
  }, [version, res])

  const blurPass = (amount: number) => {
    const { blurPlane, hBlur, vBlur, target, targetBlur, camera } = res
    blurPlane.visible = true
    blurPlane.material = hBlur
    hBlur.uniforms.tDiffuse.value = target.texture
    hBlur.uniforms.h.value = amount / 256
    gl.setRenderTarget(targetBlur)
    gl.render(blurPlane, camera)
    blurPlane.material = vBlur
    vBlur.uniforms.tDiffuse.value = targetBlur.texture
    vBlur.uniforms.v.value = amount / 256
    gl.setRenderTarget(target)
    gl.render(blurPlane, camera)
    blurPlane.visible = false
  }

  useFrame(() => {
    const g = group.current
    if (!g || pending.current <= 0) return
    pending.current--
    const prevTarget = gl.getRenderTarget()
    const prevBackground = scene.background
    const prevOverride = scene.overrideMaterial
    g.visible = false
    scene.background = null
    scene.overrideMaterial = res.depth
    gl.setRenderTarget(res.target)
    gl.render(scene, res.camera)
    blurPass(blur)
    blurPass(blur * 0.4)
    gl.setRenderTarget(prevTarget)
    g.visible = true
    scene.overrideMaterial = prevOverride
    scene.background = prevBackground
  })

  return (
    <group ref={group} position={position} rotation-x={Math.PI / 2}>
      <mesh geometry={res.plane} material={res.display} scale={[1, -1, 1]} rotation={[-Math.PI / 2, 0, 0]} />
      <primitive object={res.camera} />
    </group>
  )
}
