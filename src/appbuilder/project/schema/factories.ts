import { v4 as uuid } from 'uuid'
import type {
  AppBuilderProject,
  AppPage,
  AppTarget,
  ComponentLayout,
  ComponentNode,
  ComponentStyle,
  ComponentType,
} from './types'
import { COMPONENT_DEFS, isContainerType } from './componentDefs'

export function defaultStyle(overrides: Partial<ComponentStyle> = {}): ComponentStyle {
  return {
    background: 'transparent',
    color: '#1a1d29',
    fontSize: 15,
    fontWeight: 400,
    textAlign: 'left',
    padding: 0,
    margin: 0,
    borderRadius: 0,
    shadow: false,
    borderWidth: 0,
    borderColor: '#dfe2ea',
    opacity: 1,
    ...overrides,
  }
}

function defaultLayout(overrides: Partial<ComponentLayout> = {}): ComponentLayout {
  return { direction: 'column', gap: 12, align: 'stretch', justify: 'start', wrap: false, ...overrides }
}

interface TypeDefaults {
  layout?: Partial<ComponentLayout>
  style?: Partial<ComponentStyle>
  text?: string
  placeholder?: string
  width?: ComponentNode['width']
  height?: ComponentNode['height']
}

const TYPE_DEFAULTS: Partial<Record<ComponentType, TypeDefaults>> = {
  page: { style: { background: '#ffffff' }, width: 'fill', height: 'auto' },
  screen: { style: { background: '#ffffff' }, width: 'fill', height: 'fill' },
  container: { style: { padding: 16 }, width: 'fill' },
  row: { layout: { direction: 'row', align: 'center' }, width: 'fill' },
  card: { style: { background: '#ffffff', padding: 16, borderRadius: 12, shadow: true, borderWidth: 1 }, width: 'fill' },
  modal: { style: { background: '#ffffff', padding: 20, borderRadius: 16, shadow: true }, width: 320, height: 'auto' },
  list: { layout: { gap: 8 }, width: 'fill' },
  listItem: { layout: { direction: 'row', align: 'center', gap: 12 }, style: { padding: 12 }, width: 'fill' },

  text: { text: 'Text', style: { color: '#545a72' } },
  heading: { text: 'Heading', style: { fontSize: 28, fontWeight: 700, color: '#1a1d29' } },
  button: { text: 'Button', style: { background: '#4f46e5', color: '#ffffff', padding: 12, borderRadius: 10, fontWeight: 600, textAlign: 'center' } },
  image: { style: { background: '#e7e9f0', borderRadius: 8 }, width: 240, height: 160 },
  input: { placeholder: 'Placeholder text', style: { background: '#ffffff', borderWidth: 1, padding: 12, borderRadius: 8 }, width: 'fill' },
  toggle: { width: 44, height: 24 },
  icon: { text: 'star', width: 24, height: 24 },
  divider: { style: { background: '#dfe2ea' }, width: 'fill', height: 1 },

  navbar: { layout: { direction: 'row', justify: 'space-between', align: 'center' }, style: { background: '#ffffff', padding: 16, shadow: true }, width: 'fill' },
  sidebar: { style: { background: '#f8f9fb', padding: 16 }, layout: { gap: 8 }, width: 220, height: 'fill' },
  hero: { style: { background: '#eef1ff', padding: 48 }, layout: { align: 'center', gap: 16 }, width: 'fill' },
  section: { style: { padding: 32 }, width: 'fill' },
  table: { width: 'fill' },
  form: { style: { padding: 16 }, layout: { gap: 12 }, width: 'fill' },
  footer: { style: { background: '#1a1d29', color: '#ffffff', padding: 24 }, width: 'fill' },
  tabs: { layout: { direction: 'row', gap: 4 }, width: 'fill' },

  appBar: { layout: { direction: 'row', align: 'center', justify: 'space-between' }, style: { background: '#4f46e5', color: '#ffffff', padding: 16 }, width: 'fill' },
  bottomNav: { width: 'fill', height: 60 },
  fab: { text: '+', style: { background: '#4f46e5', color: '#ffffff', borderRadius: 28, textAlign: 'center', fontSize: 22, shadow: true }, width: 56, height: 56 },
  mobileForm: { style: { padding: 16 }, layout: { gap: 12 }, width: 'fill' },
  tabBar: { width: 'fill', height: 44 },
}

const FRIENDLY_COUNTER: Record<string, number> = {}

function friendlyName(type: ComponentType): string {
  FRIENDLY_COUNTER[type] = (FRIENDLY_COUNTER[type] ?? 0) + 1
  const label = COMPONENT_DEFS[type]?.label ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
  return FRIENDLY_COUNTER[type] === 1 ? label : `${label} ${FRIENDLY_COUNTER[type]}`
}

export function createComponentNode(type: ComponentType, overrides: Partial<ComponentNode> = {}): ComponentNode {
  const defaults = TYPE_DEFAULTS[type] ?? {}
  return {
    id: uuid(),
    type,
    name: friendlyName(type),
    parentId: null,
    children: [],
    layout: defaultLayout(defaults.layout),
    style: defaultStyle(defaults.style),
    responsive: { tablet: 'default', mobile: 'default' },
    events: [],
    visible: true,
    locked: false,
    text: defaults.text ?? '',
    placeholder: defaults.placeholder ?? '',
    imageUrl: '',
    href: '',
    width: defaults.width ?? 'auto',
    height: defaults.height ?? 'auto',
    navItems: [],
    ...overrides,
  }
}

/** Creates a page/screen root node plus its AppPage entry, without wiring
 * it into a project's `nodes`/`pages` yet (caller does that). */
export function createPage(target: AppTarget, name: string): { page: AppPage; root: ComponentNode } {
  const root = createComponentNode(target === 'web' ? 'page' : 'screen', { name })
  return { page: { id: uuid(), name, rootId: root.id }, root }
}

export function createEmptyProject(target: AppTarget, name = target === 'web' ? 'Untitled Web App' : 'Untitled Phone App'): AppBuilderProject {
  const { page, root } = createPage(target, target === 'web' ? 'Home' : 'Home')
  const now = Date.now()
  return {
    id: uuid(),
    name,
    target,
    createdAt: now,
    updatedAt: now,
    pages: [page],
    activePageId: page.id,
    nodes: { [root.id]: root },
    viewport: target === 'web' ? 'desktop' : 'standardPhone',
    bottomNavId: null,
  }
}

export { isContainerType }
