import type { ComponentNode } from '../../project/schema/types'
import { isContainerType } from '../../project/schema/componentDefs'

/** React Native's StyleSheet uses unitless numbers instead of CSS's px
 * strings, but otherwise its flexbox model maps almost 1:1 onto our
 * ComponentStyle/ComponentLayout fields — this is a parallel, RN-flavoured
 * sibling of styleEngine's computeCssDeclarations rather than a reuse of it. */
export function computeRNStyle(node: ComponentNode): Record<string, string | number> {
  const style: Record<string, string | number> = {}
  if (isContainerType(node.type)) {
    style.display = 'flex'
    style.flexDirection = node.layout.direction
    style.alignItems = mapAlign(node.layout.align)
    style.justifyContent = mapAlign(node.layout.justify)
    if (node.layout.gap) style.gap = node.layout.gap
    if (node.layout.wrap) style.flexWrap = 'wrap'
  }
  if (typeof node.width === 'number') style.width = node.width
  else if (node.width === 'fill') style.width = '100%'
  if (typeof node.height === 'number') style.height = node.height
  else if (node.height === 'fill') style.height = '100%'

  if (node.style.background && node.style.background !== 'transparent') style.backgroundColor = node.style.background
  if (node.style.color) style.color = node.style.color
  if (node.style.fontSize) style.fontSize = node.style.fontSize
  if (node.style.fontWeight) style.fontWeight = String(node.style.fontWeight)
  if (node.style.textAlign) style.textAlign = node.style.textAlign
  if (node.style.padding) style.padding = node.style.padding
  if (node.style.margin) style.margin = node.style.margin
  if (node.style.borderRadius) style.borderRadius = node.style.borderRadius
  if (node.style.borderWidth) {
    style.borderWidth = node.style.borderWidth
    style.borderColor = node.style.borderColor
  }
  if (node.style.opacity !== 1) style.opacity = node.style.opacity
  if (node.style.shadow) {
    style.shadowColor = '#000'
    style.shadowOpacity = 0.12
    style.shadowRadius = 8
    style.shadowOffset = '{ width: 0, height: 4 }'
    style.elevation = 3
  }
  return style
}

function mapAlign(align: string): string {
  switch (align) {
    case 'start':
      return 'flex-start'
    case 'end':
      return 'flex-end'
    case 'space-between':
      return 'space-between'
    case 'stretch':
      return 'stretch'
    default:
      return 'center'
  }
}

/** Serializes a style object to JS source text. shadowOffset is special-
 * cased since it's the one nested-object value we emit. */
export function styleToSource(style: Record<string, string | number>): string {
  const entries = Object.entries(style).map(([key, value]) => {
    if (key === 'shadowOffset') return `    ${key}: ${value},`
    return `    ${key}: ${typeof value === 'number' ? value : JSON.stringify(value)},`
  })
  return `{\n${entries.join('\n')}\n  }`
}
