import type { AnimationTrack, EasingId, Keyframe, Vec3 } from '../types/scene'

function ease(id: EasingId, t: number): number {
  switch (id) {
    case 'linear':
      return t
    case 'easeIn':
      return t * t
    case 'easeOut':
      return 1 - (1 - t) * (1 - t)
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    case 'bounce': {
      const n1 = 7.5625
      const d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
    default:
      return t
  }
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export interface KeyframeSample {
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
  opacity?: number
  color?: string
}

/** Samples a keyframe track at time t (seconds), returning interpolated
 * property values, or undefined for properties with no keyframes. */
export function sampleKeyframes(track: AnimationTrack, t: number): KeyframeSample {
  const kfs = [...track.keyframes].sort((a, b) => a.time - b.time)
  if (kfs.length === 0) return {}
  const time = track.loop ? t % Math.max(track.duration, 0.001) : Math.min(t, track.duration)

  if (time <= kfs[0].time) return pick(kfs[0])
  if (time >= kfs[kfs.length - 1].time) return pick(kfs[kfs.length - 1])

  let prev: Keyframe = kfs[0]
  let next: Keyframe = kfs[kfs.length - 1]
  for (let i = 0; i < kfs.length - 1; i++) {
    if (time >= kfs[i].time && time <= kfs[i + 1].time) {
      prev = kfs[i]
      next = kfs[i + 1]
      break
    }
  }
  const span = next.time - prev.time || 1
  const rawT = (time - prev.time) / span
  const t2 = ease(next.easing, rawT)

  const result: KeyframeSample = {}
  if (prev.position && next.position) result.position = lerpVec3(prev.position, next.position, t2)
  if (prev.rotation && next.rotation) result.rotation = lerpVec3(prev.rotation, next.rotation, t2)
  if (prev.scale && next.scale) result.scale = lerpVec3(prev.scale, next.scale, t2)
  if (prev.opacity !== undefined && next.opacity !== undefined)
    result.opacity = prev.opacity + (next.opacity - prev.opacity) * t2
  if (prev.color && next.color) result.color = t2 < 0.5 ? prev.color : next.color
  return result
}

function pick(k: Keyframe): KeyframeSample {
  return { position: k.position, rotation: k.rotation, scale: k.scale, opacity: k.opacity, color: k.color }
}
