import type { MaterialPresetId, MaterialSpec } from '../../types/scene'

export interface MaterialPresetDef {
  id: MaterialPresetId
  label: string
  values: Omit<MaterialSpec, 'preset' | 'color' | 'textureUrl'>
  swatch: string
}

export const MATERIAL_PRESETS: MaterialPresetDef[] = [
  {
    id: 'plastic',
    label: 'Plastic',
    swatch: '#6c8cff',
    values: { roughness: 0.45, metalness: 0.05, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'glass',
    label: 'Glass',
    swatch: '#bfe3ff',
    values: { roughness: 0.05, metalness: 0, opacity: 0.35, transparent: true, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'metal',
    label: 'Metal',
    swatch: '#b8bcc4',
    values: { roughness: 0.35, metalness: 0.9, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'chrome',
    label: 'Chrome',
    swatch: '#e8ecf1',
    values: { roughness: 0.05, metalness: 1, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'rubber',
    label: 'Rubber',
    swatch: '#3a3f47',
    values: { roughness: 0.95, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'wood',
    label: 'Wood',
    swatch: '#a9743c',
    values: { roughness: 0.75, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'paper',
    label: 'Paper',
    swatch: '#f4f1e8',
    values: { roughness: 0.9, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'ceramic',
    label: 'Ceramic',
    swatch: '#f2f4f7',
    values: { roughness: 0.25, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'neon',
    label: 'Neon',
    swatch: '#ff5ede',
    values: { roughness: 0.3, metalness: 0, opacity: 1, transparent: false, emissive: '#ff5ede', emissiveIntensity: 1.6 },
  },
  {
    id: 'matte',
    label: 'Matte',
    swatch: '#8a8f9a',
    values: { roughness: 1, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
  {
    id: 'glossy',
    label: 'Glossy',
    swatch: '#ff7a59',
    values: { roughness: 0.08, metalness: 0.1, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
  },
]

export function getPreset(id: MaterialPresetId): MaterialPresetDef | undefined {
  return MATERIAL_PRESETS.find((p) => p.id === id)
}

export function applyPreset(current: MaterialSpec, presetId: MaterialPresetId): MaterialSpec {
  const preset = getPreset(presetId)
  if (!preset) return { ...current, preset: 'custom' }
  return { ...current, ...preset.values, preset: presetId }
}
