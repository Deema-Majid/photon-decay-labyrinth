import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { LAB_Y, useGame, volatile } from '../store/useGame'
import { useToasts } from '../ui/toastStore'

/** Free orbit camera while photo mode is on. The camera director stands down meanwhile. */
export function PhotoControls() {
  const photo = useGame((s) => s.photo)
  if (!photo) return null
  return (
    <OrbitControls
      makeDefault
      target={[0, LAB_Y + 0.6, 0]}
      enableDamping
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={70}
      maxPolarAngle={Math.PI * 0.49}
    />
  )
}

/**
 * Reads the canvas right after the composer has drawn the frame (priority 2 > composer's 1),
 * so no preserveDrawingBuffer is needed.
 */
export function PhotoCapture() {
  useFrame(({ gl }) => {
    if (!volatile.captureRequested) return
    volatile.captureRequested = false
    try {
      const url = gl.domElement.toDataURL('image/png')
      const a = document.createElement('a')
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      a.href = url
      a.download = `photon-labyrinth-${stamp}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      useToasts.getState().push({ kind: 'info', key: 'photo.saved' })
      useGame.getState().achieve('photographer')
    } catch {
      /* the browser refused to read the canvas */
    }
  }, 2)
  return null
}
