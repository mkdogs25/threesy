import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { useThemeStore, type ThemePreference } from '../../state/themeStore'
import { Dialog } from './Dialog'

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

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
  const themePreference = useThemeStore((s) => s.preference)
  const setThemePreference = useThemeStore((s) => s.setPreference)

  if (!open) return null

  return (
    <Dialog title="Settings" onClose={() => setOpen(false)}>
      <div className="pb-3">
        <p className="mb-1.5 text-sm text-ink-700">Appearance</p>
        <div className="grid grid-cols-3 gap-1.5">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setThemePreference(opt.id)}
              className={`rounded-lg border py-1.5 text-xs font-medium ${
                themePreference === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-600 hover:border-brand-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-ink-100 border-t border-ink-100">
        <Toggle label="Show grid" checked={environment.showGrid} onChange={(v) => updateEnvironment({ showGrid: v })} />
        <Toggle label="Show shadows" checked={environment.showShadows} onChange={(v) => updateEnvironment({ showShadows: v })} />
        <Toggle label="Orthographic camera" checked={environment.orthographic} onChange={(v) => updateEnvironment({ orthographic: v })} />
        <Toggle label="Snap while transforming" checked={snapEnabled} onChange={toggleSnap} />
      </div>
    </Dialog>
  )
}
