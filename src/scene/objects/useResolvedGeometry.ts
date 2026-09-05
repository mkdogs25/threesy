import * as THREE from 'three'
import { useMemo } from 'react'
import type { SceneObject } from '../../types/scene'
import { createGeometry } from '../geometry/createGeometry'
import { applyDeformModifiers } from '../geometry/applyModifiers'
import { combineGeometries } from '../geometry/boolean'

function localMatrix(obj: SceneObject): THREE.Matrix4 {
  const m = new THREE.Matrix4()
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(obj.rotation[0]),
    THREE.MathUtils.degToRad(obj.rotation[1]),
    THREE.MathUtils.degToRad(obj.rotation[2]),
  )
  m.compose(new THREE.Vector3(...obj.position), new THREE.Quaternion().setFromEuler(euler), new THREE.Vector3(...obj.scale))
  return m
}

/** Resolves an object's final render geometry: base shape -> deform modifiers
 * -> boolean modifiers (add/cut/intersect against other objects). Boolean
 * tool geometries are transformed into the base object's local space first. */
export function useResolvedGeometry(object: SceneObject, allObjects: SceneObject[]): THREE.BufferGeometry {
  return useMemo(() => {
    let geo = createGeometry(object.kind, object.shape)
    geo = applyDeformModifiers(geo, object.modifiers)

    const booleans = object.modifiers.filter((m) => m.type === 'boolean')
    if (booleans.length === 0) return geo

    const baseInverse = localMatrix(object).invert()

    for (const mod of booleans) {
      if (mod.type !== 'boolean') continue
      const tool = allObjects.find((o) => o.id === mod.toolId)
      if (!tool) continue
      let toolGeo = createGeometry(tool.kind, tool.shape)
      toolGeo = applyDeformModifiers(toolGeo, tool.modifiers)
      toolGeo = toolGeo.clone()
      const toolWorld = localMatrix(tool)
      const toToolLocalOfBase = new THREE.Matrix4().multiplyMatrices(baseInverse, toolWorld)
      toolGeo.applyMatrix4(toToolLocalOfBase)
      geo = combineGeometries(geo, toolGeo, mod.op)
    }
    return geo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    object.kind,
    JSON.stringify(object.shape),
    JSON.stringify(object.modifiers),
    object.position.join(','),
    object.rotation.join(','),
    object.scale.join(','),
    allObjects,
  ])
}
