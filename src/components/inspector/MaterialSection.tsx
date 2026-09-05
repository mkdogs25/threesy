import type { SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { MATERIAL_PRESETS, applyPreset } from '../../scene/materials/presets'
import { Section } from '../common/Section'
import { Slider } from '../common/Slider'

export function MaterialSection({ object }: { object: SceneObject }) {
  const updateMaterial = useProjectStore((s) => s.updateMaterial)
  const commit = useProjectStore((s) => s.commit)
  const material = object.material

  function choosePreset(id: (typeof MATERIAL_PRESETS)[number]['id']) {
    commit()
    updateMaterial(object.id, applyPreset(material, id))
  }

  return (
    <Section title="Material">
      <div className="grid grid-cols-6 gap-1.5">
        {MATERIAL_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            onClick={() => choosePreset(p.id)}
            className={`aspect-square rounded-lg border-2 transition-transform hover:scale-105 ${
              material.preset === p.id ? 'border-brand-500' : 'border-transparent'
            }`}
            style={{ background: p.swatch }}
          />
        ))}
      </div>

      <label className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-500">Colour</span>
        <input
          type="color"
          value={material.color}
          onChange={(e) => updateMaterial(object.id, { color: e.target.value, preset: 'custom' })}
          onBlur={commit}
          className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent"
        />
      </label>

      <Slider
        label="Roughness"
        value={material.roughness}
        min={0}
        max={1}
        onChange={(v) => updateMaterial(object.id, { roughness: v, preset: 'custom' })}
        onCommit={commit}
      />
      <Slider
        label="Metallic"
        value={material.metalness}
        min={0}
        max={1}
        onChange={(v) => updateMaterial(object.id, { metalness: v, preset: 'custom' })}
        onCommit={commit}
      />
      <Slider
        label="Opacity"
        value={material.opacity}
        min={0}
        max={1}
        onChange={(v) => updateMaterial(object.id, { opacity: v, transparent: v < 1, preset: 'custom' })}
        onCommit={commit}
      />

      <label className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-500">Glow Colour</span>
        <input
          type="color"
          value={material.emissive}
          onChange={(e) => updateMaterial(object.id, { emissive: e.target.value, preset: 'custom' })}
          onBlur={commit}
          className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent"
        />
      </label>
      <Slider
        label="Glow Strength"
        value={material.emissiveIntensity}
        min={0}
        max={3}
        onChange={(v) => updateMaterial(object.id, { emissiveIntensity: v, preset: 'custom' })}
        onCommit={commit}
      />
    </Section>
  )
}
