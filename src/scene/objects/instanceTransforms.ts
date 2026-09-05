import type { Modifier, Vec3 } from '../../types/scene'

export interface InstanceTransform {
  position: Vec3
  scale: Vec3
}

const IDENTITY: InstanceTransform = { position: [0, 0, 0], scale: [1, 1, 1] }

/** Computes extra local-space instance transforms produced by array/mirror
 * modifiers, always including the identity (original) instance first. */
export function computeInstanceTransforms(modifiers: Modifier[]): InstanceTransform[] {
  let instances: InstanceTransform[] = [IDENTITY]

  for (const mod of modifiers) {
    if (mod.type === 'array') {
      const axis = mod.axis
      const next: InstanceTransform[] = []
      for (const inst of instances) {
        for (let i = 0; i < Math.max(1, mod.count); i++) {
          const offset = i * mod.spacing
          const pos: Vec3 = [...inst.position]
          if (axis === 'x') pos[0] += offset
          if (axis === 'y') pos[1] += offset
          if (axis === 'z') pos[2] += offset
          next.push({ position: pos, scale: inst.scale })
        }
      }
      instances = next
    } else if (mod.type === 'mirror') {
      const axis = mod.axis
      const next: InstanceTransform[] = []
      for (const inst of instances) {
        next.push(inst)
        const mirrored: InstanceTransform = {
          position: [...inst.position],
          scale: [...inst.scale],
        }
        if (axis === 'x') {
          mirrored.position[0] *= -1
          mirrored.scale[0] *= -1
        }
        if (axis === 'y') {
          mirrored.position[1] *= -1
          mirrored.scale[1] *= -1
        }
        if (axis === 'z') {
          mirrored.position[2] *= -1
          mirrored.scale[2] *= -1
        }
        next.push(mirrored)
      }
      instances = next
    }
  }

  return instances
}
