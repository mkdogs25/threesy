import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  AppBuilderProject,
  AppTarget,
  ComponentLayout,
  ComponentNode,
  ComponentStyle,
  ComponentType,
  InteractionAction,
  InteractionTrigger,
} from './schema/types'
import { createComponentNode, createEmptyProject, createPage } from './schema/factories'
import { isContainerType } from './schema/componentDefs'
import { collectSubtreeIds, isDescendant } from './history/tree'

const HISTORY_LIMIT = 100

interface HistoryEntry {
  project: AppBuilderProject
  selection: string[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

interface AppBuilderStore {
  project: AppBuilderProject
  selection: string[]
  saveStatus: 'saved' | 'saving' | 'dirty'
  past: HistoryEntry[]
  future: HistoryEntry[]
  viewMode: 'design' | 'preview' | 'code'

  loadProject: (project: AppBuilderProject) => void
  renameProject: (name: string) => void
  setSaveStatus: (status: AppBuilderStore['saveStatus']) => void
  setViewport: (viewport: AppBuilderProject['viewport']) => void
  setViewMode: (mode: AppBuilderStore['viewMode']) => void

  select: (id: string | null, additive?: boolean) => void
  clearSelection: () => void

  addComponent: (type: ComponentType, parentId: string, index?: number) => string
  updateComponent: (id: string, patch: Partial<ComponentNode>) => void
  updateStyle: (id: string, patch: Partial<ComponentStyle>) => void
  updateLayout: (id: string, patch: Partial<ComponentLayout>) => void
  removeComponents: (ids: string[]) => void
  duplicateComponents: (ids: string[]) => string[]
  moveComponent: (id: string, newParentId: string, index: number) => void
  groupSelection: () => void
  ungroup: (id: string) => void

  addEvent: (componentId: string, trigger: InteractionTrigger, action: InteractionAction) => void
  updateEvent: (componentId: string, eventId: string, patch: { trigger?: InteractionTrigger; action?: InteractionAction }) => void
  removeEvent: (componentId: string, eventId: string) => void

  addPage: (name?: string) => string
  duplicatePage: (id: string) => string
  renamePage: (id: string, name: string) => void
  removePage: (id: string) => void
  reorderPages: (fromIndex: number, toIndex: number) => void
  setActivePage: (id: string) => void

  commit: () => void
  undo: () => void
  redo: () => void
}

function snapshot(s: AppBuilderStore): HistoryEntry {
  return { project: clone(s.project), selection: [...s.selection] }
}
function pushHistory(s: AppBuilderStore): Partial<AppBuilderStore> {
  return { past: [...s.past, snapshot(s)].slice(-HISTORY_LIMIT), future: [] }
}

export const useAppBuilderStore = create<AppBuilderStore>((set, get) => ({
  project: createEmptyProject('web'),
  selection: [],
  saveStatus: 'saved',
  past: [],
  future: [],
  viewMode: 'design',

  loadProject: (project) => set({ project, selection: [], past: [], future: [], saveStatus: 'saved', viewMode: 'design' }),
  renameProject: (name) => set((s) => ({ project: { ...s.project, name, updatedAt: Date.now() }, saveStatus: 'dirty' })),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setViewport: (viewport) => set((s) => ({ project: { ...s.project, viewport }, saveStatus: 'dirty' })),
  setViewMode: (mode) => set({ viewMode: mode, selection: mode === 'design' ? get().selection : [] }),

  select: (id, additive = false) =>
    set((s) => {
      if (id === null) return { selection: [] }
      if (additive) {
        const has = s.selection.includes(id)
        return { selection: has ? s.selection.filter((x) => x !== id) : [...s.selection, id] }
      }
      return { selection: [id] }
    }),
  clearSelection: () => set({ selection: [] }),

  addComponent: (type, parentId, index) => {
    get().commit()
    const node = createComponentNode(type, { parentId })
    set((s) => {
      const parent = s.project.nodes[parentId]
      if (!parent) return s
      const children = [...parent.children]
      children.splice(index ?? children.length, 0, node.id)
      return {
        project: {
          ...s.project,
          nodes: { ...s.project.nodes, [node.id]: node, [parentId]: { ...parent, children } },
          updatedAt: Date.now(),
        },
        selection: [node.id],
        saveStatus: 'dirty',
      }
    })
    return node.id
  },

  updateComponent: (id, patch) =>
    set((s) => {
      const node = s.project.nodes[id]
      if (!node) return s
      return {
        project: { ...s.project, nodes: { ...s.project.nodes, [id]: { ...node, ...patch } }, updatedAt: Date.now() },
        saveStatus: 'dirty',
      }
    }),

  updateStyle: (id, patch) =>
    set((s) => {
      const node = s.project.nodes[id]
      if (!node) return s
      return {
        project: { ...s.project, nodes: { ...s.project.nodes, [id]: { ...node, style: { ...node.style, ...patch } } }, updatedAt: Date.now() },
        saveStatus: 'dirty',
      }
    }),

  updateLayout: (id, patch) =>
    set((s) => {
      const node = s.project.nodes[id]
      if (!node) return s
      return {
        project: { ...s.project, nodes: { ...s.project.nodes, [id]: { ...node, layout: { ...node.layout, ...patch } } }, updatedAt: Date.now() },
        saveStatus: 'dirty',
      }
    }),

  removeComponents: (ids) => {
    get().commit()
    set((s) => {
      const toRemove = new Set(ids.flatMap((id) => collectSubtreeIds(s.project, id)))
      const nodes = { ...s.project.nodes }
      for (const id of toRemove) delete nodes[id]
      for (const key of Object.keys(nodes)) {
        const n = nodes[key]
        if (n.children.some((c) => toRemove.has(c))) {
          nodes[key] = { ...n, children: n.children.filter((c) => !toRemove.has(c)) }
        }
      }
      return {
        project: { ...s.project, nodes, updatedAt: Date.now() },
        selection: s.selection.filter((id) => !toRemove.has(id)),
        saveStatus: 'dirty',
      }
    })
  },

  duplicateComponents: (ids) => {
    get().commit()
    const newIds: string[] = []
    set((s) => {
      const nodes = { ...s.project.nodes }
      for (const id of ids) {
        const original = nodes[id]
        if (!original || !original.parentId) continue
        const idMap = new Map<string, string>()
        const subtreeIds = collectSubtreeIds(s.project, id)
        for (const oldId of subtreeIds) idMap.set(oldId, uuid())
        for (const oldId of subtreeIds) {
          const n = s.project.nodes[oldId]
          const newId = idMap.get(oldId)!
          nodes[newId] = {
            ...clone(n),
            id: newId,
            parentId: oldId === id ? n.parentId : idMap.get(n.parentId!) ?? n.parentId,
            children: n.children.map((c) => idMap.get(c) ?? c),
          }
        }
        const newRootId = idMap.get(id)!
        const parent = nodes[original.parentId]
        const insertAt = parent.children.indexOf(id) + 1
        const children = [...parent.children]
        children.splice(insertAt, 0, newRootId)
        nodes[original.parentId] = { ...parent, children }
        newIds.push(newRootId)
      }
      return { project: { ...s.project, nodes, updatedAt: Date.now() }, selection: newIds, saveStatus: 'dirty' }
    })
    return newIds
  },

  moveComponent: (id, newParentId, index) => {
    const s0 = get()
    if (id === newParentId) return
    if (isDescendant(s0.project, id, newParentId)) return
    get().commit()
    set((s) => {
      const node = s.project.nodes[id]
      const oldParent = node.parentId ? s.project.nodes[node.parentId] : undefined
      const newParent = s.project.nodes[newParentId]
      if (!node || !newParent) return s
      const nodes = { ...s.project.nodes }
      if (oldParent) {
        nodes[oldParent.id] = { ...oldParent, children: oldParent.children.filter((c) => c !== id) }
      }
      const targetParent = nodes[newParentId] ?? newParent
      const children = [...targetParent.children]
      const clampedIndex = Math.max(0, Math.min(index, children.length))
      children.splice(clampedIndex, 0, id)
      nodes[newParentId] = { ...targetParent, children }
      nodes[id] = { ...node, parentId: newParentId }
      return { project: { ...s.project, nodes, updatedAt: Date.now() }, saveStatus: 'dirty' }
    })
  },

  groupSelection: () => {
    const s0 = get()
    if (s0.selection.length < 1) return
    const first = s0.project.nodes[s0.selection[0]]
    if (!first?.parentId) return
    const parent = s0.project.nodes[first.parentId]
    get().commit()
    const group = createComponentNode('container', { parentId: parent.id, name: 'Group' })
    set((s) => {
      const nodes = { ...s.project.nodes }
      const parentNode = nodes[parent.id]
      const selectedSet = new Set(s0.selection)
      const insertAt = parentNode.children.findIndex((c) => selectedSet.has(c))
      const remainingChildren = parentNode.children.filter((c) => !selectedSet.has(c))
      remainingChildren.splice(insertAt, 0, group.id)
      nodes[parent.id] = { ...parentNode, children: remainingChildren }
      nodes[group.id] = { ...group, children: s0.selection }
      for (const id of s0.selection) {
        if (nodes[id]) nodes[id] = { ...nodes[id], parentId: group.id }
      }
      return { project: { ...s.project, nodes, updatedAt: Date.now() }, selection: [group.id], saveStatus: 'dirty' }
    })
  },

  ungroup: (id) => {
    get().commit()
    set((s) => {
      const group = s.project.nodes[id]
      if (!group || !group.parentId) return s
      const nodes = { ...s.project.nodes }
      const parent = nodes[group.parentId]
      const insertAt = parent.children.indexOf(id)
      const children = [...parent.children]
      children.splice(insertAt, 1, ...group.children)
      nodes[group.parentId] = { ...parent, children }
      for (const childId of group.children) {
        if (nodes[childId]) nodes[childId] = { ...nodes[childId], parentId: group.parentId }
      }
      delete nodes[id]
      return { project: { ...s.project, nodes, updatedAt: Date.now() }, selection: group.children, saveStatus: 'dirty' }
    })
  },

  addEvent: (componentId, trigger, action) => {
    get().commit()
    set((s) => {
      const node = s.project.nodes[componentId]
      if (!node) return s
      const event = { id: uuid(), trigger, action }
      return {
        project: { ...s.project, nodes: { ...s.project.nodes, [componentId]: { ...node, events: [...node.events, event] } } },
        saveStatus: 'dirty',
      }
    })
  },
  updateEvent: (componentId, eventId, patch) =>
    set((s) => {
      const node = s.project.nodes[componentId]
      if (!node) return s
      return {
        project: {
          ...s.project,
          nodes: {
            ...s.project.nodes,
            [componentId]: { ...node, events: node.events.map((e) => (e.id === eventId ? { ...e, ...patch } : e)) },
          },
        },
        saveStatus: 'dirty',
      }
    }),
  removeEvent: (componentId, eventId) => {
    get().commit()
    set((s) => {
      const node = s.project.nodes[componentId]
      if (!node) return s
      return {
        project: { ...s.project, nodes: { ...s.project.nodes, [componentId]: { ...node, events: node.events.filter((e) => e.id !== eventId) } } },
        saveStatus: 'dirty',
      }
    })
  },

  addPage: (name) => {
    get().commit()
    const s0 = get()
    const { page, root } = createPage(s0.project.target, name ?? `Page ${s0.project.pages.length + 1}`)
    set((s) => ({
      project: {
        ...s.project,
        pages: [...s.project.pages, page],
        nodes: { ...s.project.nodes, [root.id]: root },
        activePageId: page.id,
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    }))
    return page.id
  },

  duplicatePage: (id) => {
    get().commit()
    const s0 = get()
    const original = s0.project.pages.find((p) => p.id === id)
    if (!original) return id
    const idMap = new Map<string, string>()
    const subtreeIds = collectSubtreeIds(s0.project, original.rootId)
    for (const oldId of subtreeIds) idMap.set(oldId, uuid())
    const newNodes = { ...s0.project.nodes }
    for (const oldId of subtreeIds) {
      const n = s0.project.nodes[oldId]
      const newId = idMap.get(oldId)!
      newNodes[newId] = {
        ...clone(n),
        id: newId,
        parentId: n.parentId ? idMap.get(n.parentId) ?? null : null,
        children: n.children.map((c) => idMap.get(c) ?? c),
      }
    }
    const newRootId = idMap.get(original.rootId)!
    const newPage = { id: uuid(), name: `${original.name} Copy`, rootId: newRootId }
    set((s) => ({
      project: { ...s.project, pages: [...s.project.pages, newPage], nodes: newNodes, activePageId: newPage.id, updatedAt: Date.now() },
      saveStatus: 'dirty',
    }))
    return newPage.id
  },

  renamePage: (id, name) => {
    get().commit()
    set((s) => ({ project: { ...s.project, pages: s.project.pages.map((p) => (p.id === id ? { ...p, name } : p)) }, saveStatus: 'dirty' }))
  },

  removePage: (id) => {
    const s0 = get()
    if (s0.project.pages.length <= 1) return
    get().commit()
    set((s) => {
      const page = s.project.pages.find((p) => p.id === id)
      if (!page) return s
      const toRemove = new Set(collectSubtreeIds(s.project, page.rootId))
      const nodes = { ...s.project.nodes }
      for (const nodeId of toRemove) delete nodes[nodeId]
      const pages = s.project.pages.filter((p) => p.id !== id)
      const activePageId = s.project.activePageId === id ? pages[0].id : s.project.activePageId
      return { project: { ...s.project, pages, nodes, activePageId, updatedAt: Date.now() }, saveStatus: 'dirty' }
    })
  },

  reorderPages: (fromIndex, toIndex) => {
    get().commit()
    set((s) => {
      const pages = [...s.project.pages]
      const [moved] = pages.splice(fromIndex, 1)
      pages.splice(toIndex, 0, moved)
      return { project: { ...s.project, pages }, saveStatus: 'dirty' }
    })
  },

  setActivePage: (id) => set((s) => ({ project: { ...s.project, activePageId: id }, selection: [] })),

  commit: () => set((s) => pushHistory(s)),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s
      const previous = s.past[s.past.length - 1]
      const currentSnap = snapshot(s)
      return {
        past: s.past.slice(0, -1),
        future: [currentSnap, ...s.future].slice(0, HISTORY_LIMIT),
        project: previous.project,
        selection: previous.selection,
        saveStatus: 'dirty',
      }
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s
      const next = s.future[0]
      const currentSnap = snapshot(s)
      return {
        future: s.future.slice(1),
        past: [...s.past, currentSnap].slice(-HISTORY_LIMIT),
        project: next.project,
        selection: next.selection,
        saveStatus: 'dirty',
      }
    }),
}))

export function getNode(id: string | null | undefined): ComponentNode | undefined {
  if (!id) return undefined
  return useAppBuilderStore.getState().project.nodes[id]
}

export function canHaveChildren(type: ComponentType): boolean {
  return isContainerType(type)
}

export type { AppTarget }
