import { createEmptyProject, createSceneObject } from '../types/factories'
import type { ProjectData, SceneObject } from '../types/scene'

export interface TemplateDef {
  id: string
  name: string
  description: string
  accent: string
  build: () => ProjectData
}

function withObjects(name: string, lighting: ProjectData['environment']['lightingPreset'], objects: SceneObject[]): ProjectData {
  const project = createEmptyProject(name)
  project.objects = objects
  project.environment.lightingPreset = lighting
  return project
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'logo',
    name: '3D Logo',
    description: 'A bevelled, extruded mark on a soft stage.',
    accent: '#6c8cff',
    build: () =>
      withObjects('3D Logo', 'studio', [
        createSceneObject('roundedCube', {
          name: 'Mark',
          position: [0, 0.6, 0],
          shape: { width: 1.2, height: 1.2, depth: 0.4, roundness: 0.4 },
          material: { preset: 'glossy', color: '#6c8cff', roughness: 0.15, metalness: 0.2, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
        }),
        createSceneObject('plane', {
          name: 'Backdrop',
          position: [0, 0, -0.6],
          rotation: [90, 0, 0],
          scale: [4, 4, 1],
          material: { preset: 'matte', color: '#eef1f7', roughness: 1, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
        }),
      ]),
  },
  {
    id: 'product',
    name: 'Product Showcase',
    description: 'Hero object on a pedestal with studio light.',
    accent: '#4f46e5',
    build: () =>
      withObjects('Product Showcase', 'studio', [
        createSceneObject('cylinder', {
          name: 'Pedestal',
          position: [0, 0.15, 0],
          shape: { radius: 0.9, topRadius: 0.9, bottomRadius: 0.9, height: 0.3, segments: 48 },
          material: { preset: 'matte', color: '#dfe2ea', roughness: 0.9, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
        }),
        createSceneObject('capsule', {
          name: 'Product',
          position: [0, 0.9, 0],
          shape: { radius: 0.4, height: 0.7, segments: 24 },
          material: { preset: 'chrome', color: '#e8ecf1', roughness: 0.05, metalness: 1, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
        }),
      ]),
  },
  {
    id: 'abstract',
    name: 'Abstract Scene',
    description: 'Floating primitives with playful colour.',
    accent: '#ff5ede',
    build: () =>
      withObjects('Abstract Scene', 'neon', [
        createSceneObject('blob', { name: 'Blob', position: [-0.8, 1, 0], material: { preset: 'neon', color: '#ff5ede', roughness: 0.3, metalness: 0, opacity: 1, transparent: false, emissive: '#ff5ede', emissiveIntensity: 1.2 } }),
        createSceneObject('torus', { name: 'Torus', position: [0.9, 0.6, 0.3], material: { preset: 'glossy', color: '#5ef1ff', roughness: 0.1, metalness: 0.3, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('sphere', { name: 'Sphere', position: [0, 1.6, -0.6], shape: { radius: 0.3 }, material: { preset: 'glass', color: '#ffffff', roughness: 0.05, metalness: 0, opacity: 0.4, transparent: true, emissive: '#000000', emissiveIntensity: 0 } }),
      ]),
  },
  {
    id: 'poster',
    name: '3D Poster',
    description: 'A tall extruded panel with layered accents.',
    accent: '#ff7a59',
    build: () =>
      withObjects('3D Poster', 'soft', [
        createSceneObject('roundedRect', { name: 'Panel', position: [0, 1, 0], scale: [1.6, 2.2, 1], material: { preset: 'paper', color: '#fdfbf5', roughness: 0.85, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('star', { name: 'Star', position: [0, 1, 0.25], scale: [0.4, 0.4, 0.4], material: { preset: 'glossy', color: '#ff7a59', roughness: 0.1, metalness: 0.1, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
      ]),
  },
  {
    id: 'button',
    name: 'Interactive Button',
    description: 'A rounded button primed for a click animation.',
    accent: '#33c17a',
    build: () =>
      withObjects('Interactive Button', 'minimal', [
        createSceneObject('roundedRect', {
          name: 'Button',
          position: [0, 0.5, 0],
          scale: [1.4, 0.5, 1],
          material: { preset: 'plastic', color: '#33c17a', roughness: 0.35, metalness: 0.05, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 },
          interactions: [{ id: 'i1', trigger: 'click', action: { type: 'scale', amount: 0.9 } }],
        }),
      ]),
  },
  {
    id: 'background',
    name: 'Animated Background',
    description: 'Slowly floating shapes for a hero background.',
    accent: '#7d8bf8',
    build: () =>
      withObjects('Animated Background', 'daylight', [
        createSceneObject('sphere', { name: 'Float A', position: [-1.2, 1.2, -1], shape: { radius: 0.35 }, animation: { duration: 4, loop: true, preset: 'float', keyframes: [] } }),
        createSceneObject('roundedCube', { name: 'Float B', position: [1.1, 0.8, -0.5], shape: { width: 0.5, height: 0.5, depth: 0.5, roundness: 0.3 }, animation: { duration: 5, loop: true, preset: 'float', keyframes: [] } }),
        createSceneObject('torus', { name: 'Float C', position: [0.2, 1.7, -1.4], shape: { radius: 0.3, tube: 0.1 }, animation: { duration: 6, loop: true, preset: 'rotate', keyframes: [] } }),
      ]),
  },
  {
    id: 'room',
    name: 'Room',
    description: 'A minimal furnished corner room.',
    accent: '#a9743c',
    build: () =>
      withObjects('Room', 'soft', [
        createSceneObject('plane', { name: 'Floor', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [5, 5, 1] }),
        createSceneObject('table', { name: 'Table', position: [0, 0, 0] }),
        createSceneObject('chair', { name: 'Chair', position: [-0.9, 0, 0.9] }),
        createSceneObject('lamp', { name: 'Lamp', position: [1.2, 0, -0.8] }),
        createSceneObject('plant', { name: 'Plant', position: [-1.3, 0, -0.9] }),
      ]),
  },
  {
    id: 'landscape',
    name: 'Low-poly Landscape',
    description: 'Trees and rocks over a gentle plane.',
    accent: '#3f9142',
    build: () =>
      withObjects('Low-poly Landscape', 'daylight', [
        createSceneObject('plane', { name: 'Ground', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [6, 6, 1], material: { preset: 'matte', color: '#8fd17a', roughness: 1, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('tree', { name: 'Tree A', position: [-1.2, 0, -0.4] }),
        createSceneObject('tree', { name: 'Tree B', position: [0.8, 0, -1] }),
        createSceneObject('rock', { name: 'Rock', position: [0.4, 0, 0.8], scale: [0.6, 0.6, 0.6] }),
      ]),
  },
  {
    id: 'landing',
    name: 'App Landing Page',
    description: 'A device mock with floating accents.',
    accent: '#4638d6',
    build: () =>
      withObjects('App Landing Page', 'studio', [
        createSceneObject('phone', { name: 'Phone', position: [0, 0.9, 0], material: { preset: 'chrome', color: '#20222c', roughness: 0.2, metalness: 0.6, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('star', { name: 'Accent', position: [1, 1.4, 0.3], scale: [0.25, 0.25, 0.25], animation: { duration: 3, loop: true, preset: 'pulse', keyframes: [] } }),
        createSceneObject('heart', { name: 'Heart', position: [-0.9, 1.1, 0.2], scale: [0.2, 0.2, 0.2], material: { preset: 'neon', color: '#ff5ede', roughness: 0.3, metalness: 0, opacity: 1, transparent: false, emissive: '#ff5ede', emissiveIntensity: 1 } }),
      ]),
  },
  {
    id: 'game',
    name: 'Mini Game Scene',
    description: 'Playful blocks and a character stand-in.',
    accent: '#ffb703',
    build: () =>
      withObjects('Mini Game Scene', 'daylight', [
        createSceneObject('plane', { name: 'Ground', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [5, 5, 1] }),
        createSceneObject('roundedCube', { name: 'Block A', position: [-0.7, 0.4, 0], shape: { width: 0.8, height: 0.8, depth: 0.8, roundness: 0.2 }, material: { preset: 'plastic', color: '#ffb703', roughness: 0.4, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('capsule', { name: 'Character', position: [0.7, 0.6, 0], shape: { radius: 0.3, height: 0.5 }, material: { preset: 'plastic', color: '#ff5c5c', roughness: 0.4, metalness: 0, opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 } }),
        createSceneObject('star', { name: 'Coin', position: [0, 1.2, -0.8], scale: [0.2, 0.2, 0.2], animation: { duration: 2, loop: true, preset: 'rotate', keyframes: [] } }),
      ]),
  },
]

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
