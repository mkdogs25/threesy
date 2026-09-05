import type { AppTarget, ComponentType } from './types'

export interface ComponentDef {
  type: ComponentType
  label: string
  platforms: AppTarget[]
  isContainer: boolean
  category: 'structure' | 'content' | 'navigation'
}

export const COMPONENT_DEFS: Record<ComponentType, ComponentDef> = {
  page: { type: 'page', label: 'Page', platforms: ['web'], isContainer: true, category: 'structure' },
  screen: { type: 'screen', label: 'Screen', platforms: ['mobile'], isContainer: true, category: 'structure' },
  container: { type: 'container', label: 'Container', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },
  row: { type: 'row', label: 'Row', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },
  card: { type: 'card', label: 'Card', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },
  modal: { type: 'modal', label: 'Modal', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },
  list: { type: 'list', label: 'List', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },
  listItem: { type: 'listItem', label: 'List Item', platforms: ['web', 'mobile'], isContainer: true, category: 'structure' },

  text: { type: 'text', label: 'Text', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  heading: { type: 'heading', label: 'Heading', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  button: { type: 'button', label: 'Button', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  image: { type: 'image', label: 'Image', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  input: { type: 'input', label: 'Input', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  toggle: { type: 'toggle', label: 'Toggle', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  icon: { type: 'icon', label: 'Icon', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },
  divider: { type: 'divider', label: 'Divider', platforms: ['web', 'mobile'], isContainer: false, category: 'content' },

  navbar: { type: 'navbar', label: 'Navbar', platforms: ['web'], isContainer: true, category: 'navigation' },
  sidebar: { type: 'sidebar', label: 'Sidebar', platforms: ['web'], isContainer: true, category: 'navigation' },
  hero: { type: 'hero', label: 'Hero', platforms: ['web'], isContainer: true, category: 'structure' },
  section: { type: 'section', label: 'Section', platforms: ['web'], isContainer: true, category: 'structure' },
  table: { type: 'table', label: 'Table', platforms: ['web'], isContainer: false, category: 'content' },
  form: { type: 'form', label: 'Form', platforms: ['web'], isContainer: true, category: 'structure' },
  footer: { type: 'footer', label: 'Footer', platforms: ['web'], isContainer: true, category: 'structure' },
  tabs: { type: 'tabs', label: 'Tabs', platforms: ['web'], isContainer: true, category: 'navigation' },

  appBar: { type: 'appBar', label: 'App Bar', platforms: ['mobile'], isContainer: true, category: 'navigation' },
  bottomNav: { type: 'bottomNav', label: 'Bottom Navigation', platforms: ['mobile'], isContainer: false, category: 'navigation' },
  fab: { type: 'fab', label: 'Floating Action Button', platforms: ['mobile'], isContainer: false, category: 'content' },
  mobileForm: { type: 'mobileForm', label: 'Form', platforms: ['mobile'], isContainer: true, category: 'structure' },
  tabBar: { type: 'tabBar', label: 'Tab Bar', platforms: ['mobile'], isContainer: false, category: 'navigation' },
}

export function paletteFor(target: AppTarget): ComponentDef[] {
  return Object.values(COMPONENT_DEFS).filter((d) => d.platforms.includes(target) && d.type !== 'page' && d.type !== 'screen')
}

export function isContainerType(type: ComponentType): boolean {
  return COMPONENT_DEFS[type].isContainer
}
