import type { ObjectKind, SceneObject, ShapeParams } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { Section } from '../common/Section'
import { Slider } from '../common/Slider'

interface FieldDef {
  key: keyof ShapeParams
  label: string
  min: number
  max: number
  step?: number
}

const FIELDS_BY_KIND: Partial<Record<ObjectKind, FieldDef[]>> = {
  cube: [
    { key: 'width', label: 'Width', min: 0.1, max: 4 },
    { key: 'height', label: 'Height', min: 0.1, max: 4 },
    { key: 'depth', label: 'Depth', min: 0.1, max: 4 },
    { key: 'roundness', label: 'Corner Roundness', min: 0, max: 1 },
  ],
  roundedCube: [
    { key: 'width', label: 'Width', min: 0.1, max: 4 },
    { key: 'height', label: 'Height', min: 0.1, max: 4 },
    { key: 'depth', label: 'Depth', min: 0.1, max: 4 },
    { key: 'roundness', label: 'Corner Roundness', min: 0, max: 1 },
  ],
  roundedRect: [
    { key: 'width', label: 'Width', min: 0.1, max: 4 },
    { key: 'height', label: 'Height', min: 0.1, max: 4 },
    { key: 'depth', label: 'Depth', min: 0.02, max: 2 },
    { key: 'roundness', label: 'Roundness', min: 0, max: 1 },
  ],
  sphere: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2.5 },
    { key: 'flatten', label: 'Flatten', min: -0.9, max: 0.9 },
    { key: 'stretch', label: 'Stretch', min: 0.2, max: 3 },
  ],
  cylinder: [
    { key: 'height', label: 'Height', min: 0.1, max: 4 },
    { key: 'topRadius', label: 'Top Radius', min: 0, max: 2 },
    { key: 'bottomRadius', label: 'Bottom Radius', min: 0, max: 2 },
    { key: 'roundness', label: 'Roundness', min: 0, max: 1 },
  ],
  cone: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2 },
    { key: 'height', label: 'Height', min: 0.1, max: 4 },
  ],
  torus: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2 },
    { key: 'tube', label: 'Tube Thickness', min: 0.02, max: 0.8 },
    { key: 'arc', label: 'Arc', min: 0.1, max: 1 },
  ],
  capsule: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 1.2 },
    { key: 'height', label: 'Height', min: 0.1, max: 3 },
  ],
  plane: [
    { key: 'width', label: 'Width', min: 0.1, max: 6 },
    { key: 'height', label: 'Height', min: 0.1, max: 6 },
  ],
  ring: [
    { key: 'radius', label: 'Outer Radius', min: 0.1, max: 2 },
    { key: 'innerRadius', label: 'Inner Radius', min: 0.05, max: 1.9 },
    { key: 'arc', label: 'Arc', min: 0.1, max: 1 },
  ],
  pyramid: [
    { key: 'width', label: 'Width', min: 0.2, max: 3 },
    { key: 'height', label: 'Height', min: 0.2, max: 4 },
  ],
}

export function ShapeSection({ object }: { object: SceneObject }) {
  const updateShape = useProjectStore((s) => s.updateShape)
  const commit = useProjectStore((s) => s.commit)
  const fields = FIELDS_BY_KIND[object.kind]

  if (object.kind === 'text') {
    return (
      <Section title="Shape">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-ink-500">Text</span>
          <input
            type="text"
            value={object.shape.text ?? ''}
            onChange={(e) => updateShape(object.id, { text: e.target.value })}
            onBlur={commit}
            className="rounded-md border border-ink-200 px-2 py-1.5 text-sm"
          />
        </label>
        <Slider
          label="Size"
          value={object.shape.height ?? 0.6}
          min={0.15}
          max={2}
          onChange={(v) => updateShape(object.id, { height: v })}
          onCommit={commit}
        />
        <Slider
          label="Depth"
          value={object.shape.depth ?? 0.18}
          min={0.02}
          max={0.6}
          onChange={(v) => updateShape(object.id, { depth: v })}
          onCommit={commit}
        />
        <Slider
          label="Corner Roundness"
          value={object.shape.roundness ?? 0}
          min={0}
          max={1}
          onChange={(v) => updateShape(object.id, { roundness: v })}
          onCommit={commit}
        />
      </Section>
    )
  }

  if (!fields) return null

  return (
    <Section title="Shape">
      {fields.map((f) => (
        <Slider
          key={f.key}
          label={f.label}
          value={(object.shape[f.key] as number) ?? 0}
          min={f.min}
          max={f.max}
          step={f.step ?? (f.max - f.min > 3 ? 0.05 : 0.01)}
          onChange={(v) => updateShape(object.id, { [f.key]: v })}
          onCommit={commit}
        />
      ))}
    </Section>
  )
}
