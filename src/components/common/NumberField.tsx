interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  onCommit?: () => void
  step?: number
}

export function NumberField({ label, value, onChange, onCommit, step = 0.1 }: NumberFieldProps) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="w-4 text-ink-400">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? +value.toFixed(3) : 0}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onBlur={onCommit}
        className="w-full min-w-0 rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-ink-800 tabular-nums focus:border-brand-400"
      />
    </label>
  )
}
