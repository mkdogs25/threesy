import { useState } from 'react'
import { Combine, Minus, Scissors, X } from 'lucide-react'
import type { BooleanOp, Modifier, SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { Section } from '../common/Section'
import { Slider } from '../common/Slider'

const BOOLEAN_OPS: { id: BooleanOp; label: string; icon: typeof Combine }[] = [
  { id: 'add', label: 'Add', icon: Combine },
  { id: 'cut', label: 'Cut', icon: Scissors },
  { id: 'intersect', label: 'Intersect', icon: Minus },
]

export function ModifiersSection({ object }: { object: SceneObject }) {
  const objects = useProjectStore((s) => s.project.objects)
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)
  const [toolId, setToolId] = useState<string>('')

  const others = objects.filter((o) => o.id !== object.id && o.kind !== 'group')

  function applyBoolean(op: BooleanOp) {
    if (!toolId) return
    commit()
    const mod: Modifier = { type: 'boolean', op, toolId }
    updateObject(object.id, { modifiers: [...object.modifiers, mod] })
    updateObject(toolId, { visible: false })
  }

  function removeModifier(index: number) {
    commit()
    const removed = object.modifiers[index]
    const next = object.modifiers.filter((_, i) => i !== index)
    updateObject(object.id, { modifiers: next })
    if (removed.type === 'boolean') updateObject(removed.toolId, { visible: true })
  }

  function addModifier(mod: Modifier) {
    commit()
    updateObject(object.id, { modifiers: [...object.modifiers, mod] })
  }

  function patchModifier(index: number, patch: Partial<Modifier>) {
    const next = object.modifiers.map((m, i) => (i === index ? ({ ...m, ...patch } as Modifier) : m))
    updateObject(object.id, { modifiers: next })
  }

  const hasMirror = object.modifiers.some((m) => m.type === 'mirror')
  const hasArray = object.modifiers.some((m) => m.type === 'array')
  const hasBend = object.modifiers.some((m) => m.type === 'bend')
  const hasTwist = object.modifiers.some((m) => m.type === 'twist')
  const hasInflate = object.modifiers.some((m) => m.type === 'inflate')
  const hasFlatten = object.modifiers.some((m) => m.type === 'flatten')

  return (
    <Section title="Combine & Shape" defaultOpen={false}>
      <div className="flex flex-col gap-2 rounded-lg bg-ink-50 p-2.5">
        <p className="text-[11px] text-ink-500">Pick another object, then choose how they combine.</p>
        <select
          value={toolId}
          onChange={(e) => setToolId(e.target.value)}
          className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs"
        >
          <option value="">Choose an object…</option>
          {others.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-3 gap-1.5">
          {BOOLEAN_OPS.map((op) => (
            <button
              key={op.id}
              type="button"
              disabled={!toolId}
              onClick={() => applyBoolean(op.id)}
              className="flex flex-col items-center gap-1 rounded-lg border border-ink-200 bg-white py-2 text-[11px] font-medium text-ink-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-40"
            >
              <op.icon size={14} />
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <ModifierList
        object={object}
        onRemove={removeModifier}
        onPatch={patchModifier}
        onAdd={addModifier}
        commit={commit}
        flags={{ hasMirror, hasArray, hasBend, hasTwist, hasInflate, hasFlatten }}
      />
    </Section>
  )
}

function ModifierList({
  object,
  onRemove,
  onPatch,
  onAdd,
  commit,
  flags,
}: {
  object: SceneObject
  onRemove: (i: number) => void
  onPatch: (i: number, patch: Partial<Modifier>) => void
  onAdd: (m: Modifier) => void
  commit: () => void
  flags: Record<string, boolean>
}) {
  return (
    <div className="flex flex-col gap-2">
      {object.modifiers.map((mod, i) => (
        <div key={i} className="rounded-lg border border-ink-200 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold capitalize text-ink-700">
              {mod.type === 'boolean' ? `Boolean · ${mod.op}` : mod.type}
            </span>
            <button type="button" onClick={() => onRemove(i)} className="btn-icon h-5 w-5">
              <X size={12} />
            </button>
          </div>
          {mod.type === 'array' && (
            <div className="flex flex-col gap-2">
              <Slider label="Count" value={mod.count} min={1} max={20} step={1} onChange={(v) => onPatch(i, { count: v })} onCommit={commit} format={(v) => String(Math.round(v))} />
              <Slider label="Spacing" value={mod.spacing} min={0.1} max={3} onChange={(v) => onPatch(i, { spacing: v })} onCommit={commit} />
              <AxisPicker value={mod.axis} onChange={(axis) => onPatch(i, { axis })} />
            </div>
          )}
          {mod.type === 'mirror' && <AxisPicker value={mod.axis} onChange={(axis) => onPatch(i, { axis })} />}
          {mod.type === 'bend' && (
            <div className="flex flex-col gap-2">
              <Slider label="Angle" value={mod.angle} min={-180} max={180} step={1} onChange={(v) => onPatch(i, { angle: v })} onCommit={commit} format={(v) => `${Math.round(v)}°`} />
              <AxisPicker value={mod.axis} onChange={(axis) => onPatch(i, { axis })} options={['x', 'z']} />
            </div>
          )}
          {mod.type === 'twist' && (
            <Slider label="Angle" value={mod.angle} min={-360} max={360} step={1} onChange={(v) => onPatch(i, { angle: v })} onCommit={commit} format={(v) => `${Math.round(v)}°`} />
          )}
          {mod.type === 'inflate' && (
            <Slider label="Amount" value={mod.amount} min={-1} max={1} onChange={(v) => onPatch(i, { amount: v })} onCommit={commit} />
          )}
          {mod.type === 'flatten' && (
            <div className="flex flex-col gap-2">
              <Slider label="Amount" value={mod.amount} min={0} max={1} onChange={(v) => onPatch(i, { amount: v })} onCommit={commit} />
              <AxisPicker value={mod.axis} onChange={(axis) => onPatch(i, { axis })} />
            </div>
          )}
        </div>
      ))}

      <div className="grid grid-cols-3 gap-1.5">
        {!flags.hasMirror && (
          <AddButton label="Mirror" onClick={() => onAdd({ type: 'mirror', axis: 'x' })} />
        )}
        {!flags.hasArray && <AddButton label="Array" onClick={() => onAdd({ type: 'array', count: 5, spacing: 1.2, axis: 'x' })} />}
        {!flags.hasBend && <AddButton label="Bend" onClick={() => onAdd({ type: 'bend', angle: 45, axis: 'z' })} />}
        {!flags.hasTwist && <AddButton label="Twist" onClick={() => onAdd({ type: 'twist', angle: 90 })} />}
        {!flags.hasInflate && <AddButton label="Inflate" onClick={() => onAdd({ type: 'inflate', amount: 0.3 })} />}
        {!flags.hasFlatten && <AddButton label="Flatten" onClick={() => onAdd({ type: 'flatten', axis: 'y', amount: 0.5 })} />}
      </div>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-dashed border-ink-300 py-1.5 text-[11px] font-medium text-ink-500 hover:border-brand-400 hover:text-brand-600">
      + {label}
    </button>
  )
}

function AxisPicker({
  value,
  onChange,
  options = ['x', 'y', 'z'],
}: {
  value: 'x' | 'y' | 'z'
  onChange: (v: 'x' | 'y' | 'z') => void
  options?: ('x' | 'y' | 'z')[]
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((axis) => (
        <button
          key={axis}
          type="button"
          onClick={() => onChange(axis)}
          className={`flex-1 rounded-md py-1 text-[11px] font-semibold uppercase ${
            value === axis ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
          }`}
        >
          {axis}
        </button>
      ))}
    </div>
  )
}
