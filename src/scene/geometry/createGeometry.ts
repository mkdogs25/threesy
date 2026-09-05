import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ObjectKind, ShapeParams } from '../../types/scene'
import { createLibraryShapeGeometry, isLibraryShapeKind } from './libraryShapes'

/** Builds a Three.js geometry for a primitive/library shape from beginner-
 * friendly shape params. This is the single place that translates "corner
 * roundness" style controls into actual mesh data. */
export function createGeometry(kind: ObjectKind, shape: ShapeParams): THREE.BufferGeometry {
  switch (kind) {
    case 'cube': {
      const { width = 1, height = 1, depth = 1, roundness = 0 } = shape
      if (roundness > 0.001) {
        const radius = Math.min(width, height, depth) * 0.5 * Math.min(roundness, 0.98)
        return new RoundedBoxGeometry(width, height, depth, 4, radius)
      }
      return new THREE.BoxGeometry(width, height, depth)
    }
    case 'roundedCube': {
      const { width = 1, height = 1, depth = 1, roundness = 0.25 } = shape
      const radius = Math.min(width, height, depth) * 0.5 * Math.min(Math.max(roundness, 0.01), 0.98)
      return new RoundedBoxGeometry(width, height, depth, 5, radius)
    }
    case 'roundedRect': {
      const { width = 1.2, height = 0.8, depth = 0.2, roundness = 0.15 } = shape
      const radius = Math.min(width, height, depth) * 0.5 * Math.min(Math.max(roundness, 0.01), 0.98)
      return new RoundedBoxGeometry(width, height, depth, 5, radius)
    }
    case 'sphere': {
      const { radius = 0.6, segments = 32, flatten = 0, stretch = 1 } = shape
      const geo = new THREE.SphereGeometry(radius, segments, Math.max(8, segments / 2))
      geo.scale(1, 1 - Math.min(Math.max(flatten, -0.9), 0.9), 1)
      geo.scale(1, stretch, 1)
      return geo
    }
    case 'cylinder': {
      const { radius = 0.5, topRadius, bottomRadius, height = 1, segments = 32, roundness = 0 } = shape
      const geo = new THREE.CylinderGeometry(
        topRadius ?? radius,
        bottomRadius ?? radius,
        height,
        Math.max(8, segments),
        1,
        false,
      )
      if (roundness > 0.01) geo.computeVertexNormals()
      return geo
    }
    case 'cone': {
      const { radius = 0.5, height = 1, segments = 32 } = shape
      return new THREE.ConeGeometry(radius, height, Math.max(8, segments))
    }
    case 'torus': {
      const { radius = 0.5, tube = 0.18, segments = 32, arc = 1 } = shape
      return new THREE.TorusGeometry(radius, tube, Math.max(8, segments / 2), segments, Math.PI * 2 * arc)
    }
    case 'donut': {
      const { radius = 0.5, tube = 0.2, segments = 32 } = shape
      return new THREE.TorusGeometry(radius, tube, 16, segments)
    }
    case 'capsule': {
      const { radius = 0.35, height = 0.8, segments = 16 } = shape
      return new THREE.CapsuleGeometry(radius, height, Math.max(4, segments / 2), segments)
    }
    case 'plane': {
      const { width = 1.2, height = 1.2 } = shape
      return new THREE.PlaneGeometry(width, height)
    }
    case 'text': {
      const { width = 1.6, height = 0.5 } = shape
      return new THREE.PlaneGeometry(width, height)
    }
    case 'ring': {
      const { radius = 0.6, innerRadius = 0.3, segments = 32, arc = 1 } = shape
      return new THREE.RingGeometry(innerRadius, radius, segments, 1, 0, Math.PI * 2 * arc)
    }
    case 'pyramid': {
      const { width = 1, height = 1 } = shape
      return new THREE.ConeGeometry(width * 0.7, height, 4, 1, false, Math.PI / 4)
    }
    default: {
      if (isLibraryShapeKind(kind)) return createLibraryShapeGeometry(kind, shape)
      return new THREE.BoxGeometry(1, 1, 1)
    }
  }
}
