import { Building2, Droplets, Leaf, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'

export function Finale() {
  const restart = useGame((s) => s.restart)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 2600)
    return () => window.clearTimeout(id)
  }, [])

  if (!show) return null

  const rows = [
    { icon: Sun, label: 'كفاءة المحطة', value: '100%', note: 'بعد إزالة الغبار والملح والسخام' },
    { icon: Droplets, label: 'خسائر الاتساخ المستعادة', value: '35%', note: 'نطاق نموذجي للتربة الصحراوية' },
    { icon: Building2, label: 'الخلايا المستعادة', value: '3 / 3', note: 'الربع الخالي · الساحل · المدينة' },
    { icon: Leaf, label: 'الطاقة النظيفة', value: 'مستمرة', note: 'تغذي مدينة المستقبل' },
  ]

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:p-8">
      <div className="glass-strong fade-up w-[min(96vw,760px)] rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-[11px] tracking-[0.35em] text-cyan-300">IMPACT TELEMETRY · VISION 2030</div>
            <h2 className="hud-title mt-1 text-2xl font-bold text-white sm:text-3xl">المحطة الشمسية تعمل بكامل طاقتها</h2>
          </div>
          <button
            type="button"
            onClick={restart}
            className="btn-primary rounded-2xl px-5 py-2.5 font-display text-[11px] tracking-[0.25em]"
          >
            إعادة التشغيل
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map(({ icon: Icon, label, value, note }) => (
            <div key={label} className="glass rounded-2xl p-3">
              <Icon size={16} className="text-cyan-300" />
              <div className="mt-2 font-display text-xl text-white">{value}</div>
              <div className="text-[12px] text-cyan-50/85">{label}</div>
              <div className="mt-1 text-[10px] leading-snug text-cyan-100/50">{note}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-cyan-100/40">الأرقام توضيحية لغرض التجربة التفاعلية وليست قياسات فعلية.</p>
      </div>
    </div>
  )
}
