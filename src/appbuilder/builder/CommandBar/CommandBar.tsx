import { Check, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import { parseCommand } from '../../logic/Parser/parseCommand'
import { applyCommand } from '../../logic/Commands/applyCommand'
import type { ParseResult } from '../../logic/Parser/types'

const EXAMPLES = [
  'Add a button',
  'Make the button blue',
  'Make the heading bigger',
  'Add a login screen',
  'Add a bottom navigation bar',
  'When I click this button, go to Settings',
]

export function CommandBar() {
  const project = useAppBuilderStore((s) => s.project)
  const selection = useAppBuilderStore((s) => s.selection)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)

  function handleSubmit() {
    if (!input.trim()) return
    setResult(parseCommand(input, project, selection[selection.length - 1] ?? null))
  }

  function handleApply() {
    if (result && result.kind !== 'unrecognized') applyCommand(result)
    setResult(null)
    setInput('')
  }

  function handleCancel() {
    setResult(null)
    setInput('')
  }

  return (
    <div className="panel flex flex-col gap-2 p-2.5">
      {result && result.kind !== 'unrecognized' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-xs font-semibold text-brand-700">{result.title}</span>
            {result.summary.map((row) => (
              <span key={row.label} className="text-[11px] text-ink-600">
                <span className="font-medium text-ink-500">{row.label}:</span> {row.value}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={handleApply} className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700">
              <Check size={12} /> Apply
            </button>
            <button type="button" onClick={handleCancel} className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[11px] font-semibold text-ink-600 hover:bg-ink-50">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}
      {result && result.kind === 'unrecognized' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2">
          <span className="text-[11px] text-ink-500">
            I didn't understand that. Try: <span className="font-medium text-ink-600">{EXAMPLES[0]}</span>
          </span>
          <button type="button" onClick={handleCancel} className="btn-icon h-6 w-6">
            <X size={12} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="shrink-0 text-brand-500" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Describe what you want — “Add a button”, “Make the heading bigger”…"
          className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm focus:border-brand-400"
        />
        <button type="button" onClick={handleSubmit} className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800">
          Go
        </button>
      </div>
    </div>
  )
}
