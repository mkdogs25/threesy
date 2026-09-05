import { X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export function Dialog({ title, onClose, children, width = 'max-w-md' }: DialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`w-full ${width} animate-scale-in rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink-800">{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon h-7 w-7" aria-label="Close">
            <X size={15} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
