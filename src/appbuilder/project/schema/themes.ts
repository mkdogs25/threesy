import type { ComponentNode, ComponentStyle, ComponentType } from './types'

/** A project's design tokens. Presets are just starting points — every
 * field can be tweaked, which turns the preset into a "Custom" theme.
 * Colours are plain hex strings (not CSS variables) so the rest of the
 * app — styleEngine, the RN exporter, saved projects — never needs to
 * know theming exists; switching themes simply rewrites the literal
 * colour/radius values already baked into each component's style. */
export interface ProjectTheme {
  id: string
  name: string
  primary: string
  primaryText: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  /** Base corner radius in px. Components scale it by a per-type factor
   * (see RADIUS_MULTIPLIER) so a card, button, and popup stay visually
   * proportionate as the theme goes from sharp to very round. */
  radius: number
  /** CSS font-family stack, set once on each page/screen root and
   * inherited by everything inside it. Empty string = browser default. */
  fontFamily: string
}

export const PRESET_THEMES: ProjectTheme[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '#4f46e5',
    primaryText: '#ffffff',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#1a1d29',
    textMuted: '#545a72',
    border: '#dfe2ea',
    radius: 12,
    fontFamily: '',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#818cf8',
    primaryText: '#0b0d17',
    background: '#0b0d17',
    surface: '#161927',
    text: '#f4f5fb',
    textMuted: '#a3a8c3',
    border: '#2a2e45',
    radius: 12,
    fontFamily: '',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#f2542d',
    primaryText: '#ffffff',
    background: '#fff8f3',
    surface: '#ffffff',
    text: '#3a2418',
    textMuted: '#8a6a58',
    border: '#f2d9c9',
    radius: 18,
    fontFamily: '"Trebuchet MS", Verdana, sans-serif',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#0891b2',
    primaryText: '#ffffff',
    background: '#f0fbfd',
    surface: '#ffffff',
    text: '#0c2b33',
    textMuted: '#4f7c86',
    border: '#c9edf3',
    radius: 10,
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#15803d',
    primaryText: '#ffffff',
    background: '#f5faf5',
    surface: '#ffffff',
    text: '#12291a',
    textMuted: '#54705c',
    border: '#cfe6d4',
    radius: 8,
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  {
    id: 'mono',
    name: 'Mono',
    primary: '#18181b',
    primaryText: '#ffffff',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#18181b',
    textMuted: '#6b6b70',
    border: '#e4e4e7',
    radius: 4,
    fontFamily: '"Courier New", Consolas, monospace',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    primaryText: '#ffffff',
    background: '#fff5f7',
    surface: '#ffffff',
    text: '#3a0d18',
    textMuted: '#8a5566',
    border: '#f6d3dc',
    radius: 22,
    fontFamily: '',
  },
]

export const DEFAULT_THEME = PRESET_THEMES[0]

/** How much of the theme's base radius each rounded component type uses.
 * Chosen so the Indigo preset (radius 12) reproduces the exact pixel
 * values the app shipped with before theming existed. */
const RADIUS_MULTIPLIER: Partial<Record<ComponentType, number>> = {
  card: 1,
  button: 0.83,
  modal: 1.33,
  input: 0.67,
  image: 0.67,
}

export function radiusFor(theme: ProjectTheme, type: ComponentType): number | undefined {
  const mult = RADIUS_MULTIPLIER[type]
  return mult === undefined ? undefined : Math.round(theme.radius * mult)
}

/** The style fields a component type should track automatically. Anything
 * not listed here keeps whatever literal value the user (or a template)
 * gave it — theming only owns the slots it explicitly claims. */
export function themedStyleOverrides(theme: ProjectTheme, type: ComponentType): Partial<ComponentStyle> {
  const out: Partial<ComponentStyle> = {}
  switch (type) {
    case 'page':
    case 'screen':
      out.background = theme.background
      out.color = theme.text
      out.fontFamily = theme.fontFamily
      break
    case 'card':
    case 'modal':
    case 'navbar':
    case 'sidebar':
    case 'input':
      out.background = theme.surface
      out.borderColor = theme.border
      break
    case 'button':
    case 'fab':
    case 'appBar':
      out.background = theme.primary
      out.color = theme.primaryText
      break
    case 'footer':
      out.background = theme.text
      out.color = theme.background
      break
    case 'heading':
      out.color = theme.text
      break
    case 'text':
      out.color = theme.textMuted
      break
    case 'divider':
      out.background = theme.border
      break
  }
  const radius = radiusFor(theme, type)
  if (radius !== undefined) out.borderRadius = radius
  return out
}

/** The token values worth tracking for the retroactive "swap on theme
 * change" below — order matters where two tokens could coincidentally
 * match (primary text vs background, say); first match wins. */
function tokenPairs(theme: ProjectTheme): [string, keyof ProjectTheme][] {
  return [
    ['primary', 'primary'],
    ['primaryText', 'primaryText'],
    ['background', 'background'],
    ['surface', 'surface'],
    ['text', 'text'],
    ['textMuted', 'textMuted'],
    ['border', 'border'],
  ].map(([, key]) => [theme[key as keyof ProjectTheme] as string, key as keyof ProjectTheme])
}

/** When the project switches theme, any node whose colour/radius still
 * exactly matches the OLD theme's token is assumed to be "following the
 * theme" and gets updated to the new theme's equivalent token. A node
 * whose colour was hand-picked to something else is left untouched. This
 * is a value-matching heuristic, not a persistent per-node flag — simple,
 * and right in the overwhelming majority of real projects. */
export function retagThemedNodes(
  nodes: Record<string, ComponentNode>,
  oldTheme: ProjectTheme,
  newTheme: ProjectTheme,
): Record<string, ComponentNode> {
  const pairs = tokenPairs(oldTheme)
  function swapColor(value: string): string {
    if (value === 'transparent') return value
    const hit = pairs.find(([oldValue]) => oldValue === value)
    return hit ? (newTheme[hit[1]] as string) : value
  }

  const next: Record<string, ComponentNode> = {}
  for (const [id, node] of Object.entries(nodes)) {
    const oldRadius = radiusFor(oldTheme, node.type)
    const newRadius = radiusFor(newTheme, node.type)
    const radiusFollowsTheme = oldRadius !== undefined && node.style.borderRadius === oldRadius
    next[id] = {
      ...node,
      style: {
        ...node.style,
        background: swapColor(node.style.background),
        color: swapColor(node.style.color),
        borderColor: swapColor(node.style.borderColor),
        borderRadius: radiusFollowsTheme && newRadius !== undefined ? newRadius : node.style.borderRadius,
        fontFamily: node.style.fontFamily === oldTheme.fontFamily ? newTheme.fontFamily : node.style.fontFamily,
      },
    }
  }
  return next
}
