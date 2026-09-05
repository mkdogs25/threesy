import type { LightingPresetId } from '../../types/scene'

export interface LightDef {
  type: 'directional' | 'ambient' | 'point'
  position?: [number, number, number]
  color: string
  intensity: number
}

export interface LightingPresetDef {
  id: LightingPresetId
  label: string
  background: string
  environmentPreset: 'city' | 'sunset' | 'dawn' | 'night' | 'studio' | 'warehouse' | 'apartment' | 'park'
  environmentIntensity: number
  lights: LightDef[]
}

export const LIGHTING_PRESETS: LightingPresetDef[] = [
  {
    id: 'studio',
    label: 'Studio',
    background: '#eef1f7',
    environmentPreset: 'studio',
    environmentIntensity: 0.6,
    lights: [
      { type: 'directional', position: [4, 6, 4], color: '#ffffff', intensity: 1.4 },
      { type: 'ambient', color: '#ffffff', intensity: 0.5 },
    ],
  },
  {
    id: 'soft',
    label: 'Soft',
    background: '#f4f2ee',
    environmentPreset: 'apartment',
    environmentIntensity: 0.7,
    lights: [
      { type: 'directional', position: [3, 5, 2], color: '#fff6ea', intensity: 0.9 },
      { type: 'ambient', color: '#ffffff', intensity: 0.7 },
    ],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    background: '#f6d2b0',
    environmentPreset: 'sunset',
    environmentIntensity: 0.9,
    lights: [
      { type: 'directional', position: [-5, 2, 3], color: '#ff9a5c', intensity: 1.6 },
      { type: 'ambient', color: '#ffb787', intensity: 0.35 },
    ],
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    background: '#15161c',
    environmentPreset: 'night',
    environmentIntensity: 0.4,
    lights: [
      { type: 'directional', position: [6, 3, -2], color: '#ffffff', intensity: 2.2 },
      { type: 'ambient', color: '#2a2f45', intensity: 0.25 },
    ],
  },
  {
    id: 'neon',
    label: 'Neon',
    background: '#0c0a1a',
    environmentPreset: 'night',
    environmentIntensity: 0.5,
    lights: [
      { type: 'point', position: [3, 3, 3], color: '#ff5ede', intensity: 2 },
      { type: 'point', position: [-3, 2, -3], color: '#5ef1ff', intensity: 2 },
      { type: 'ambient', color: '#1a1030', intensity: 0.3 },
    ],
  },
  {
    id: 'daylight',
    label: 'Daylight',
    background: '#cfe8ff',
    environmentPreset: 'park',
    environmentIntensity: 0.8,
    lights: [
      { type: 'directional', position: [5, 8, 3], color: '#ffffff', intensity: 1.8 },
      { type: 'ambient', color: '#dceeff', intensity: 0.6 },
    ],
  },
  {
    id: 'night',
    label: 'Night',
    background: '#0a0e1c',
    environmentPreset: 'night',
    environmentIntensity: 0.3,
    lights: [
      { type: 'directional', position: [-2, 4, -3], color: '#8fa8ff', intensity: 0.6 },
      { type: 'ambient', color: '#141a33', intensity: 0.3 },
    ],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    background: '#ffffff',
    environmentPreset: 'studio',
    environmentIntensity: 0.3,
    lights: [
      { type: 'directional', position: [2, 5, 2], color: '#ffffff', intensity: 1.1 },
      { type: 'ambient', color: '#ffffff', intensity: 0.8 },
    ],
  },
]

export function getLightingPreset(id: LightingPresetId): LightingPresetDef {
  return LIGHTING_PRESETS.find((p) => p.id === id) ?? LIGHTING_PRESETS[0]
}
