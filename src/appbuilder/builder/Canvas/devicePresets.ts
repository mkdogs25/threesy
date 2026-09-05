import type { AppTarget, DeviceViewport } from '../../project/schema/types'

export interface DevicePreset {
  id: DeviceViewport
  label: string
  width: number
  frame: 'browser' | 'phone'
}

export const WEB_PRESETS: DevicePreset[] = [
  { id: 'desktop', label: 'Desktop', width: 1280, frame: 'browser' },
  { id: 'laptop', label: 'Laptop', width: 1024, frame: 'browser' },
  { id: 'tablet', label: 'Tablet', width: 768, frame: 'browser' },
  { id: 'mobileBrowser', label: 'Mobile Browser', width: 390, frame: 'browser' },
]

export const PHONE_PRESETS: DevicePreset[] = [
  { id: 'smallPhone', label: 'Small Phone', width: 320, frame: 'phone' },
  { id: 'standardPhone', label: 'Standard Phone', width: 375, frame: 'phone' },
  { id: 'largePhone', label: 'Large Phone', width: 428, frame: 'phone' },
]

export function presetsFor(target: AppTarget): DevicePreset[] {
  return target === 'web' ? WEB_PRESETS : PHONE_PRESETS
}

export function findPreset(viewport: DeviceViewport): DevicePreset {
  return [...WEB_PRESETS, ...PHONE_PRESETS].find((p) => p.id === viewport) ?? WEB_PRESETS[0]
}

/** Which responsive tier a given viewport preset falls under, so the
 * builder can preview "tablet"/"mobile" responsive behaviors without the
 * user needing to know what a media query breakpoint is. */
export function tierFor(viewport: DeviceViewport): 'desktop' | 'tablet' | 'mobile' {
  const preset = findPreset(viewport)
  if (preset.width >= 1024) return 'desktop'
  if (preset.width >= 640) return 'tablet'
  return 'mobile'
}
