import type { AlignOption, ComponentNode, ComponentType } from '../../project/schema/types'
import { isContainerType } from '../../project/schema/componentDefs'

/** The single place that turns a ComponentNode's beginner-facing style
 * fields into real CSS. Both the editing canvas (as a React style object)
 * and the HTML/CSS exporter (as CSS text) read from the exact same
 * declarations produced here, so what you see in the builder is guaranteed
 * to match what gets exported. */
export type CssDeclarations = Record<string, string>

function mapAlign(align: AlignOption): string {
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

function sizeValue(value: ComponentNode['width']): string | undefined {
  if (value === 'auto') return undefined
  if (value === 'fill') return '100%'
  return `${value}px`
}

const POSITION_OVERRIDES: Partial<Record<ComponentType, CssDeclarations>> = {
  navbar: { position: 'sticky', top: '0', 'z-index': '30' },
  appBar: { position: 'sticky', top: '0', 'z-index': '30' },
  bottomNav: { position: 'sticky', bottom: '0', 'z-index': '30' },
  tabBar: { position: 'sticky', bottom: '0', 'z-index': '30' },
  fab: { position: 'absolute', right: '20px', bottom: '84px', 'z-index': '40' },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    'z-index': '100',
  },
}

export type ResponsiveTier = 'desktop' | 'tablet' | 'mobile'

export function computeCssDeclarations(node: ComponentNode, tier: ResponsiveTier = 'desktop'): CssDeclarations {
  const decl: CssDeclarations = {}
  const isContainer = isContainerType(node.type)

  if (isContainer) {
    decl.display = 'flex'
    decl['flex-direction'] = node.layout.direction
    decl.gap = `${node.layout.gap}px`
    decl['align-items'] = mapAlign(node.layout.align)
    decl['justify-content'] = mapAlign(node.layout.justify)
    if (node.layout.wrap) decl['flex-wrap'] = 'wrap'
  }

  const width = sizeValue(node.width)
  const height = sizeValue(node.height)
  if (width) decl.width = width
  if (height) decl.height = height

  if (node.style.background && node.style.background !== 'transparent') {
    decl['background-color'] = node.style.background
  }
  if (node.style.color) decl.color = node.style.color
  if (node.style.fontFamily) decl['font-family'] = node.style.fontFamily
  if (node.style.fontSize) decl['font-size'] = `${node.style.fontSize}px`
  if (node.style.fontWeight) decl['font-weight'] = String(node.style.fontWeight)
  if (node.style.textAlign) decl['text-align'] = node.style.textAlign
  if (node.style.padding) decl.padding = `${node.style.padding}px`
  if (node.style.margin) decl.margin = `${node.style.margin}px`
  if (node.style.borderRadius) decl['border-radius'] = `${node.style.borderRadius}px`
  if (node.style.shadow) decl['box-shadow'] = '0 4px 16px rgba(15,17,25,0.08)'
  if (node.style.borderWidth) {
    decl.border = `${node.style.borderWidth}px solid ${node.style.borderColor}`
  }
  if (node.style.opacity !== 1) decl.opacity = String(node.style.opacity)

  Object.assign(decl, POSITION_OVERRIDES[node.type] ?? {})

  if (node.type === 'button' || node.type === 'toggle' || node.type === 'fab') {
    decl.cursor = 'pointer'
    decl.border = decl.border ?? 'none'
  }
  if (node.type === 'image') decl['object-fit'] = 'cover'

  if (tier !== 'desktop') {
    const behavior = tier === 'tablet' ? node.responsive.tablet : node.responsive.mobile
    switch (behavior) {
      case 'stack':
        decl['flex-direction'] = 'column'
        break
      case 'wrap':
        decl['flex-wrap'] = 'wrap'
        break
      case 'hide':
        decl.display = 'none'
        break
      case 'resize':
        decl.width = '100%'
        if (node.style.fontSize) decl['font-size'] = `${Math.round(node.style.fontSize * 0.85)}px`
        break
      case 'fullWidth':
        decl.width = '100%'
        break
      default:
        break
    }
  }

  if (!node.visible) decl.display = 'none'

  return decl
}

function camelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function toReactStyle(decl: CssDeclarations): Record<string, string> {
  const style: Record<string, string> = {}
  for (const [key, value] of Object.entries(decl)) style[camelCase(key)] = value
  return style
}

export function toCssText(decl: CssDeclarations): string {
  return Object.entries(decl)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
}

const TAG_BY_TYPE: Partial<Record<ComponentType, string>> = {
  page: 'div',
  screen: 'div',
  heading: 'h2',
  text: 'p',
  button: 'button',
  input: 'input',
  image: 'img',
  divider: 'hr',
  list: 'ul',
  listItem: 'li',
  navbar: 'nav',
  footer: 'footer',
  section: 'section',
  form: 'form',
  mobileForm: 'form',
}

export function htmlTagFor(type: ComponentType): string {
  return TAG_BY_TYPE[type] ?? 'div'
}
