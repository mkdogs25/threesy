// Core scene data model for Threesy. Plain JSON-serialisable data — no Three.js
// instances live here, so it can be persisted directly into a .threesy file.

export type Vec3 = [number, number, number]

export type PrimitiveKind =
  | 'cube'
  | 'roundedCube'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'capsule'
  | 'plane'
  | 'ring'
  | 'pyramid'
  | 'roundedRect'

export type LibraryShapeKind =
  | 'heart'
  | 'star'
  | 'arrow'
  | 'cloud'
  | 'lightning'
  | 'check'
  | 'play'
  | 'speechBubble'
  | 'chair'
  | 'table'
  | 'lamp'
  | 'sofa'
  | 'bed'
  | 'phone'
  | 'laptop'
  | 'camera'
  | 'tree'
  | 'rock'
  | 'plant'
  | 'blob'
  | 'spiral'
  | 'wave'
  | 'crystal'
  | 'donut'
  | 'text'

export type ObjectKind = PrimitiveKind | LibraryShapeKind | 'group' | 'light' | 'camera' | 'imported'

/** Beginner-friendly shape parameters. Only the fields relevant to the object's
 * kind are used; unused fields are simply ignored by the geometry generator. */
export interface ShapeParams {
  width?: number
  height?: number
  depth?: number
  radius?: number
  topRadius?: number
  bottomRadius?: number
  roundness?: number // corner roundness / bevel amount, 0-1
  bevel?: number // 0-1
  flatten?: number // -1..1
  stretch?: number // 0.2..3
  segments?: number
  tube?: number // torus tube radius
  arc?: number // ring/torus arc 0..1 (of full circle)
  innerRadius?: number // ring
  text?: string
}

export type BooleanOp = 'add' | 'cut' | 'intersect'

export interface BooleanModifier {
  type: 'boolean'
  op: BooleanOp
  /** id of the object used as the tool (e.g. the cylinder cutting the cube) */
  toolId: string
}

export interface MirrorModifier {
  type: 'mirror'
  axis: 'x' | 'y' | 'z'
}

export interface ArrayModifier {
  type: 'array'
  count: number
  spacing: number
  axis: 'x' | 'y' | 'z'
}

export interface BendModifier {
  type: 'bend'
  angle: number // degrees
  axis: 'x' | 'y' | 'z'
}

export interface TwistModifier {
  type: 'twist'
  angle: number // degrees
}

export interface InflateModifier {
  type: 'inflate'
  amount: number // -1..1
}

export interface FlattenModifier {
  type: 'flatten'
  axis: 'x' | 'y' | 'z'
  amount: number // 0..1
}

export type Modifier =
  | BooleanModifier
  | MirrorModifier
  | ArrayModifier
  | BendModifier
  | TwistModifier
  | InflateModifier
  | FlattenModifier

export type MaterialPresetId =
  | 'plastic'
  | 'glass'
  | 'metal'
  | 'chrome'
  | 'rubber'
  | 'wood'
  | 'paper'
  | 'ceramic'
  | 'neon'
  | 'matte'
  | 'glossy'
  | 'custom'

export interface MaterialSpec {
  preset: MaterialPresetId
  color: string
  roughness: number
  metalness: number
  opacity: number
  transparent: boolean
  emissive: string
  emissiveIntensity: number
  textureUrl?: string
}

export type EasingId = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'

export interface Keyframe {
  id: string
  time: number // seconds
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
  opacity?: number
  color?: string
  easing: EasingId
}

export type AnimationPresetId =
  | 'float'
  | 'bounce'
  | 'rotate'
  | 'pulse'
  | 'shake'
  | 'slide'
  | 'fade'
  | 'spin'
  | 'wobble'
  | 'orbit'
  | 'none'

export interface AnimationTrack {
  duration: number // seconds
  loop: boolean
  preset: AnimationPresetId
  keyframes: Keyframe[]
}

export type InteractionTrigger = 'hover' | 'click' | 'mousedown' | 'mouseup' | 'scroll'
export type InteractionAction =
  | { type: 'rotate'; axis: 'x' | 'y' | 'z'; amount: number }
  | { type: 'move'; delta: Vec3 }
  | { type: 'scale'; amount: number }
  | { type: 'colorChange'; color: string }
  | { type: 'playAnimation' }
  | { type: 'openUrl'; url: string }

export interface Interaction {
  id: string
  trigger: InteractionTrigger
  action: InteractionAction
}

export interface SceneObject {
  id: string
  name: string
  kind: ObjectKind
  parentId: string | null
  visible: boolean
  locked: boolean
  position: Vec3
  rotation: Vec3 // degrees
  scale: Vec3
  shape: ShapeParams
  material: MaterialSpec
  modifiers: Modifier[]
  animation: AnimationTrack
  interactions: Interaction[]
  // For imported objects: reference to the original file stored as an asset.
  importedAssetId?: string
  importedFormat?: 'glb' | 'gltf' | 'obj' | 'stl' | 'svg' | 'image'
  // Light-specific
  lightType?: 'point' | 'area' | 'directional' | 'environment'
  lightColor?: string
  lightIntensity?: number
}

export type LightingPresetId =
  | 'studio'
  | 'soft'
  | 'sunset'
  | 'dramatic'
  | 'neon'
  | 'daylight'
  | 'night'
  | 'minimal'

export interface EnvironmentSettings {
  lightingPreset: LightingPresetId
  showGrid: boolean
  showShadows: boolean
  background: string
  orthographic: boolean
}

export interface CameraSettings {
  position: Vec3
  target: Vec3
  fov: number
}

export interface ProjectData {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  objects: SceneObject[]
  environment: EnvironmentSettings
  camera: CameraSettings
  thumbnail?: string
}

export const THREESY_FILE_VERSION = 1

export interface ThreesyFile {
  version: number
  project: ProjectData
  assets: Record<string, string> // assetId -> base64 data URL
}
