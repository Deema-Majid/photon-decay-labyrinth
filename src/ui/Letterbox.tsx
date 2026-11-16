import { useGame } from '../store/useGame'

/** Cinematic black bars for the intro, the dive and the finale. */
export function Letterbox() {
  const phase = useGame((s) => s.phase)
  const on = phase === 'intro' || phase === 'diving' || phase === 'finale'
  const style = {
    transition: 'height 900ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    height: on ? '6vh' : '0vh',
  }
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-10 bg-black" style={style} />
      <div className="absolute inset-x-0 bottom-0 z-10 bg-black" style={style} />
    </>
  )
}
