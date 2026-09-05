import type { AppBuilderProject, AppTarget, ComponentLayout, ComponentNode, ComponentStyle, ComponentType } from '../project/schema/types'
import { createComponentNode, createPage } from '../project/schema/factories'

type NodeOverrides = Partial<Omit<ComponentNode, 'style' | 'layout'>> & {
  style?: Partial<ComponentStyle>
  layout?: Partial<ComponentLayout>
}

/** Small helper for writing templates: builds a component tree in one call
 * without going through the store (templates construct a whole project up
 * front, they don't need history/selection semantics). Style/layout
 * overrides are merged onto the type's defaults rather than replacing them
 * wholesale, so a template can tweak just `fontSize` without having to
 * restate every other style field. */
export class TreeBuilder {
  nodes: Record<string, ComponentNode> = {}

  add(type: ComponentType, parentId: string | null, overrides: NodeOverrides = {}): ComponentNode {
    const { style: styleOverride, layout: layoutOverride, ...rest } = overrides
    const node = createComponentNode(type, { parentId, ...rest })
    if (styleOverride) node.style = { ...node.style, ...styleOverride }
    if (layoutOverride) node.layout = { ...node.layout, ...layoutOverride }
    this.nodes[node.id] = node
    if (parentId && this.nodes[parentId]) {
      this.nodes[parentId] = { ...this.nodes[parentId], children: [...this.nodes[parentId].children, node.id] }
    }
    return node
  }
}

export function buildTemplateProject(
  target: AppTarget,
  name: string,
  build: (b: TreeBuilder, rootId: string) => void,
): AppBuilderProject {
  const { page, root } = createPage(target, target === 'web' ? 'Home' : 'Home')
  const builder = new TreeBuilder()
  builder.nodes[root.id] = root
  build(builder, root.id)
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name,
    target,
    createdAt: now,
    updatedAt: now,
    pages: [page],
    activePageId: page.id,
    nodes: builder.nodes,
    viewport: target === 'web' ? 'desktop' : 'standardPhone',
    bottomNavId: null,
  }
}
