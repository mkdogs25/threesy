import { Check } from 'lucide-react'
import { Dialog } from '../../components/dialogs/Dialog'
import { Slider } from '../../components/common/Slider'
import { useAppBuilderStore } from '../project/appBuilderStore'
import { PRESET_THEMES, type ProjectTheme } from '../project/schema/themes'

const FONT_CHOICES: { label: string; value: string }[] = [
  { label: 'System default', value: '' },
  { label: 'Classic sans', value: '"Helvetica Neue", Arial, sans-serif' },
  { label: 'Friendly rounded', value: '"Trebuchet MS", Verdana, sans-serif' },
  { label: 'Classic serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: '"Courier New", Consolas, monospace' },
]

function ColorField({ label, value, onChange, onCommit }: { label: string; value: string; onChange: (v: string) => void; onCommit: () => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-ink-500">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onCommit} className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent" />
    </label>
  )
}

export function ThemeDialog({ onClose }: { onClose: () => void }) {
  const theme = useAppBuilderStore((s) => s.project.theme)
  const applyPresetTheme = useAppBuilderStore((s) => s.applyPresetTheme)
  const updateTheme = useAppBuilderStore((s) => s.updateTheme)
  const commit = useAppBuilderStore((s) => s.commit)

  function patch(field: keyof ProjectTheme, value: string | number) {
    updateTheme({ [field]: value } as Partial<ProjectTheme>)
  }

  return (
    <Dialog title="Theme" onClose={onClose} width="max-w-lg">
      <p className="mb-3 text-[11px] text-ink-400">
        Pick a starting palette, then tweak it below — every button, background, and card that follows the theme updates instantly.
      </p>

      <div className="grid grid-cols-4 gap-2">
        {PRESET_THEMES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPresetTheme(preset)}
            className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
              theme.id === preset.id ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-brand-300'
            }`}
          >
            {theme.id === preset.id && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white">
                <Check size={10} />
              </span>
            )}
            <span className="flex h-9 w-full overflow-hidden rounded-lg border border-ink-100">
              <span className="h-full w-1/2" style={{ background: preset.primary }} />
              <span className="h-full w-1/2" style={{ background: preset.background }} />
            </span>
            <span className="text-[11px] font-medium text-ink-700">{preset.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          {theme.id === 'custom' ? 'Custom theme' : 'Customize'}
        </p>
        <div className="flex flex-col gap-2.5">
          <ColorField label="Primary (buttons, accents)" value={theme.primary} onChange={(v) => patch('primary', v)} onCommit={commit} />
          <ColorField label="Text on primary" value={theme.primaryText} onChange={(v) => patch('primaryText', v)} onCommit={commit} />
          <ColorField label="Page background" value={theme.background} onChange={(v) => patch('background', v)} onCommit={commit} />
          <ColorField label="Card / surface background" value={theme.surface} onChange={(v) => patch('surface', v)} onCommit={commit} />
          <ColorField label="Heading text" value={theme.text} onChange={(v) => patch('text', v)} onCommit={commit} />
          <ColorField label="Body text" value={theme.textMuted} onChange={(v) => patch('textMuted', v)} onCommit={commit} />
          <ColorField label="Borders & dividers" value={theme.border} onChange={(v) => patch('border', v)} onCommit={commit} />
          <Slider label="Corner roundness" value={theme.radius} min={0} max={28} step={1} onChange={(v) => patch('radius', v)} onCommit={commit} format={(v) => `${v}px`} />
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-ink-500">Font</span>
            <select
              value={theme.fontFamily}
              onChange={(e) => {
                patch('fontFamily', e.target.value)
                commit()
              }}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            >
              {FONT_CHOICES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </Dialog>
  )
}
