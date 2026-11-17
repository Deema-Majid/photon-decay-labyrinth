import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useT } from '../../i18n/useT'
import { NAME_MAX, totalStars, useProfile, type NameCheck } from '../../store/useProfile'
import { AVATARS, Avatar, Modal } from '../kit'

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'rename'; id: string }

export function ProfileModal({
  initial = 'list',
  onClose,
  onCreated,
}: {
  initial?: 'list' | 'create'
  onClose: () => void
  onCreated?: () => void
}) {
  const t = useT()
  const profiles = useProfile((s) => s.profiles)
  const [mode, setMode] = useState<Mode>(
    initial === 'create' || profiles.length === 0 ? { kind: 'create' } : { kind: 'list' },
  )

  const title =
    mode.kind === 'create' ? t('profile.createTitle') : mode.kind === 'rename' ? t('profile.renameTitle') : t('profile.title')

  return (
    <Modal title={title} onClose={onClose}>
      {mode.kind === 'list' ? (
        <ProfileList onCreate={() => setMode({ kind: 'create' })} onRename={(id) => setMode({ kind: 'rename', id })} />
      ) : (
        <ProfileForm
          editId={mode.kind === 'rename' ? mode.id : undefined}
          onCancel={profiles.length > 0 ? () => setMode({ kind: 'list' }) : onClose}
          onDone={() => {
            if (mode.kind === 'create' && onCreated) onCreated()
            else setMode({ kind: 'list' })
          }}
        />
      )}
      <p className="mt-4 text-[11px] leading-relaxed text-cyan-100/45">{t('profile.localNote')}</p>
    </Modal>
  )
}

function ProfileList({ onCreate, onRename }: { onCreate: () => void; onRename: (id: string) => void }) {
  const t = useT()
  const profiles = useProfile((s) => s.profiles)
  const activeId = useProfile((s) => s.activeId)
  const selectProfile = useProfile((s) => s.selectProfile)
  const deleteProfile = useProfile((s) => s.deleteProfile)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {profiles.map((p) => {
        const active = p.id === activeId
        return (
          <div
            key={p.id}
            className={`rounded-2xl border p-3 transition ${active ? 'border-cyan-300/40 bg-cyan-300/[0.07]' : 'border-white/10 bg-white/[0.02]'}`}
          >
            <div className="flex items-center gap-3">
              <Avatar index={p.avatar} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-white">{p.name}</span>
                  {active ? (
                    <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] text-cyan-200">{t('profile.active')}</span>
                  ) : null}
                </div>
                <div className="text-[11px] text-cyan-100/55">
                  {t('profile.summary', { clears: Object.keys(p.best).length, stars: totalStars(p) })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!active ? (
                  <button
                    type="button"
                    onClick={() => selectProfile(p.id)}
                    className="rounded-lg border border-cyan-300/30 px-2.5 py-1.5 text-[12px] text-cyan-100 transition hover:bg-cyan-300/10"
                  >
                    {t('profile.use')}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onRename(p.id)}
                  aria-label={t('profile.rename')}
                  title={t('profile.rename')}
                  className="rounded-lg p-2 text-cyan-100/60 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(p.id)}
                  aria-label={t('profile.delete')}
                  title={t('profile.delete')}
                  className="rounded-lg p-2 text-cyan-100/60 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {confirmId === p.id ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-500/10 p-2.5">
                <span className="text-[12px] text-red-100">{t('profile.confirmDelete', { name: p.name })}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg px-2.5 py-1 text-[12px] text-white/70 hover:text-white"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteProfile(p.id)
                      setConfirmId(null)
                    }}
                    className="rounded-lg bg-red-500/80 px-2.5 py-1 text-[12px] text-white hover:bg-red-500"
                  >
                    {t('profile.confirmYes')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
      <button
        type="button"
        onClick={onCreate}
        className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-300/30 p-3 text-[13px] text-cyan-100/80 transition hover:border-cyan-300/60 hover:text-white"
      >
        <Plus size={16} /> {t('profile.addNew')}
      </button>
    </div>
  )
}

function ProfileForm({ editId, onCancel, onDone }: { editId?: string; onCancel: () => void; onDone: () => void }) {
  const t = useT()
  const existing = useProfile((s) => (editId ? s.profiles.find((p) => p.id === editId) : undefined))
  const checkName = useProfile((s) => s.checkName)
  const createProfile = useProfile((s) => s.createProfile)
  const renameProfile = useProfile((s) => s.renameProfile)
  const setAvatar = useProfile((s) => s.setAvatar)
  const [name, setName] = useState(existing?.name ?? '')
  const [avatar, setAvatarLocal] = useState(existing?.avatar ?? 1)
  const [touched, setTouched] = useState(false)

  const check: NameCheck = checkName(name, editId)
  const error = touched && check !== 'ok' ? (check === 'short' ? t('profile.nameShort') : t('profile.nameTaken')) : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (check !== 'ok') return
    if (editId) {
      renameProfile(editId, name)
      setAvatar(editId, avatar)
    } else {
      createProfile(name, avatar)
    }
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] text-cyan-100/80">{t('profile.nameLabel')}</span>
        <input
          autoFocus
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t('profile.namePlaceholder')}
          aria-invalid={!!error}
          className="rounded-xl border border-cyan-200/20 bg-black/40 px-3.5 py-2.5 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.12)]"
        />
        <span className={`text-[11px] ${error ? 'text-red-300' : 'text-cyan-100/45'}`}>{error ?? t('profile.nameHint')}</span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-cyan-100/80">{t('profile.avatar')}</span>
        <div className="flex flex-wrap gap-2.5">
          {AVATARS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={avatar === i}
              onClick={() => setAvatarLocal(i)}
              className={`rounded-full p-1 transition ${avatar === i ? 'ring-2 ring-cyan-300' : 'opacity-60 hover:opacity-100'}`}
            >
              <Avatar index={i} size={42} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-[13px] text-white/70 hover:text-white">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px]">
          <Check size={15} /> {editId ? t('common.save') : t('profile.create')}
        </button>
      </div>
    </form>
  )
}
