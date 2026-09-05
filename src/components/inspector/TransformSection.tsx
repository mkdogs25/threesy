import type { SceneObject, Vec3 } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { NumberField } from '../common/NumberField'
import { Section } from '../common/Section'

function Vec3Row({
  label,
  value,
  onChange,
  onCommit,
  step,
}: {
  label: string
  value: Vec3
  onChange: (v: Vec3) => void
  onCommit: () => void
  step?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-ink-500">{label}</span>
      <div className="grid grid-cols-3 gap-1.5">
        <NumberField label="X" value={value[0]} step={step} onChange={(v) => onChange([v, value[1], value[2]])} onCommit={onCommit} />
        <NumberField label="Y" value={value[1]} step={step} onChange={(v) => onChange([value[0], v, value[2]])} onCommit={onCommit} />
        <NumberField label="Z" value={value[2]} step={step} onChange={(v) => onChange([value[0], value[1], v])} onCommit={onCommit} />
      </div>
    </div>
  )
}

export function TransformSection({ object }: { object: SceneObject }) {
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)

  return (
    <Section title="Transform">
      <Vec3Row label="Position" value={object.position} onChange={(v) => updateObject(object.id, { position: v })} onCommit={commit} step={0.1} />
      <Vec3Row label="Rotation" value={object.rotation} onChange={(v) => updateObject(object.id, { rotation: v })} onCommit={commit} step={1} />
      <Vec3Row label="Scale" value={object.scale} onChange={(v) => updateObject(object.id, { scale: v })} onCommit={commit} step={0.1} />
    </Section>
  )
}
