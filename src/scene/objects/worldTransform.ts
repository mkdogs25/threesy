import * as THREE from 'three'
import type { Vec3 } from '../../types/scene'
import { getObjectRef } from './objectRefs'

export interface LocalTransform {
  position: Vec3
  rotation: Vec3
  scale: Vec3
}

/** Computes the local position/rotation/scale an object would need under a
 * (possibly different) parent so its world-space transform is unchanged —
 * using the live Three.js scene graph's current world matrices. This is what
 * keeps objects visually in place when grouping, ungrouping, or dragging
 * them to a new parent in the hierarchy panel. Returns null if the relevant
 * Object3D refs aren't available yet (e.g. before first render). */
export function computeLocalTransformForNewParent(objectId: string, newParentId: string | null): LocalTransform | null {
  const objectRef = getObjectRef(objectId)
  if (!objectRef) return null

  objectRef.updateWorldMatrix(true, false)
  const worldMatrix = objectRef.matrixWorld.clone()

  const parentInverse = new THREE.Matrix4()
  if (newParentId) {
    const parentRef = getObjectRef(newParentId)
    if (!parentRef) return null
    parentRef.updateWorldMatrix(true, false)
    parentInverse.copy(parentRef.matrixWorld).invert()
  }

  const local = new THREE.Matrix4().multiplyMatrices(parentInverse, worldMatrix)
  const position = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  local.decompose(position, quaternion, scale)
  const euler = new THREE.Euler().setFromQuaternion(quaternion)

  return {
    position: [position.x, position.y, position.z],
    rotation: [THREE.MathUtils.radToDeg(euler.x), THREE.MathUtils.radToDeg(euler.y), THREE.MathUtils.radToDeg(euler.z)],
    scale: [scale.x, scale.y, scale.z],
  }
}
