import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  placeholder?: string
  onSave: (value: string) => void
  textClassName?: string
  inputClassName?: string
  pencilClassName?: string
  /** Crayon toujours visible (pas seulement au survol). */
  alwaysVisiblePencil?: boolean
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.5 3.5 16.5 6.5M4 16l.6-3 8.6-8.6a1.5 1.5 0 0 1 2.1 0l.3.3a1.5 1.5 0 0 1 0 2.1L7 15.4 4 16Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EditableLine({
  value,
  placeholder = 'Ajouter…',
  onSave,
  textClassName = '',
  inputClassName = '',
  pencilClassName = '',
  alwaysVisiblePencil = false,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft.trim() !== value) onSave(draft.trim())
  }

  const startEdit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraft(value)
    setEditing(true)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        draggable={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        onKeyUp={(e) => e.stopPropagation()}
        className={inputClassName}
      />
    )
  }

  return (
    <span className="group/line flex items-center gap-1 min-w-0">
      <span className={`${textClassName} ${value ? '' : 'italic opacity-60'} truncate min-w-0`}>
        {value || placeholder}
      </span>
      <button
        type="button"
        draggable={false}
        onClick={startEdit}
        onMouseDown={(e) => e.stopPropagation()}
        className={`shrink-0 transition rounded p-0.5 hover:bg-black/10 ${
          alwaysVisiblePencil ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover/line:opacity-100 focus:opacity-100'
        } ${pencilClassName}`}
        aria-label="Modifier"
      >
        <PencilIcon className="w-3 h-3" />
      </button>
    </span>
  )
}
