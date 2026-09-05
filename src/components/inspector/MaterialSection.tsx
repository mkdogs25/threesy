import { ImageOff, Upload } from 'lucide-react'
import { useRef } from 'react'
import type { SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { MATERIAL_PRESETS, applyPreset } from '../../scene/materials/presets'
import { Section } from '../common/Section'
import { Slider } from '../common/Slider'

const MAX_TEXTURE_BYTES = 6 * 1024 * 1024

export function MaterialSection({ object }: { object: SceneObject }) {
  const updateMaterial = useProjectStore((s) => s.updateMaterial)
  const commit = useProjectStore((s) => s.commit)
  const showError = useUIStore((s) => s.showError)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const material = object.material

  function choosePreset(id: (typeof MATERIAL_PRESETS)[number]['id']) {
    commit()
    updateMaterial(object.id, applyPreset(material, id))
  }

  function handleTextureFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError("Couldn't use this image", 'Please choose a PNG, JPG, or WebP file.')
      return
    }
    if (file.size > MAX_TEXTURE_BYTES) {
      showError("Couldn't use this image", 'That image is too large — try one under 6 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      commit()
      updateMaterial(object.id, { textureUrl: reader.result as string, preset: 'custom' })
    }
    reader.onerror = () => showError("Couldn't use this image", 'The file could not be read.')
    reader.readAsDataURL(file)
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

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-500">Texture</span>
        <div className="flex items-center gap-1.5">
          {material.textureUrl && (
            <>
              <img src={material.textureUrl} alt="" className="h-7 w-7 rounded border border-ink-200 object-cover" />
              <button
                type="button"
                title="Remove texture"
                onClick={() => {
                  commit()
                  updateMaterial(object.id, { textureUrl: undefined })
                }}
                className="btn-icon h-7 w-7"
              >
                <ImageOff size={14} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2 py-1.5 font-medium text-ink-600 hover:border-brand-400 hover:text-brand-600"
          >
            <Upload size={12} /> {material.textureUrl ? 'Replace' : 'Upload'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleTextureFile} className="hidden" />
        </div>
      </div>

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
