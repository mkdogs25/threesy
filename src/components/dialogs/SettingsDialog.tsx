import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { Dialog } from './Dialog'

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 text-sm text-ink-700">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-200'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

export function SettingsDialog() {
  const open = useUIStore((s) => s.settingsOpen)
  const setOpen = useUIStore((s) => s.setSettingsOpen)
  const environment = useProjectStore((s) => s.project.environment)
  const updateEnvironment = useProjectStore((s) => s.updateEnvironment)
  const snapEnabled = useUIStore((s) => s.snapEnabled)
  const toggleSnap = useUIStore((s) => s.toggleSnap)

  if (!open) return null

  return (
    <Dialog title="Settings" onClose={() => setOpen(false)}>
      <div className="divide-y divide-ink-100">
        <Toggle label="Show grid" checked={environment.showGrid} onChange={(v) => updateEnvironment({ showGrid: v })} />
        <Toggle label="Show shadows" checked={environment.showShadows} onChange={(v) => updateEnvironment({ showShadows: v })} />
        <Toggle label="Orthographic camera" checked={environment.orthographic} onChange={(v) => updateEnvironment({ orthographic: v })} />
        <Toggle label="Snap while transforming" checked={snapEnabled} onChange={toggleSnap} />
      </div>
    </Dialog>
  )
}
