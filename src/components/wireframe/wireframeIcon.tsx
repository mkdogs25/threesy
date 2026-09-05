import { Circle, Image as ImageIcon, RectangleHorizontal, Smartphone, TextCursorInput, Type, type LucideIcon } from 'lucide-react'
import type { WireframeNodeType } from '../../types/wireframe'

const ICONS: Record<WireframeNodeType, LucideIcon> = {
  frame: Smartphone,
  rectangle: RectangleHorizontal,
  text: Type,
  button: RectangleHorizontal,
  input: TextCursorInput,
  image: ImageIcon,
  circle: Circle,
}

export function wireframeIcon(type: WireframeNodeType): LucideIcon {
  return ICONS[type]
}
