import type { AppBuilderProject, ComponentNode } from '../schema/types'

/** Collects a node id and every descendant id (depth-first). */
export function collectSubtreeIds(project: AppBuilderProject, rootId: string): string[] {
  const ids: string[] = []
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    ids.push(id)
    const node = project.nodes[id]
    if (node) stack.push(...node.children)
  }
  return ids
}

export function isDescendant(project: AppBuilderProject, candidateAncestorId: string, nodeId: string): boolean {
  let current: ComponentNode | undefined = project.nodes[candidateAncestorId]
  const visited = new Set<string>()
  while (current) {
    if (current.id === nodeId) return true
    if (visited.has(current.id)) return false
    visited.add(current.id)
    current = current.parentId ? project.nodes[current.parentId] : undefined
  }
  return false
}

export function getRootIdForPage(project: AppBuilderProject, pageId: string): string | undefined {
  return project.pages.find((p) => p.id === pageId)?.rootId
}
