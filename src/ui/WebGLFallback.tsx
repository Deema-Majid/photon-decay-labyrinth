import { MonitorX, RotateCw } from 'lucide-react'
import { Component, type ReactNode } from 'react'
import { useT } from '../i18n/useT'

/** True when the browser can create a WebGL 2 context at all. */
export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

export function WebGLFallback() {
  const t = useT()
  return (
    <div className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-[#06080c] p-6" role="alert">
      <div className="glass-strong w-full max-w-[460px] rounded-3xl p-6 text-center">
        <MonitorX size={34} className="mx-auto text-cyan-300" />
        <h2 className="mt-3 text-xl font-bold text-white">{t('webgl.title')}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-cyan-50/75">{t('webgl.body')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px]"
        >
          <RotateCw size={15} /> {t('webgl.retry')}
        </button>
      </div>
    </div>
  )
}

/** Catches a renderer that cannot start (blocked or lost WebGL) and shows the fallback instead of a blank page. */
export class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[photon] 3D scene failed to start', error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
