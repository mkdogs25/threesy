import type {
  AlignOption,
  AppBuilderProject,
  AppTarget,
  ComponentLayout,
  ComponentNode,
  ComponentStyle,
  ComponentType,
} from '../project/schema/types'
import { createComponentNode, createEmptyProject, createPage, defaultLayout, defaultStyle } from '../project/schema/factories'
import { DEFAULT_THEME, themedStyleOverrides, type ProjectTheme } from '../project/schema/themes'

/** One HTML file from the upload — becomes one page/screen in the
 * project. `name` is the filename (minus extension), used to name the
 * page; `index` sorts first so it lands as the project's home page. */
export interface UploadedHtmlFile {
  name: string
  html: string
}

const SKIP_TAGS = new Set(['script', 'style', 'link', 'meta', 'noscript', 'template', 'svg', 'br', 'source', 'iframe'])

const TAG_TYPE: Partial<Record<string, ComponentType>> = {
  button: 'button',
  a: 'button',
  img: 'image',
  input: 'input',
  textarea: 'input',
  hr: 'divider',
  nav: 'navbar',
  footer: 'footer',
  form: 'form',
  ul: 'list',
  ol: 'list',
  li: 'listItem',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  p: 'text',
  span: 'text',
  label: 'text',
  section: 'section',
}

const LEAF_TYPES = new Set<ComponentType>(['text', 'heading', 'button', 'image', 'input', 'divider'])

function mapTagToType(el: Element): ComponentType {
  const tag = el.tagName.toLowerCase()
  const known = TAG_TYPE[tag]
  if (known) return known
  return el.children.length > 0 ? 'container' : 'text'
}

function rgbToHex(value: string): string | null {
  const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/)
  if (!m) return null
  const [, r, g, b, a] = m
  if (a !== undefined && parseFloat(a) === 0) return 'transparent'
  const hex = (n: string) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function normalizeFontWeight(value: string): ComponentStyle['fontWeight'] {
  const n = parseInt(value, 10) || 400
  if (n >= 700) return 700
  if (n >= 600) return 600
  if (n >= 500) return 500
  return 400
}

function normalizeTextAlign(value: string): ComponentStyle['textAlign'] {
  if (value === 'center') return 'center'
  if (value === 'right' || value === 'end') return 'right'
  return 'left'
}

function mapFlexAlign(value: string): AlignOption {
  switch (value) {
    case 'flex-start':
    case 'start':
      return 'start'
    case 'flex-end':
    case 'end':
      return 'end'
    case 'space-between':
    case 'space-around':
    case 'space-evenly':
      return 'space-between'
    case 'stretch':
      return 'stretch'
    default:
      return 'center'
  }
}

function extractStyle(computed: CSSStyleDeclaration): Partial<ComponentStyle> {
  const style: Partial<ComponentStyle> = {}

  const bg = rgbToHex(computed.backgroundColor)
  if (bg) style.background = bg
  const color = rgbToHex(computed.color)
  if (color) style.color = color

  const fontSize = parseFloat(computed.fontSize)
  if (fontSize) style.fontSize = Math.round(fontSize)
  style.fontWeight = normalizeFontWeight(computed.fontWeight)
  style.textAlign = normalizeTextAlign(computed.textAlign)

  const pad = [computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft].map((v) => parseFloat(v) || 0)
  style.padding = Math.round(Math.max(...pad))
  const margin = [computed.marginTop, computed.marginRight, computed.marginBottom, computed.marginLeft].map((v) => parseFloat(v) || 0)
  style.margin = Math.round(Math.max(...margin))

  const radius = parseFloat(computed.borderTopLeftRadius)
  if (radius) style.borderRadius = Math.round(radius)
  style.shadow = computed.boxShadow !== 'none' && computed.boxShadow !== ''

  const borderWidth = parseFloat(computed.borderTopWidth)
  if (computed.borderTopStyle !== 'none' && borderWidth > 0) {
    style.borderWidth = Math.round(borderWidth)
    style.borderColor = rgbToHex(computed.borderTopColor) ?? '#dfe2ea'
  }

  const opacity = parseFloat(computed.opacity)
  if (!Number.isNaN(opacity)) style.opacity = opacity

  return style
}

function extractLayout(computed: CSSStyleDeclaration): Partial<ComponentLayout> {
  const isFlex = computed.display.includes('flex')
  const layout: Partial<ComponentLayout> = {
    direction: isFlex && computed.flexDirection.startsWith('row') ? 'row' : 'column',
    align: isFlex ? mapFlexAlign(computed.alignItems) : 'stretch',
    justify: isFlex ? mapFlexAlign(computed.justifyContent) : 'start',
    wrap: computed.flexWrap === 'wrap',
  }
  const gap = parseFloat(computed.gap || computed.rowGap)
  if (gap) layout.gap = Math.round(gap)
  return layout
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** A flex child styled `width: 100%` in the stylesheet still gets shrunk by
 * the browser to fit alongside its siblings — so a fill-width row/column
 * item can render narrower than its parent, making the "rendered width
 * equals parent width" check below blind to it (this is exactly what
 * happens re-importing this app's own exports: a nav's CTA button wrapper
 * is `width: fill` but sits right next to a heading, not spanning the
 * whole nav). Falls back to a literal text search over the declared CSS
 * for this element's own inline style or class rules — not a real
 * selector engine, but enough to recover the common case. */
function declaresPercentWidth(el: Element, css: string, prop: 'width' | 'height'): boolean {
  const inline = (el as HTMLElement).style?.getPropertyValue(prop)
  if (inline && inline.trim() === '100%') return true
  for (const cls of Array.from(el.classList)) {
    const re = new RegExp(`\\.${escapeForRegExp(cls)}[^{]*\\{[^}]*\\b${prop}\\s*:\\s*100%`, 'i')
    if (re.test(css)) return true
  }
  return false
}

function widthOf(el: Element, css: string): number | 'auto' | 'fill' {
  const rect = el.getBoundingClientRect()
  const parentRect = el.parentElement?.getBoundingClientRect()
  if (parentRect && parentRect.width > 0 && rect.width >= parentRect.width - 2) return 'fill'
  if (declaresPercentWidth(el, css, 'width')) return 'fill'
  return 'auto'
}

const MAX_IMPORTED_NODES = 600

interface WalkState {
  count: number
  theme: ProjectTheme
  css: string
}

function buildNode(el: Element, parentId: string, state: WalkState, nodes: Record<string, ComponentNode>): string | null {
  if (state.count >= MAX_IMPORTED_NODES) return null
  const tag = el.tagName.toLowerCase()
  if (SKIP_TAGS.has(tag)) return null
  if (tag === 'input' && el.getAttribute('type') === 'hidden') return null

  const type = mapTagToType(el)
  const computed = el.ownerDocument.defaultView!.getComputedStyle(el)
  if (computed.display === 'none') return null

  const isLeaf = LEAF_TYPES.has(type)
  const style = { ...defaultStyle(themedStyleOverrides(state.theme, type)), ...extractStyle(computed) }

  // Built as a plain object with keys only added when relevant — a key
  // present with value `undefined` would still overwrite createComponentNode's
  // real default (e.g. height:'auto') with `undefined`, since object spread
  // copies own keys regardless of their value.
  const overrides: Partial<ComponentNode> = { parentId, style, width: type === 'image' ? Math.round(el.getBoundingClientRect().width) || 240 : widthOf(el, state.css) }
  if (!isLeaf) overrides.layout = { ...defaultLayout(), ...extractLayout(computed) }
  if (type === 'image') overrides.height = Math.round(el.getBoundingClientRect().height) || 160
  if (isLeaf && type !== 'image' && type !== 'input') overrides.text = (el.textContent ?? '').trim().slice(0, 300)
  if (tag === 'input' || tag === 'textarea') overrides.placeholder = el.getAttribute('placeholder') ?? ''
  if (tag === 'img') overrides.imageUrl = el.getAttribute('src') ?? ''
  if (tag === 'a') overrides.href = el.getAttribute('href') ?? ''

  const node = createComponentNode(type, overrides, state.theme)
  state.count++
  nodes[node.id] = node

  if (!isLeaf) {
    const childIds: string[] = []
    for (const child of Array.from(el.children)) {
      const id = buildNode(child, node.id, state, nodes)
      if (id) childIds.push(id)
    }
    node.children = childIds
  }

  return node.id
}

function pageTitle(fileName: string): string {
  const base = fileName.replace(/\.(html?)$/i, '')
  if (!base || base.toLowerCase() === 'index') return 'Home'
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || 'Page'
}

/** Renders one uploaded HTML file (with the shared CSS inlined) inside a
 * sandboxed, script-disabled iframe purely to read real computed styles off
 * it, then walks the resulting DOM into the given page root. Using computed
 * styles (rather than trying to parse the CSS text ourselves) means this
 * works the same whether the page came from this app's own HTML export, a
 * hand-written site, or something exported by another tool — the browser
 * has already done the hard work of resolving the cascade for us. */
async function populatePageFromHtml(iframe: HTMLIFrameElement, root: ComponentNode, html: string, css: string, theme: ProjectTheme, nodesOut: Record<string, ComponentNode>) {
  const parser = new DOMParser()
  const sourceDoc = parser.parseFromString(html, 'text/html')
  // Strip any script tags up front — belt-and-braces alongside the sandbox
  // attribute, which already prevents them from executing.
  sourceDoc.querySelectorAll('script').forEach((s) => s.remove())
  const headHtml = sourceDoc.head?.innerHTML ?? ''
  const bodyHtml = sourceDoc.body?.innerHTML ?? html

  const doc = `<!doctype html><html><head>${headHtml}<style>${css}</style></head><body>${bodyHtml}</body></html>`

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    iframe.srcdoc = doc
  })
  // One extra frame so layout/style has definitely settled before we read it.
  await new Promise((resolve) => requestAnimationFrame(resolve))

  const idoc = iframe.contentDocument
  if (!idoc || !idoc.body) throw new Error('Could not read the uploaded page.')

  const bodyComputed = idoc.defaultView!.getComputedStyle(idoc.body)
  const bg = rgbToHex(bodyComputed.backgroundColor)
  root.style = { ...root.style, background: bg && bg !== 'transparent' ? bg : root.style.background, fontFamily: bodyComputed.fontFamily || '' }

  const state: WalkState = { count: 0, theme, css }
  const childIds: string[] = []
  for (const child of Array.from(idoc.body.children)) {
    const id = buildNode(child, root.id, state, nodesOut)
    if (id) childIds.push(id)
  }
  root.children = childIds
}

/** Builds a whole project from uploaded HTML files (one page each) plus a
 * shared stylesheet. Interactions/scripts are never imported — there's no
 * reliable way to turn arbitrary JS back into the WHEN/DO model, so the
 * caller should tell the user to re-add behaviour afterward. */
export async function importCodeAsProject(target: AppTarget, name: string, htmlFiles: UploadedHtmlFile[], css: string): Promise<AppBuilderProject> {
  if (htmlFiles.length === 0) throw new Error('No HTML file found to import.')
  const theme = DEFAULT_THEME
  const project = createEmptyProject(target, name, theme)
  project.pages = []
  project.nodes = {}

  const sorted = [...htmlFiles].sort((a, b) => (a.name.toLowerCase() === 'index.html' ? -1 : b.name.toLowerCase() === 'index.html' ? 1 : 0))

  const iframe = document.createElement('iframe')
  iframe.setAttribute('sandbox', 'allow-same-origin')
  iframe.style.position = 'fixed'
  iframe.style.left = '-9999px'
  iframe.style.width = '1280px'
  iframe.style.height = '2000px'
  document.body.appendChild(iframe)

  try {
    for (const file of sorted) {
      const { page, root } = createPage(target, pageTitle(file.name), theme)
      await populatePageFromHtml(iframe, root, file.html, css, theme, project.nodes)
      project.nodes[root.id] = root
      project.pages.push(page)
    }
  } finally {
    iframe.remove()
  }

  project.activePageId = project.pages[0].id
  return project
}
