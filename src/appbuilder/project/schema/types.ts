// Threesy App Builder — single structured project model. This is the one
// source of truth: the editing canvas, the live preview, the Code tab, and
// every exporter all read (and only read) this same tree. Nothing about a
// project's visual state should ever be duplicated into separate
// editor/preview/export representations.

export type AppTarget = 'web' | 'mobile'

/** Every component type that exists anywhere in the builder. Which ones are
 * offered in the palette for a given project is decided by
 * COMPONENT_DEFS[type].platforms, not by this union. */
export type ComponentType =
  // structural / shared
  | 'page' // web page root
  | 'screen' // mobile screen root
  | 'container'
  | 'row'
  | 'card'
  | 'modal'
  | 'list'
  | 'listItem'
  // shared content
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'input'
  | 'toggle'
  | 'icon'
  | 'divider'
  // web-only
  | 'navbar'
  | 'sidebar'
  | 'hero'
  | 'section'
  | 'table'
  | 'form'
  | 'footer'
  | 'tabs'
  // mobile-only
  | 'appBar'
  | 'bottomNav'
  | 'fab'
  | 'mobileForm'
  | 'tabBar'

export type FlexDirection = 'row' | 'column'
export type AlignOption = 'start' | 'center' | 'end' | 'stretch' | 'space-between'

export interface ComponentLayout {
  direction: FlexDirection
  gap: number
  align: AlignOption
  justify: AlignOption
  wrap: boolean
}

/** Beginner-facing style knobs. Every field maps to exactly one CSS (or RN
 * style) property so codegen never has to guess. */
export interface ComponentStyle {
  background: string
  color: string
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700
  textAlign: 'left' | 'center' | 'right'
  padding: number
  margin: number
  borderRadius: number
  shadow: boolean
  borderWidth: number
  borderColor: string
  opacity: number
}

export type ResponsiveBehavior = 'default' | 'stack' | 'wrap' | 'hide' | 'resize' | 'fullWidth' | 'keepPosition'

export interface ResponsiveSettings {
  tablet: ResponsiveBehavior
  mobile: ResponsiveBehavior
}

export type InteractionTrigger =
  | 'click'
  | 'pageOpened'
  | 'inputChanged'
  | 'toggleChanged'
  | 'formSubmitted'
  | 'itemSelected'

export type InteractionAction =
  | { type: 'navigate'; pageId: string }
  | { type: 'show'; targetId: string }
  | { type: 'hide'; targetId: string }
  | { type: 'changeText'; targetId: string; text: string }
  | { type: 'changeStyle'; targetId: string; style: Partial<ComponentStyle> }
  | { type: 'setValue'; targetId: string; value: string }
  | { type: 'openModal'; targetId: string }
  | { type: 'closeModal'; targetId: string }
  | { type: 'notify'; message: string }
  | { type: 'openUrl'; url: string }
  | { type: 'goBack' }

export interface InteractionBinding {
  id: string
  trigger: InteractionTrigger
  action: InteractionAction
}

export interface ComponentNode {
  id: string
  type: ComponentType
  name: string
  parentId: string | null
  children: string[]
  layout: ComponentLayout
  style: ComponentStyle
  responsive: ResponsiveSettings
  events: InteractionBinding[]
  visible: boolean
  locked: boolean
  // Content properties — which ones matter depends on `type`.
  text: string
  placeholder: string
  imageUrl: string
  href: string
  width: number | 'auto' | 'fill'
  height: number | 'auto' | 'fill'
  // Bottom nav / tab bar items: {label, icon, targetPageId}
  navItems: { id: string; label: string; icon: string; targetPageId: string | null }[]
}

/** A page (web) or screen (mobile) — a top-level ComponentNode of type
 * 'page'/'screen' referenced here for ordering + metadata. */
export interface AppPage {
  id: string
  name: string
  rootId: string
}

export type DeviceViewport = 'desktop' | 'laptop' | 'tablet' | 'mobileBrowser' | 'smallPhone' | 'standardPhone' | 'largePhone'

export interface AppBuilderProject {
  id: string
  name: string
  target: AppTarget
  createdAt: number
  updatedAt: number
  pages: AppPage[]
  activePageId: string
  nodes: Record<string, ComponentNode>
  viewport: DeviceViewport
  bottomNavId: string | null // mobile: id of the shared bottomNav component, if any
}

export const APPBUILDER_FILE_VERSION = 1

export interface AppBuilderFile {
  version: number
  project: AppBuilderProject
}
