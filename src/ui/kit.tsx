import { Atom, Flame, Gem, Hexagon, Star, Sun, X, Zap, type LucideIcon } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { useT } from '../i18n/useT'

export const AVATARS: { icon: LucideIcon; from: string; to: string }[] = [
  { icon: Sun, from: '#ffcf7a', to: '#ff6a2b' },
  { icon: Zap, from: '#7df9ff', to: '#0b7dff' },
  { icon: Atom, from: '#d8b4fe', to: '#7c3aed' },
  { icon: Gem, from: '#99f6e4', to: '#0d9488' },
  { icon: Flame, from: '#ff8a7a', to: '#c81e1e' },
  { icon: Hexagon, from: '#f1f5f9', to: '#64748b' },
]

export function Avatar({ index, size = 36 }: { index: number; size?: number }) {
  const a = AVATARS[index % AVATARS.length]
  const Icon = a.icon
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${a.from}, ${a.to} 75%)`,
        boxShadow: `0 0 14px ${a.to}88, inset 0 0 0 1px rgba(255,255,255,0.25)`,
      }}
    >
      <Icon size={size * 0.5} strokeWidth={2} color="#06121a" />
    </span>
  )
}

export function Stars({ count, max = 3, size = 16 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.6}
          className={i < count ? 'text-amber-300' : 'text-white/20'}
          fill={i < count ? 'currentColor' : 'none'}
          style={i < count ? { filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.6))' } : undefined}
        />
      ))}
    </span>
  )
}

/**
 * Glass dialog. Escape closes it and is stopped in the capture phase,
 * so the in-game Escape (pause toggle) does not also fire.
 */
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const t = useT()
  const titleId = useId()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [onClose])

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`glass-strong fade-up flex max-h-[88vh] w-full flex-col rounded-3xl ${wide ? 'max-w-[680px]' : 'max-w-[480px]'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cyan-200/10 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-cyan-100/60 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-cyan-200/15 bg-black/30 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-[13px] transition ${
            value === o.value ? 'bg-cyan-300/15 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]' : 'text-cyan-100/60 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        checked ? 'border-cyan-300/60 bg-cyan-300/25' : 'border-white/15 bg-white/5'
      }`}
    >
      <span
        className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all ${
          checked ? 'bg-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.7)]' : 'bg-white/40'
        }`}
        style={{ insetInlineStart: checked ? 'calc(100% - 20px)' : '2px' }}
      />
    </button>
  )
}

export function MenuButton({
  children,
  onClick,
  icon,
}: {
  children: ReactNode
  onClick: () => void
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] text-cyan-50/85 transition hover:border-cyan-300/40 hover:text-white"
    >
      {icon}
      {children}
    </button>
  )
}
