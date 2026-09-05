import * as THREE from 'three'
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg'
import type { BooleanOp } from '../../types/scene'

const evaluator = new Evaluator()

const OP_MAP: Record<BooleanOp, number> = {
  add: ADDITION,
  cut: SUBTRACTION,
  intersect: INTERSECTION,
}

/** Combines two world-space-positioned geometries using CSG. Geometries must
 * already be transformed into the same local space (typically the base
 * object's local space) before calling this. */
export function combineGeometries(
  baseGeo: THREE.BufferGeometry,
  toolGeo: THREE.BufferGeometry,
  op: BooleanOp,
): THREE.BufferGeometry {
  const baseBrush = new Brush(baseGeo)
  baseBrush.updateMatrixWorld()
  const toolBrush = new Brush(toolGeo)
  toolBrush.updateMatrixWorld()
  const result = evaluator.evaluate(baseBrush, toolBrush, OP_MAP[op])
  return result.geometry
}
