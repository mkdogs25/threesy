// Data model for Threesy's UI Mockup mode — a lightweight 2D wireframing
// tool (screens, common UI elements, and flow connections between them),
// kept deliberately separate from the 3D scene model.

export type WireframeNodeType = 'frame' | 'rectangle' | 'text' | 'button' | 'input' | 'image' | 'circle'

export interface WireframeNode {
  id: string
  type: WireframeNodeType
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

export interface WireframeConnection {
  id: string
  fromId: string
  toId: string
  label?: string
}

export interface WireframeProject {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  nodes: WireframeNode[]
  connections: WireframeConnection[]
}

export const WIREFRAME_FILE_VERSION = 1

export interface WireframeFile {
  version: number
  project: WireframeProject
}
