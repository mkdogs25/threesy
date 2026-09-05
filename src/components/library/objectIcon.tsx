import {
  Box,
  Circle,
  Cone,
  Cylinder,
  Disc,
  Donut,
  Folder,
  Heart,
  Layers,
  Square,
  Star,
  Triangle,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { ObjectKind } from '../../types/scene'

const ICONS: Partial<Record<ObjectKind, LucideIcon>> = {
  cube: Box,
  roundedCube: Box,
  roundedRect: Square,
  sphere: Circle,
  cylinder: Cylinder,
  cone: Cone,
  torus: Donut,
  capsule: Circle,
  plane: Square,
  ring: Disc,
  pyramid: Triangle,
  heart: Heart,
  star: Star,
  group: Folder,
  text: Type,
}

export function objectIcon(kind: ObjectKind): LucideIcon {
  return ICONS[kind] ?? Layers
}
