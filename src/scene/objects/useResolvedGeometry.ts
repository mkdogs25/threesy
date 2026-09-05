import * as THREE from 'three'
import { useMemo } from 'react'
import type { SceneObject } from '../../types/scene'
import { createGeometry } from '../geometry/createGeometry'
import { applyDeformModifiers } from '../geometry/applyModifiers'
import { combineGeometries } from '../geometry/boolean'
import { useTextGeometry3D } from '../geometry/useTextGeometry3D'

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

// A truly empty BufferGeometry has no position attribute, which crashes
// Three's bounding-sphere/shadow computations — use an imperceptibly small
// box instead so there's something valid to render for the frame or two
// while the text font is still loading.
const EMPTY_TEXT_PLACEHOLDER = new THREE.BoxGeometry(0.001, 0.001, 0.001)

/** Resolves an object's final render geometry: base shape -> deform modifiers
 * -> boolean modifiers (add/cut/intersect against other objects). Boolean
 * tool geometries are transformed into the base object's local space first.
 *
 * Text objects are real extruded 3D geometry (see useTextGeometry3D) rather
 * than a flat textured plane, built asynchronously once a bundled font
 * loads — so this returns an empty placeholder geometry for one or two
 * frames while that happens. */
export function useResolvedGeometry(object: SceneObject, allObjects: SceneObject[]): THREE.BufferGeometry {
  const textGeometry = useTextGeometry3D(
    object.shape.text ?? 'Text',
    object.shape.height ?? 0.6,
    object.shape.depth ?? 0.18,
    object.shape.roundness ?? 0,
  )

  return useMemo(() => {
    if (object.kind === 'text') return textGeometry ?? EMPTY_TEXT_PLACEHOLDER

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
    textGeometry,
    JSON.stringify(object.shape),
    JSON.stringify(object.modifiers),
    object.position.join(','),
    object.rotation.join(','),
    object.scale.join(','),
    allObjects,
  ])
}
