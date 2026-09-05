import { v4 as uuid } from 'uuid'
import type {
  AnimationTrack,
  EnvironmentSettings,
  CameraSettings,
  MaterialSpec,
  ObjectKind,
  ProjectData,
  SceneObject,
  ShapeParams,
} from '../types/scene'

export function createDefaultMaterial(color = '#6c8cff'): MaterialSpec {
  return {
    preset: 'plastic',
    color,
    roughness: 0.45,
    metalness: 0.05,
    opacity: 1,
    transparent: false,
    emissive: '#000000',
    emissiveIntensity: 0,
  }
}

export function createDefaultAnimation(): AnimationTrack {
  return {
    duration: 4,
    loop: true,
    preset: 'none',
    keyframes: [],
  }
}

const DEFAULT_SHAPE_BY_KIND: Partial<Record<ObjectKind, ShapeParams>> = {
  cube: { width: 1, height: 1, depth: 1, roundness: 0, segments: 1 },
  roundedCube: { width: 1, height: 1, depth: 1, roundness: 0.25, segments: 6 },
  sphere: { radius: 0.6, flatten: 0, stretch: 1, segments: 32 },
  cylinder: { radius: 0.5, topRadius: 0.5, bottomRadius: 0.5, height: 1, roundness: 0, segments: 32 },
  cone: { radius: 0.5, height: 1, segments: 32 },
  torus: { radius: 0.5, tube: 0.18, segments: 32, arc: 1 },
  capsule: { radius: 0.35, height: 0.8, segments: 16 },
  plane: { width: 1.2, height: 1.2 },
  ring: { radius: 0.6, innerRadius: 0.3, segments: 32, arc: 1 },
  pyramid: { width: 1, height: 1, depth: 1, segments: 4 },
  roundedRect: { width: 1.2, height: 0.8, depth: 0.2, roundness: 0.15 },
  text: { width: 1.6, height: 0.5, text: 'Hello' },
}

export function defaultShapeFor(kind: ObjectKind): ShapeParams {
  return { ...(DEFAULT_SHAPE_BY_KIND[kind] ?? { width: 1, height: 1, depth: 1 }) }
}

const FRIENDLY_NAMES: Partial<Record<ObjectKind, string>> = {
  cube: 'Cube',
  roundedCube: 'Rounded Cube',
  sphere: 'Sphere',
  cylinder: 'Cylinder',
  cone: 'Cone',
  torus: 'Torus',
  capsule: 'Capsule',
  plane: 'Plane',
  ring: 'Ring',
  pyramid: 'Pyramid',
  roundedRect: 'Rounded Rectangle',
  group: 'Group',
  light: 'Light',
  camera: 'Camera',
  imported: 'Imported Model',
  text: 'Text',
}

export function friendlyName(kind: ObjectKind): string {
  return FRIENDLY_NAMES[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function createSceneObject(kind: ObjectKind, overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: uuid(),
    name: friendlyName(kind),
    kind,
    parentId: null,
    visible: true,
    locked: false,
    position: [0, kind === 'plane' ? 0 : 0.5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    shape: defaultShapeFor(kind),
    material: createDefaultMaterial(),
    modifiers: [],
    animation: createDefaultAnimation(),
    interactions: [],
    ...overrides,
  }
}

export function createDefaultEnvironment(): EnvironmentSettings {
  return {
    lightingPreset: 'studio',
    showGrid: true,
    showShadows: true,
    background: '#eef1f7',
    orthographic: false,
  }
}

export function createDefaultCamera(): CameraSettings {
  return {
    position: [4, 3.2, 5],
    target: [0, 0.4, 0],
    fov: 45,
  }
}

export function createEmptyProject(name = 'Untitled Project'): ProjectData {
  const now = Date.now()
  return {
    id: uuid(),
    name,
    createdAt: now,
    updatedAt: now,
    objects: [],
    environment: createDefaultEnvironment(),
    camera: createDefaultCamera(),
  }
}
