import { AlertTriangle } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { Dialog } from './Dialog'

export function ErrorDialog() {
  const error = useUIStore((s) => s.errorDialog)
  const clear = useUIStore((s) => s.clearError)
  if (!error) return null

  return (
    <Dialog title={error.title} onClose={clear}>
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-red-50 p-2 text-red-500">
          <AlertTriangle size={18} />
        </span>
        <p className="pt-1.5 text-sm text-ink-600">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        OK
      </button>
    </Dialog>
  )
}
