import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { WireframeConnection, WireframeNode, WireframeNodeType, WireframeProject } from '../types/wireframe'
import { createEmptyWireframeProject, createWireframeNode } from '../types/wireframeFactories'

const HISTORY_LIMIT = 100

interface HistoryEntry {
  project: WireframeProject
  selection: string[]
}

interface WireframeStore {
  project: WireframeProject
  selection: string[]
  saveStatus: 'saved' | 'saving' | 'dirty'
  past: HistoryEntry[]
  future: HistoryEntry[]
  connectingFromId: string | null

  loadProject: (project: WireframeProject) => void
  renameProject: (name: string) => void
  setSaveStatus: (status: WireframeStore['saveStatus']) => void

  select: (id: string | null, additive?: boolean) => void
  clearSelection: () => void

  addNode: (type: WireframeNodeType, overrides?: Partial<WireframeNode>) => string
  updateNode: (id: string, patch: Partial<WireframeNode>) => void
  removeNodes: (ids: string[]) => void
  duplicateNodes: (ids: string[]) => string[]

  startConnection: (fromId: string) => void
  finishConnection: (toId: string) => void
  cancelConnection: () => void
  removeConnection: (id: string) => void

  commit: () => void
  undo: () => void
  redo: () => void
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function snapshot(s: WireframeStore): HistoryEntry {
  return { project: clone(s.project), selection: [...s.selection] }
}

function pushHistory(s: WireframeStore): Partial<WireframeStore> {
  return { past: [...s.past, snapshot(s)].slice(-HISTORY_LIMIT), future: [] }
}

export const useWireframeStore = create<WireframeStore>((set, get) => ({
  project: createEmptyWireframeProject(),
  selection: [],
  saveStatus: 'saved',
  past: [],
  future: [],
  connectingFromId: null,

  loadProject: (project) => set({ project, selection: [], past: [], future: [], saveStatus: 'saved', connectingFromId: null }),
  renameProject: (name) => set((s) => ({ project: { ...s.project, name, updatedAt: Date.now() }, saveStatus: 'dirty' })),
  setSaveStatus: (status) => set({ saveStatus: status }),

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

  addNode: (type, overrides) => {
    const node = createWireframeNode(type, overrides)
    set((s) => ({
      ...pushHistory(s),
      project: { ...s.project, nodes: [...s.project.nodes, node], updatedAt: Date.now() },
      selection: [node.id],
      saveStatus: 'dirty',
    }))
    return node.id
  },

  updateNode: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    })),

  removeNodes: (ids) =>
    set((s) => {
      const idSet = new Set(ids)
      return {
        ...pushHistory(s),
        project: {
          ...s.project,
          nodes: s.project.nodes.filter((n) => !idSet.has(n.id)),
          connections: s.project.connections.filter((c) => !idSet.has(c.fromId) && !idSet.has(c.toId)),
          updatedAt: Date.now(),
        },
        selection: s.selection.filter((id) => !idSet.has(id)),
        saveStatus: 'dirty',
      }
    }),

  duplicateNodes: (ids) => {
    const s0 = get()
    const idMap = new Map<string, string>()
    const clones = s0.project.nodes
      .filter((n) => ids.includes(n.id))
      .map((n) => {
        const newNode = { ...n, id: uuid(), x: n.x + 24, y: n.y + 24 }
        idMap.set(n.id, newNode.id)
        return newNode
      })
    set((s) => ({
      ...pushHistory(s),
      project: { ...s.project, nodes: [...s.project.nodes, ...clones], updatedAt: Date.now() },
      selection: clones.map((c) => c.id),
      saveStatus: 'dirty',
    }))
    return clones.map((c) => c.id)
  },

  startConnection: (fromId) => set({ connectingFromId: fromId }),
  cancelConnection: () => set({ connectingFromId: null }),
  finishConnection: (toId) => {
    const fromId = get().connectingFromId
    if (!fromId || fromId === toId) {
      set({ connectingFromId: null })
      return
    }
    get().commit()
    const connection: WireframeConnection = { id: uuid(), fromId, toId }
    set((s) => ({
      project: { ...s.project, connections: [...s.project.connections, connection], updatedAt: Date.now() },
      connectingFromId: null,
      saveStatus: 'dirty',
    }))
  },
  removeConnection: (id) => {
    get().commit()
    set((s) => ({
      project: { ...s.project, connections: s.project.connections.filter((c) => c.id !== id), updatedAt: Date.now() },
      saveStatus: 'dirty',
    }))
  },

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
