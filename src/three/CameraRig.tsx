import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAB_Y, useGame, volatile } from '../store/useGame'
import { useProfile } from '../store/useProfile'
import { dampVec, easeInOutCubic } from './materials'

const DIVE_MS = 2800
const CRANE_MS = 3600
const FOCUS_MS = 1800
const FADE = 0.45

const PLAY_OFFSET = new THREE.Vector3(0, 12.5, 13.5)
/** steeper framing for tall phone screens */
const PORTRAIT_OFFSET = new THREE.Vector3(0, 15, 8)
const CLEAR_OFFSET = new THREE.Vector3(0, 15.5, 17)
const FINALE_POS = new THREE.Vector3(0, LAB_Y + 14, 34)
const FINALE_LOOK = new THREE.Vector3(0, LAB_Y + 5, -22)
const FINALE_FOCUS: [number, number, number] = [0, LAB_Y + 8, -48]

const PLAY_FOV = 38
const PORTRAIT_FOV = 58

type V3 = [number, number, number]
interface Shot {
  dur: number
  from: V3
  to: V3
  lookFrom: V3
  lookTo: V3
  /** in-focus depth range in world units */
  range: number
  bokeh: number
  fov: number
  orbit?: boolean
}

/** Intro shot list: the camera cuts between these on a loop while the title is up. */
const SHOTS: Shot[] = [
  // 1. grazing dolly across the dusty panels into the low desert sun
  { dur: 8, from: [-30, 2.8, 12], to: [-14, 2.3, 7], lookFrom: [-75, 9, -52], lookTo: [-68, 8, -60], range: 40, bokeh: 1.1, fov: 40 },
  // 2. macro: salt crust and dust on a single cell, very shallow focus
  { dur: 7, from: [0.4, 1.9, 5.2], to: [2.6, 1.7, 4.8], lookFrom: [1.8, 1.0, 2.6], lookTo: [2.8, 1.0, 2.4], range: 1.4, bokeh: 3, fov: 34 },
  // 3. crane up to the wide establishing shot
  { dur: 9, from: [24, 3.5, 24], to: [18, 19, 34], lookFrom: [4, 1, 0], lookTo: [-6, 2, -12], range: 45, bokeh: 0.8, fov: 46 },
  // 4. slow orbit with mouse parallax
  { dur: 14, from: [0, 0, 0], to: [0, 0, 0], lookFrom: [0, 0.5, 0], lookTo: [0, 0.5, 0], range: 30, bokeh: 0.9, fov: 50, orbit: true },
]
const SHOT_TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0)

const v = (a: V3, out: THREE.Vector3) => out.set(a[0], a[1], a[2])

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const phase = useGame((s) => s.phase)
  const hovered = useGame((s) => s.hovered)
  const level = useGame((s) => s.level)

  const target = useMemo(() => new THREE.Vector3(0, 10, 26), [])
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const lookCurrent = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const labCenter = useMemo(() => new THREE.Vector3(0, LAB_Y, 0), [])
  const tmpA = useMemo(() => new THREE.Vector3(), [])
  const tmpB = useMemo(() => new THREE.Vector3(), [])
  const evPos = useMemo(() => new THREE.Vector3(), [])
  const offRot = useMemo(() => new THREE.Vector3(), [])
  const diveCurve = useRef<THREE.CatmullRomCurve3 | null>(null)
  const diveLookFrom = useRef(new THREE.Vector3())
  const craneFrom = useRef<THREE.Vector3 | null>(null)
  const craneLookFrom = useRef(new THREE.Vector3())
  const prevLevel = useRef(level.id)
  const introStart = useRef(performance.now())
  const lastShot = useRef(-1)
  const shakeSeed = useRef(Math.random() * 100)

  useEffect(() => {
    if (phase === 'intro') {
      introStart.current = performance.now()
      lastShot.current = -1
    }
    if (phase === 'diving') {
      volatile.cut = 0
      diveLookFrom.current.copy(lookCurrent)
      const tall = size.width / Math.max(1, size.height) < 0.85
      const end = labCenter.clone().add(tall ? new THREE.Vector3(PORTRAIT_OFFSET.z * 2.2, PORTRAIT_OFFSET.y * 2.2, 0) : PLAY_OFFSET)
      diveCurve.current = new THREE.CatmullRomCurve3([
        camera.position.clone(),
        new THREE.Vector3(camera.position.x * 0.35, 7, camera.position.z * 0.35),
        new THREE.Vector3(0.5, 1.2, 0.5),
        new THREE.Vector3(1.5, -24, 2.5),
        new THREE.Vector3(end.x, end.y + 6, end.z + 2),
        end,
      ])
    }
  }, [phase, camera, labCenter, lookCurrent, size])

  // new level: start high above the cell and crane down onto the board
  useEffect(() => {
    if (prevLevel.current === level.id) return
    prevLevel.current = level.id
    // only crane between cells during play; a level picked from the menu arrives by the dive instead
    if (useGame.getState().phase !== 'playing') return
    craneFrom.current = labCenter.clone().add(new THREE.Vector3(6, 34, 30))
    craneLookFrom.current.copy(labCenter).add(new THREE.Vector3(0, 0, -6))
    camera.position.copy(craneFrom.current)
    lookCurrent.copy(craneLookFrom.current)
  }, [level.id, camera, labCenter, lookCurrent])

  useFrame(({ clock }, dt) => {
    if (useGame.getState().photo) return
    const t = clock.getElapsedTime()
    const now = performance.now()
    const [mx, my] = volatile.mouse
    const d = Math.min(dt, 0.05)
    let fovTarget = PLAY_FOV

    if (phase === 'intro') {
      const time = ((now - introStart.current) / 1000) % SHOT_TOTAL
      let acc = 0
      let idx = 0
      while (idx < SHOTS.length - 1 && time >= acc + SHOTS[idx].dur) acc += SHOTS[idx++].dur
      const shot = SHOTS[idx]
      const local = time - acc
      const p = local / shot.dur
      const e = p * p * (3 - 2 * p) * 0.6 + p * 0.4 // mostly linear with soft ends
      if (shot.orbit) {
        const a = local * 0.05 + 0.6 + mx * 0.35
        const r = 33 + Math.sin(local * 0.17) * 4
        camera.position.set(Math.sin(a) * r, 11.5 + Math.sin(local * 0.23) * 1.5 + my * 2.4, Math.cos(a) * r)
        lookCurrent.set(-mx * 3, 0.5 - my * 1.2, 0)
      } else {
        v(shot.from, tmpA)
        v(shot.to, tmpB)
        camera.position.copy(tmpA).lerp(tmpB, e)
        camera.position.x += mx * 0.6
        camera.position.y -= my * 0.35
        v(shot.lookFrom, tmpA)
        v(shot.lookTo, tmpB)
        lookCurrent.copy(tmpA).lerp(tmpB, e)
      }
      // hard focus values per shot, the PostFX layer eases between them
      volatile.focus = [lookCurrent.x, lookCurrent.y, lookCurrent.z]
      if (shot.orbit) volatile.focus = [0, 1, 0]
      volatile.focusRange = shot.range
      volatile.bokeh = shot.bokeh
      fovTarget = shot.fov
      // hard cuts between shots; only the very first shot fades in from black
      volatile.cut = time < FADE * 2 && idx === 0 && performance.now() - introStart.current < SHOT_TOTAL * 1000 ? 1 - time / (FADE * 2) : 0
      if (lastShot.current !== idx) {
        lastShot.current = idx
        camera.fov = shot.fov
        camera.updateProjectionMatrix()
      }
    } else if (phase === 'diving' && diveCurve.current) {
      const p = Math.min(1, (now - volatile.diveStart) / DIVE_MS)
      const e = easeInOutCubic(p)
      diveCurve.current.getPointAt(e, camera.position)
      look.copy(diveLookFrom.current).lerp(labCenter, Math.min(1, e * 1.3))
      lookCurrent.copy(look)
      volatile.focus = [look.x, look.y + 1, look.z]
      volatile.focusRange = 25
      volatile.bokeh = 1
      fovTarget = 46
      if (p >= 1) useGame.getState().beginPlay()
    } else if (phase === 'playing' || phase === 'clear') {
      const aspect = size.width / Math.max(1, size.height)
      const portrait = aspect < 0.85
      const base = phase === 'clear' ? CLEAR_OFFSET : portrait ? PORTRAIT_OFFSET : PLAY_OFFSET
      // portrait screens look along the board's long axis so it fills the tall frame
      const off = portrait ? offRot.set(base.z, base.y, -base.x) : offRot.copy(base)
      const fov = portrait ? PORTRAIT_FOV : PLAY_FOV
      const dolly = hovered && !portrait ? 0.92 : 1
      const depthScale = Math.max(level.cols, level.rows) / 9

      // fit the board on screen both across and in depth
      const baseDist = base.length()
      const vHalf = THREE.MathUtils.degToRad(fov / 2)
      const hHalf = Math.atan(Math.tan(vHalf) * aspect)
      const across = (portrait ? level.rows : level.cols) * 2 + 2.5
      const along = (portrait ? level.cols : level.rows) * 2 + 2.5
      const elev = Math.atan2(base.y, Math.hypot(base.x, base.z))
      const needH = across / (2 * Math.tan(hHalf))
      const needV = ((along * Math.sin(elev)) / (2 * Math.tan(vHalf))) * 1.15
      const ref = baseDist * depthScale
      const dist = Math.max(ref, needH, needV)
      const scale = (dist / baseDist) * dolly
      volatile.fogScale = Math.min(1, Math.pow(PLAY_OFFSET.length() * depthScale / dist, 1.3))
      fovTarget = fov

      target.set(labCenter.x + off.x * scale + mx * 0.9, labCenter.y + off.y * scale, labCenter.z + off.z * scale + my * 0.6)
      // operator drift: the camera never sits perfectly still
      target.x += Math.sin(t * 0.37) * 0.16
      target.y += Math.sin(t * 0.29) * 0.1
      target.z += Math.cos(t * 0.31) * 0.12
      if (phase === 'clear') target.x += Math.sin(t * 0.3) * 3
      look.set(labCenter.x - mx * 0.6 - (portrait ? 1.2 : 0), labCenter.y + 0.4, labCenter.z - (portrait ? 0 : 1.2))

      let focusX = look.x
      let focusZ = look.z
      let range = 14 * depthScale
      let bokeh = 0.55

      // push-in and focus pull toward a burn / shatter / lock event
      const reduced = useProfile.getState().settings.reducedMotion
      const fe = volatile.focusEvent
      if (fe && phase === 'playing' && !reduced) {
        const k = (now - fe.t0) / FOCUS_MS
        if (k >= 1) {
          volatile.focusEvent = null
        } else {
          const bell = Math.sin(Math.PI * Math.min(1, k * 1.15))
          evPos.set(fe.x, LAB_Y + 0.8, fe.z)
          tmpA.copy(evPos).add(tmpB.set(0, 6.5, 7))
          target.lerp(tmpA, bell * 0.4)
          look.lerp(evPos, bell * 0.55)
          focusX = THREE.MathUtils.lerp(focusX, fe.x, bell)
          focusZ = THREE.MathUtils.lerp(focusZ, fe.z, bell)
          range = THREE.MathUtils.lerp(range, 4, bell)
          bokeh = THREE.MathUtils.lerp(bokeh, 1.4, bell)
        }
      }
      volatile.focus = [focusX, LAB_Y + 0.8, focusZ]
      volatile.focusRange = range
      volatile.bokeh = bokeh

      const craneK = craneFrom.current ? (now - volatile.levelStart) / CRANE_MS : 1
      if (craneFrom.current && craneK < 1) {
        const e = easeInOutCubic(Math.max(0, craneK))
        camera.position.copy(craneFrom.current).lerp(target, e)
        lookCurrent.copy(craneLookFrom.current).lerp(look, e)
        fovTarget = THREE.MathUtils.lerp(48, fov, e)
      } else {
        craneFrom.current = null
        dampVec(camera.position, target, 3.2, d)
        dampVec(lookCurrent, look, 4, d)
      }
    } else if (phase === 'finale') {
      target.copy(FINALE_POS)
      target.x += Math.sin(t * 0.12) * 6 + mx * 2
      target.y += Math.sin(t * 0.2) * 1.5 + my
      dampVec(camera.position, target, 0.9, d)
      dampVec(lookCurrent, FINALE_LOOK, 1.2, d)
      volatile.focus = FINALE_FOCUS
      volatile.focusRange = 70
      volatile.bokeh = 0.7
      fovTarget = 46
    }

    if (phase !== 'intro') volatile.cut = 0
    if (phase !== 'playing' && phase !== 'clear') volatile.fogScale = 1

    // trauma-based shake: offset scales with trauma squared, never on the dive path
    const tr = volatile.trauma
    if (tr > 0.001 && phase !== 'diving' && !useProfile.getState().settings.reducedMotion) {
      const s = tr * tr * 0.55
      const n = shakeSeed.current
      camera.position.x += Math.sin(t * 61 + n) * s
      camera.position.y += Math.sin(t * 47 + n * 2) * s * 0.7
      camera.position.z += Math.cos(t * 53 + n * 3) * s * 0.5
    }
    camera.lookAt(lookCurrent)
    if (Math.abs(camera.fov - fovTarget) > 0.01) {
      camera.fov += (fovTarget - camera.fov) * Math.min(1, d * 1.5)
      camera.updateProjectionMatrix()
    }
  })

  return null
}
