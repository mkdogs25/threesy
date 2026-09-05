import * as THREE from 'three'
import type { Modifier } from '../../types/scene'

/** Applies non-boolean, non-array "smart modelling" modifiers as vertex
 * displacements on a cloned geometry. Boolean and array/mirror modifiers are
 * handled at the object-rendering level since they involve multiple meshes. */
export function applyDeformModifiers(geometry: THREE.BufferGeometry, modifiers: Modifier[]): THREE.BufferGeometry {
  const deforms = modifiers.filter((m) => m.type === 'bend' || m.type === 'twist' || m.type === 'inflate' || m.type === 'flatten')
  if (deforms.length === 0) return geometry

  const geo = geometry.clone()
  geo.computeBoundingBox()
  const bbox = geo.boundingBox!
  const height = Math.max(bbox.max.y - bbox.min.y, 0.0001)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()

  for (const mod of deforms) {
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      if (mod.type === 'twist') {
        const t = (v.y - bbox.min.y) / height
        const angle = THREE.MathUtils.degToRad(mod.angle) * t
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const x = v.x * cos - v.z * sin
        const z = v.x * sin + v.z * cos
        v.x = x
        v.z = z
      } else if (mod.type === 'bend') {
        // Curve the shape along its height by rotating each height-slice
        // around a point behind the object, proportional to bend angle.
        const t = (v.y - bbox.min.y) / height - 0.5
        const totalAngle = THREE.MathUtils.degToRad(mod.angle)
        const angle = totalAngle * t
        const radius = height / (Math.abs(totalAngle) || 0.0001)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        if (mod.axis === 'z') {
          const y = v.y - (bbox.min.y + bbox.max.y) / 2
          const newX = v.x + radius * (1 - cos) * Math.sign(totalAngle)
          const newY = (bbox.min.y + bbox.max.y) / 2 + y * cos
          v.x = newX
          v.y = newY
        } else {
          const z = v.z
          const y = v.y - (bbox.min.y + bbox.max.y) / 2
          v.z = z * cos + radius * sin * Math.sign(totalAngle) * 0
          v.y = (bbox.min.y + bbox.max.y) / 2 + y * cos
          v.z = z + radius * (1 - cos) * Math.sign(totalAngle)
        }
      } else if (mod.type === 'inflate') {
        v.multiplyScalar(1 + mod.amount * 0.4)
      } else if (mod.type === 'flatten') {
        if (mod.axis === 'x') v.x *= 1 - mod.amount
        if (mod.axis === 'y') v.y *= 1 - mod.amount
        if (mod.axis === 'z') v.z *= 1 - mod.amount
      }
      pos.setXYZ(i, v.x, v.y, v.z)
    }
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}
