import type { AnimationPresetId, Vec3 } from '../types/scene'

export interface AnimatedTransform {
  positionDelta: Vec3
  rotationDelta: Vec3
  scaleMultiplier: Vec3
  opacityMultiplier: number
}

const IDENTITY: AnimatedTransform = {
  positionDelta: [0, 0, 0],
  rotationDelta: [0, 0, 0],
  scaleMultiplier: [1, 1, 1],
  opacityMultiplier: 1,
}

/** Evaluates a built-in animation preset at time t (seconds since scene
 * start) for an object with the given cycle duration. Returns deltas to be
 * added/multiplied onto the object's base transform. */
export function evaluateAnimationPreset(preset: AnimationPresetId, t: number, duration: number): AnimatedTransform {
  if (preset === 'none' || duration <= 0) return IDENTITY
  const cycle = (t % duration) / duration // 0..1
  const twoPi = Math.PI * 2

  switch (preset) {
    case 'float':
      return { ...IDENTITY, positionDelta: [0, Math.sin(cycle * twoPi) * 0.15, 0] }
    case 'bounce': {
      const b = Math.abs(Math.sin(cycle * Math.PI))
      return { ...IDENTITY, positionDelta: [0, b * 0.3, 0] }
    }
    case 'rotate':
      return { ...IDENTITY, rotationDelta: [0, cycle * 360, 0] }
    case 'pulse': {
      const s = 1 + Math.sin(cycle * twoPi) * 0.12
      return { ...IDENTITY, scaleMultiplier: [s, s, s] }
    }
    case 'shake':
      return { ...IDENTITY, positionDelta: [Math.sin(cycle * twoPi * 8) * 0.05, 0, 0] }
    case 'slide':
      return { ...IDENTITY, positionDelta: [Math.sin(cycle * twoPi) * 0.4, 0, 0] }
    case 'fade':
      return { ...IDENTITY, opacityMultiplier: 0.35 + Math.abs(Math.sin(cycle * Math.PI)) * 0.65 }
    default:
      return IDENTITY
  }
}
