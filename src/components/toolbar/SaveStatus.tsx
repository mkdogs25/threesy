import { Check, Loader2 } from 'lucide-react'
import { useProjectStore } from '../../state/projectStore'

export function SaveStatus() {
  const status = useProjectStore((s) => s.saveStatus)

  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-400">
      {status === 'saving' ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          <span>Saving…</span>
        </>
      ) : status === 'saved' ? (
        <>
          <Check size={13} className="text-green-600" />
          <span>Saved locally</span>
        </>
      ) : (
        <span>Unsaved changes</span>
      )}
    </div>
  )
}
