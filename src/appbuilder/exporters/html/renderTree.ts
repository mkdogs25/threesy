import type { AppBuilderProject, ComponentNode } from '../../project/schema/types'
import { computeCssDeclarations, htmlTagFor, toCssText } from '../../builder/Components/styleEngine'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const SELF_CLOSING = new Set(['img', 'hr', 'input'])

export interface RenderContext {
  project: AppBuilderProject
  cssRules: string[]
  hasEvents: (nodeId: string) => boolean
}

function attrsFor(node: ComponentNode, ctx: RenderContext): string {
  const attrs = [`class="node-${node.id}"`, `data-node-id="${node.id}"`]
  if (node.type === 'image') attrs.push(`src="${escapeHtml(node.imageUrl || '')}"`, `alt="${escapeHtml(node.text)}"`)
  if (node.type === 'input') attrs.push(`placeholder="${escapeHtml(node.placeholder)}"`, 'type="text"')
  if (ctx.hasEvents(node.id)) attrs.push('data-has-events="true"')
  if (!node.visible) attrs.push('data-hidden="true"')
  return attrs.join(' ')
}

/** Renders one component (and its descendants) to an HTML string, and pushes
 * this node's CSS (including any responsive media-query overrides) onto
 * ctx.cssRules. This is the exporter's equivalent of ComponentRenderer —
 * same style engine, same tree walk, just emitting text instead of React
 * elements, so exported markup matches the canvas by construction. */
export function renderNodeToHtml(nodeId: string, ctx: RenderContext): string {
  const node = ctx.project.nodes[nodeId]
  if (!node) return ''

  const base = computeCssDeclarations(node, 'desktop')
  ctx.cssRules.push(`.node-${node.id} {\n${toCssText(base)}\n}`)
  if (node.responsive.tablet !== 'default') {
    const tablet = computeCssDeclarations(node, 'tablet')
    ctx.cssRules.push(`@media (min-width: 640px) and (max-width: 1023px) {\n.node-${node.id} {\n${toCssText(tablet)}\n}\n}`)
  }
  if (node.responsive.mobile !== 'default') {
    const mobile = computeCssDeclarations(node, 'mobile')
    ctx.cssRules.push(`@media (max-width: 639px) {\n.node-${node.id} {\n${toCssText(mobile)}\n}\n}`)
  }

  const tag = htmlTagFor(node.type)
  const attrs = attrsFor(node, ctx)

  if (SELF_CLOSING.has(tag)) return `<${tag} ${attrs} />`

  let inner = ''
  if (node.type === 'text' || node.type === 'heading' || node.type === 'button' || node.type === 'fab') {
    inner = escapeHtml(node.text)
  } else if (node.type === 'icon') {
    inner = `<span class="icon">${escapeHtml(node.text || 'star')}</span>`
  } else if (node.type === 'bottomNav' || node.type === 'tabBar') {
    inner = node.navItems
      .map(
        (item) =>
          `<div class="nav-item" data-nav-target="${item.targetPageId ?? ''}"><span class="icon">${escapeHtml(item.icon)}</span><span>${escapeHtml(item.label)}</span></div>`,
      )
      .join('\n')
  } else {
    inner = node.children.map((childId) => renderNodeToHtml(childId, ctx)).join('\n')
  }

  return `<${tag} ${attrs}>${inner}</${tag}>`
}
