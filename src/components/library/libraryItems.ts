import type { ObjectKind } from '../../types/scene'

export interface LibraryItem {
  kind: ObjectKind
  label: string
  category: 'Shapes' | 'Icons' | 'Objects' | 'Nature' | 'Abstract'
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  // Shapes
  { kind: 'cube', label: 'Cube', category: 'Shapes' },
  { kind: 'roundedCube', label: 'Rounded Cube', category: 'Shapes' },
  { kind: 'sphere', label: 'Sphere', category: 'Shapes' },
  { kind: 'cylinder', label: 'Cylinder', category: 'Shapes' },
  { kind: 'cone', label: 'Cone', category: 'Shapes' },
  { kind: 'torus', label: 'Torus', category: 'Shapes' },
  { kind: 'capsule', label: 'Capsule', category: 'Shapes' },
  { kind: 'plane', label: 'Plane', category: 'Shapes' },
  { kind: 'ring', label: 'Ring', category: 'Shapes' },
  { kind: 'pyramid', label: 'Pyramid', category: 'Shapes' },
  { kind: 'roundedRect', label: 'Rounded Rectangle', category: 'Shapes' },

  // Icons
  { kind: 'heart', label: 'Heart', category: 'Icons' },
  { kind: 'star', label: 'Star', category: 'Icons' },
  { kind: 'arrow', label: 'Arrow', category: 'Icons' },
  { kind: 'cloud', label: 'Cloud', category: 'Icons' },
  { kind: 'lightning', label: 'Lightning', category: 'Icons' },
  { kind: 'check', label: 'Check Mark', category: 'Icons' },
  { kind: 'play', label: 'Play Button', category: 'Icons' },
  { kind: 'speechBubble', label: 'Speech Bubble', category: 'Icons' },

  // Objects
  { kind: 'chair', label: 'Chair', category: 'Objects' },
  { kind: 'table', label: 'Table', category: 'Objects' },
  { kind: 'lamp', label: 'Lamp', category: 'Objects' },
  { kind: 'sofa', label: 'Sofa', category: 'Objects' },
  { kind: 'bed', label: 'Bed', category: 'Objects' },
  { kind: 'phone', label: 'Phone', category: 'Objects' },
  { kind: 'laptop', label: 'Laptop', category: 'Objects' },
  { kind: 'camera', label: 'Camera', category: 'Objects' },

  // Nature
  { kind: 'tree', label: 'Tree', category: 'Nature' },
  { kind: 'rock', label: 'Rock', category: 'Nature' },
  { kind: 'plant', label: 'Plant', category: 'Nature' },
  { kind: 'cloud', label: 'Cloud', category: 'Nature' },

  // Abstract
  { kind: 'blob', label: 'Blob', category: 'Abstract' },
  { kind: 'spiral', label: 'Spiral', category: 'Abstract' },
  { kind: 'wave', label: 'Wave', category: 'Abstract' },
  { kind: 'crystal', label: 'Crystal', category: 'Abstract' },
  { kind: 'donut', label: 'Donut', category: 'Abstract' },
]

export const LIBRARY_CATEGORIES = ['Shapes', 'Icons', 'Objects', 'Nature', 'Abstract'] as const
