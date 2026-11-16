import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame, volatile } from '../store/useGame'
import { dampVec, easeInOutCubic } from './materials'

const DIVE_MS = 2800

const PLAY_OFFSET = new THREE.Vector3(0, 13.5, 11)
const CLEAR_OFFSET = new THREE.Vector3(0, 17, 15)
const FINALE_POS = new THREE.Vector3(0, LAB_Y + 14, 34)
const FINALE_LOOK = new THREE.Vector3(0, LAB_Y + 5, -22)

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const phase = useGame((s) => s.phase)
  const hovered = useGame((s) => s.hovered)
  const level = useGame((s) => s.level)

  const target = useMemo(() => new THREE.Vector3(0, 10, 26), [])
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const lookCurrent = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const labCenter = useMemo(() => new THREE.Vector3(0, LAB_Y, 0), [])
  const diveCurve = useRef<THREE.CatmullRomCurve3 | null>(null)
  const diveFrom = useRef(new THREE.Vector3())
  const diveLookFrom = useRef(new THREE.Vector3())
  const shakeSeed = useRef(Math.random() * 100)

  useEffect(() => {
    if (phase === 'diving') {
      diveFrom.current.copy(camera.position)
      diveLookFrom.current.copy(lookCurrent)
      const end = labCenter.clone().add(PLAY_OFFSET)
      diveCurve.current = new THREE.CatmullRomCurve3([
        camera.position.clone(),
        new THREE.Vector3(camera.position.x * 0.35, 7, camera.position.z * 0.35),
        new THREE.Vector3(0.5, 1.2, 0.5),
        new THREE.Vector3(1.5, -24, 2.5),
        new THREE.Vector3(end.x, end.y + 6, end.z + 2),
        end,
      ])
    }
  }, [phase, camera, labCenter, lookCurrent])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    const [mx, my] = volatile.mouse
    const d = Math.min(dt, 0.05)

    if (phase === 'intro') {
      const a = t * 0.05 + mx * 0.35
      const r = 33 + Math.sin(t * 0.17) * 4
      target.set(Math.sin(a) * r, 11.5 + Math.sin(t * 0.23) * 1.5 + my * 2.4, Math.cos(a) * r)
      look.set(-mx * 3, 0.5 - my * 1.2, 0)
      dampVec(camera.position, target, 2.2, d)
      dampVec(lookCurrent, look, 3, d)
    } else if (phase === 'diving' && diveCurve.current) {
      const p = Math.min(1, (performance.now() - volatile.diveStart) / DIVE_MS)
      const e = easeInOutCubic(p)
      diveCurve.current.getPointAt(e, camera.position)
      look.copy(diveLookFrom.current).lerp(labCenter, Math.min(1, e * 1.3))
      lookCurrent.copy(look)
      if (p >= 1) useGame.getState().beginPlay()
    } else if (phase === 'playing' || phase === 'clear') {
      const off = phase === 'clear' ? CLEAR_OFFSET : PLAY_OFFSET
      const dolly = hovered ? 0.88 : 1
      const depthScale = Math.max(level.cols, level.rows) / 9
      target.set(
        labCenter.x + mx * 0.9 + off.x,
        labCenter.y + off.y * dolly * depthScale,
        labCenter.z + off.z * dolly * depthScale + my * 0.6,
      )
      if (phase === 'clear') {
        target.x += Math.sin(t * 0.3) * 3
      }
      look.set(labCenter.x - mx * 0.6, labCenter.y + 0.4, labCenter.z - 1.2)
      dampVec(camera.position, target, 3.2, d)
      dampVec(lookCurrent, look, 4, d)
    } else if (phase === 'finale') {
      target.copy(FINALE_POS)
      target.x += Math.sin(t * 0.12) * 6 + mx * 2
      target.y += Math.sin(t * 0.2) * 1.5 + my
      dampVec(camera.position, target, 0.9, d)
      dampVec(lookCurrent, FINALE_LOOK, 1.2, d)
    }

    // trauma-based shake: offset scales with trauma squared, never on the dive path
    const tr = volatile.trauma
    if (tr > 0.001 && phase !== 'diving') {
      const s = tr * tr * 0.55
      const n = shakeSeed.current
      camera.position.x += Math.sin(t * 61 + n) * s
      camera.position.y += Math.sin(t * 47 + n * 2) * s * 0.7
      camera.position.z += Math.cos(t * 53 + n * 3) * s * 0.5
    }
    camera.lookAt(lookCurrent)
    const cam = camera as THREE.PerspectiveCamera
    const fovTarget = phase === 'intro' ? 50 : phase === 'finale' ? 46 : 42
    if (Math.abs(cam.fov - fovTarget) > 0.01) {
      cam.fov += (fovTarget - cam.fov) * Math.min(1, d * 1.5)
      cam.updateProjectionMatrix()
    }
  })

  return null
}
