import { Check, Trophy } from 'lucide-react'
import { useEffect } from 'react'
import { useT } from '../i18n/useT'
import { useToasts, type Toast } from './toastStore'

function ToastItem({ toast }: { toast: Toast }) {
  const t = useT()
  const dismiss = useToasts((s) => s.dismiss)
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.kind === 'ach' ? 4800 : 2600)
    return () => window.clearTimeout(id)
  }, [toast, dismiss])

  if (toast.kind === 'ach' && toast.ach) {
    return (
      <div className="glass-strong fade-up flex items-center gap-3 rounded-2xl border-amber-300/30 px-4 py-3" role="status">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-black shadow-[0_0_18px_rgba(252,211,77,0.6)]">
          <Trophy size={17} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[9px] tracking-[0.3em] text-amber-200/80">{t('ach.unlocked')}</span>
          <span className="text-[14px] font-bold text-white">{t(`ach.${toast.ach}.name`)}</span>
          <span className="text-[11px] text-cyan-100/60">{t(`ach.${toast.ach}.desc`)}</span>
        </span>
      </div>
    )
  }
  return (
    <div className="glass fade-up flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] text-white" role="status">
      <Check size={15} className="text-cyan-300" /> {toast.key ? t(toast.key) : null}
    </div>
  )
}

export function Toasts() {
  const toasts = useToasts((s) => s.toasts)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[132px] z-[55] flex flex-col items-center gap-2 px-3 sm:top-24">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
