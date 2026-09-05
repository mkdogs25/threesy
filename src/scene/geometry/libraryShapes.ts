import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { LibraryShapeKind, ObjectKind, ShapeParams } from '../../types/scene'

const ICON_KINDS = new Set<LibraryShapeKind>([
  'heart',
  'star',
  'arrow',
  'cloud',
  'lightning',
  'check',
  'play',
  'speechBubble',
])

const FURNITURE_KINDS = new Set<LibraryShapeKind>(['chair', 'table', 'lamp', 'sofa', 'bed', 'phone', 'laptop', 'camera'])

const NATURE_KINDS = new Set<LibraryShapeKind>(['tree', 'rock', 'plant'])
const ABSTRACT_KINDS = new Set<LibraryShapeKind>(['blob', 'spiral', 'wave', 'crystal', 'donut'])

export function isLibraryShapeKind(kind: ObjectKind): kind is LibraryShapeKind {
  return (
    ICON_KINDS.has(kind as LibraryShapeKind) ||
    FURNITURE_KINDS.has(kind as LibraryShapeKind) ||
    NATURE_KINDS.has(kind as LibraryShapeKind) ||
    ABSTRACT_KINDS.has(kind as LibraryShapeKind)
  )
}

function extrudeIcon(shape: THREE.Shape, depth: number, scale: number): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, steps: 1 })
  geo.center()
  geo.scale(scale, scale, 1)
  geo.rotateX(0)
  return geo
}

function heartShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, -1)
  s.bezierCurveTo(-1.2, -0.1, -1.1, 0.9, -0.4, 1.05)
  s.bezierCurveTo(-0.1, 1.15, 0, 0.9, 0, 0.7)
  s.bezierCurveTo(0, 0.9, 0.1, 1.15, 0.4, 1.05)
  s.bezierCurveTo(1.1, 0.9, 1.2, -0.1, 0, -1)
  return s
}

function starShape(points = 5, inner = 0.45): THREE.Shape {
  const s = new THREE.Shape()
  const step = Math.PI / points
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 1 : inner
    const a = i * step - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

function arrowShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-1, -0.3)
  s.lineTo(0.2, -0.3)
  s.lineTo(0.2, -0.7)
  s.lineTo(1, 0)
  s.lineTo(0.2, 0.7)
  s.lineTo(0.2, 0.3)
  s.lineTo(-1, 0.3)
  s.closePath()
  return s
}

function cloudShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.absarc(-0.55, -0.05, 0.45, Math.PI * 0.55, Math.PI * 1.5, false)
  s.absarc(-0.05, -0.35, 0.4, Math.PI, Math.PI * 2, false)
  s.absarc(0.5, -0.05, 0.4, Math.PI * 1.4, Math.PI * 0.5, false)
  s.absarc(0, 0.1, 0.55, Math.PI * 0.1, Math.PI * 0.9, false)
  s.closePath()
  return s
}

function lightningShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0.15, -1)
  s.lineTo(-0.55, 0.1)
  s.lineTo(-0.05, 0.1)
  s.lineTo(-0.15, 1)
  s.lineTo(0.55, -0.15)
  s.lineTo(0.05, -0.15)
  s.closePath()
  return s
}

function checkShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.9, 0)
  s.lineTo(-0.3, -0.6)
  s.lineTo(0.9, 0.7)
  s.lineTo(0.6, 1)
  s.lineTo(-0.3, 0.05)
  s.lineTo(-0.6, 0.35)
  s.closePath()
  return s
}

function playShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.6, -0.85)
  s.lineTo(0.8, 0)
  s.lineTo(-0.6, 0.85)
  s.closePath()
  return s
}

function speechBubbleShape(): THREE.Shape {
  const s = new THREE.Shape()
  const w = 1,
    h = 0.75,
    r = 0.2
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.quadraticCurveTo(w, -h, w, -h + r)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(-0.2, h)
  s.lineTo(-0.45, h + 0.4)
  s.lineTo(-0.35, h)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.lineTo(-w, -h + r)
  s.quadraticCurveTo(-w, -h, -w + r, -h)
  return s
}

const ICON_SHAPES: Record<string, () => THREE.Shape> = {
  heart: heartShape,
  star: () => starShape(5, 0.45),
  arrow: arrowShape,
  cloud: cloudShape,
  lightning: lightningShape,
  check: checkShape,
  play: playShape,
  speechBubble: speechBubbleShape,
}

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return g
}

function cyl(r: number, h: number, x: number, y: number, z: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, h, 12)
  g.translate(x, y, z)
  return g
}

function chairGeometry(): THREE.BufferGeometry {
  const parts = [
    box(0.9, 0.08, 0.9, 0, 0.5, 0), // seat
    box(0.9, 0.9, 0.08, 0, 1.0, -0.41), // back
    cyl(0.04, 0.5, -0.4, 0.25, -0.4),
    cyl(0.04, 0.5, 0.4, 0.25, -0.4),
    cyl(0.04, 0.5, -0.4, 0.25, 0.4),
    cyl(0.04, 0.5, 0.4, 0.25, 0.4),
  ]
  return mergeGeometries(parts, false)
}

function tableGeometry(): THREE.BufferGeometry {
  const parts = [
    box(1.4, 0.08, 0.9, 0, 0.75, 0),
    cyl(0.05, 0.75, -0.6, 0.375, -0.38),
    cyl(0.05, 0.75, 0.6, 0.375, -0.38),
    cyl(0.05, 0.75, -0.6, 0.375, 0.38),
    cyl(0.05, 0.75, 0.6, 0.375, 0.38),
  ]
  return mergeGeometries(parts, false)
}

function lampGeometry(): THREE.BufferGeometry {
  const base = cyl(0.28, 0.06, 0, 0.03, 0)
  const pole = cyl(0.03, 1, 0, 0.53, 0)
  const shadeGeo = new THREE.ConeGeometry(0.3, 0.4, 24, 1, true)
  shadeGeo.translate(0, 1.2, 0)
  return mergeGeometries([base, pole, shadeGeo], false)
}

function sofaGeometry(): THREE.BufferGeometry {
  const parts = [
    box(1.8, 0.4, 0.8, 0, 0.3, 0),
    box(1.8, 0.5, 0.2, 0, 0.65, -0.3),
    box(0.2, 0.5, 0.8, -0.9, 0.55, 0),
    box(0.2, 0.5, 0.8, 0.9, 0.55, 0),
  ]
  return mergeGeometries(parts, false)
}

function bedGeometry(): THREE.BufferGeometry {
  const parts = [box(1.6, 0.3, 2, 0, 0.25, 0), box(1.6, 0.4, 0.15, 0, 0.5, -0.9), box(1.6, 0.15, 2, 0, 0.42, 0)]
  return mergeGeometries(parts, false)
}

function phoneGeometry(): THREE.BufferGeometry {
  return RoundedBoxLike(0.5, 1, 0.06, 0.12)
}

function laptopGeometry(): THREE.BufferGeometry {
  const parts = [box(1, 0.05, 0.7, 0, 0, 0), box(1, 0.65, 0.04, 0, 0.33, -0.34)]
  return mergeGeometries(parts, false)
}

function cameraGeometry(): THREE.BufferGeometry {
  const parts = [box(0.8, 0.5, 0.4, 0, 0, 0), cyl(0.22, 0.25, 0, 0, 0.32)]
  return mergeGeometries(parts, false)
}

function RoundedBoxLike(w: number, h: number, d: number, _r: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w, h, d, 2, 2, 2)
}

function treeGeometry(): THREE.BufferGeometry {
  const trunk = cyl(0.09, 0.7, 0, 0.35, 0)
  const foliage1 = new THREE.ConeGeometry(0.5, 0.9, 8)
  foliage1.translate(0, 1.0, 0)
  const foliage2 = new THREE.ConeGeometry(0.38, 0.7, 8)
  foliage2.translate(0, 1.35, 0)
  return mergeGeometries([trunk, foliage1, foliage2], false)
}

function rockGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.5, 1)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const jitter = 0.85 + Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.3
    pos.setXYZ(i, pos.getX(i) * jitter, pos.getY(i) * jitter * 0.7, pos.getZ(i) * jitter)
  }
  geo.computeVertexNormals()
  return geo
}

function plantGeometry(): THREE.BufferGeometry {
  const pot = new THREE.CylinderGeometry(0.28, 0.22, 0.3, 16)
  pot.translate(0, 0.15, 0)
  const parts: THREE.BufferGeometry[] = [pot]
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const leaf = new THREE.ConeGeometry(0.08, 0.6, 6)
    leaf.translate(0, 0.3, 0)
    leaf.rotateZ(0.5)
    leaf.rotateY(a)
    leaf.translate(0, 0.3, 0)
    parts.push(leaf)
  }
  return mergeGeometries(parts, false)
}

function blobGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.55, 32, 32)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = Math.sin(v.x * 3) * Math.cos(v.y * 3) * Math.sin(v.z * 3)
    v.multiplyScalar(1 + n * 0.18)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function spiralGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const a = t * Math.PI * 6
    const r = 0.1 + t * 0.4
    points.push(new THREE.Vector3(Math.cos(a) * r, t * 1.2 - 0.6, Math.sin(a) * r))
  }
  const curve = new THREE.CatmullRomCurve3(points)
  return new THREE.TubeGeometry(curve, 120, 0.05, 8, false)
}

function waveGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1.4, 1.4, 32, 32)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, Math.sin(x * 4 + y * 2) * 0.12)
  }
  geo.computeVertexNormals()
  geo.rotateX(-Math.PI / 2)
  return geo
}

function crystalGeometry(): THREE.BufferGeometry {
  const top = new THREE.ConeGeometry(0.4, 0.5, 6)
  top.translate(0, 0.55, 0)
  const bottom = new THREE.ConeGeometry(0.4, 0.7, 6)
  bottom.rotateX(Math.PI)
  bottom.translate(0, -0.05, 0)
  return mergeGeometries([top, bottom], false)
}

export function createLibraryShapeGeometry(kind: LibraryShapeKind, shape: ShapeParams): THREE.BufferGeometry {
  if (ICON_KINDS.has(kind)) {
    const maker = ICON_SHAPES[kind]
    const geo = extrudeIcon(maker(), 0.22, 0.55)
    return geo
  }
  switch (kind) {
    case 'chair':
      return chairGeometry()
    case 'table':
      return tableGeometry()
    case 'lamp':
      return lampGeometry()
    case 'sofa':
      return sofaGeometry()
    case 'bed':
      return bedGeometry()
    case 'phone':
      return phoneGeometry()
    case 'laptop':
      return laptopGeometry()
    case 'camera':
      return cameraGeometry()
    case 'tree':
      return treeGeometry()
    case 'rock':
      return rockGeometry()
    case 'plant':
      return plantGeometry()
    case 'blob':
      return blobGeometry()
    case 'spiral':
      return spiralGeometry()
    case 'wave':
      return waveGeometry()
    case 'crystal':
      return crystalGeometry()
    case 'donut':
      return new THREE.TorusGeometry(shape.radius ?? 0.5, shape.tube ?? 0.2, 16, 32)
    default:
      return new THREE.BoxGeometry(1, 1, 1)
  }
}
