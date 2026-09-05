interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  onCommit?: () => void
  format?: (value: number) => string
}

export function Slider({ label, value, min, max, step = 0.01, onChange, onCommit, format }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex items-center justify-between text-ink-500">
        <span>{label}</span>
        <span className="tabular-nums text-ink-700">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-500"
      />
    </label>
  )
}
