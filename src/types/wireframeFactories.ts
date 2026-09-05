import { v4 as uuid } from 'uuid'
import type { WireframeNode, WireframeNodeType, WireframeProject } from './wireframe'

interface NodeDefaults {
  width: number
  height: number
  label: string
  color: string
}

const DEFAULTS_BY_TYPE: Record<WireframeNodeType, NodeDefaults> = {
  frame: { width: 375, height: 667, label: 'Screen', color: '#ffffff' },
  rectangle: { width: 160, height: 100, label: '', color: '#e7e9f0' },
  text: { width: 160, height: 28, label: 'Text', color: '#1a1d29' },
  button: { width: 140, height: 44, label: 'Button', color: '#4f46e5' },
  input: { width: 220, height: 44, label: 'Placeholder text', color: '#ffffff' },
  image: { width: 160, height: 120, label: 'Image', color: '#dfe2ea' },
  circle: { width: 64, height: 64, label: '', color: '#e7e9f0' },
}

export function createWireframeNode(type: WireframeNodeType, overrides: Partial<WireframeNode> = {}): WireframeNode {
  const defaults = DEFAULTS_BY_TYPE[type]
  return {
    id: uuid(),
    type,
    x: 80,
    y: 80,
    width: defaults.width,
    height: defaults.height,
    label: defaults.label,
    color: defaults.color,
    ...overrides,
  }
}

export function createEmptyWireframeProject(name = 'Untitled Mockup'): WireframeProject {
  const now = Date.now()
  return {
    id: uuid(),
    name,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    connections: [],
  }
}
