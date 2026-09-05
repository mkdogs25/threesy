import { create } from 'zustand'
import type {
  BooleanOp,
  CameraSettings,
  EnvironmentSettings,
  MaterialSpec,
  Modifier,
  ObjectKind,
  ProjectData,
  SceneObject,
  ShapeParams,
} from '../types/scene'
import { createEmptyProject, createSceneObject } from '../types/factories'
import { computeLocalTransformForNewParent, type LocalTransform } from '../scene/objects/worldTransform'

const HISTORY_LIMIT = 100

export type TransformMode = 'move' | 'rotate' | 'scale'

interface HistoryEntry {
  project: ProjectData
  selection: string[]
}

export interface ProjectStore {
  project: ProjectData
  selection: string[]
  transformMode: TransformMode
  saveStatus: 'saved' | 'saving' | 'dirty'
  past: HistoryEntry[]
  future: HistoryEntry[]

  // Selection
  select: (id: string | null, additive?: boolean) => void
  selectMany: (ids: string[]) => void
  clearSelection: () => void

  // Project lifecycle
  loadProject: (project: ProjectData) => void
  renameProject: (name: string) => void
  setSaveStatus: (status: ProjectStore['saveStatus']) => void

  // Object CRUD
  addObject: (kind: ObjectKind, overrides?: Partial<SceneObject>, opts?: { select?: boolean }) => string
  insertObject: (object: SceneObject, opts?: { select?: boolean }) => void
  removeObjects: (ids: string[]) => void
  duplicateObjects: (ids: string[]) => string[]
  updateObject: (id: string, patch: Partial<SceneObject>) => void
  updateShape: (id: string, patch: Partial<ShapeParams>) => void
  updateMaterial: (id: string, patch: Partial<MaterialSpec>) => void
  renameObject: (id: string, name: string) => void
  toggleVisible: (id: string) => void
  toggleLocked: (id: string) => void
  reparent: (id: string, parentId: string | null) => void
  groupSelection: () => void
  ungroup: (id: string) => void
  applyBooleanToSelection: (op: BooleanOp) => void

  // Environment / camera
  updateEnvironment: (patch: Partial<EnvironmentSettings>) => void
  updateCamera: (patch: Partial<CameraSettings>) => void

  // Transform mode
  setTransformMode: (mode: TransformMode) => void

  // History
  commit: () => void
  undo: () => void
  redo: () => void
}

function cloneProject(project: ProjectData): ProjectData {
  return JSON.parse(JSON.stringify(project))
}

function snapshot(state: ProjectStore): HistoryEntry {
  return { project: cloneProject(state.project), selection: [...state.selection] }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: createEmptyProject(),
  selection: [],
  transformMode: 'move',
  saveStatus: 'saved',
  past: [],
  future: [],

  select: (id, additive = false) =>
    set((s) => {
      if (id === null) return { selection: [] }
      if (additive) {
        const has = s.selection.includes(id)
        return { selection: has ? s.selection.filter((x) => x !== id) : [...s.selection, id] }
      }
      return { selection: [id] }
    }),
  selectMany: (ids) => set({ selection: ids }),
  clearSelection: () => set({ selection: [] }),

  loadProject: (project) => set({ project, selection: [], past: [], future: [], saveStatus: 'saved' }),
  renameProject: (name) =>
    set((s) => ({ project: { ...s.project, name, updatedAt: Date.now() }, saveStatus: 'dirty' })),
  setSaveStatus: (status) => set({ saveStatus: status }),

  addObject: (kind, overrides, opts) => {
    const obj = createSceneObject(kind, overrides)
    set((s) => ({
      ...pushHistory(s),
      project: { ...s.project, objects: [...s.project.objects, obj], updatedAt: Date.now() },
      selection: opts?.select === false ? s.selection : [obj.id],
      saveStatus: 'dirty',
    }))
    return obj.id
  },

  insertObject: (object, opts) =>
    set((s) => ({
      ...pushHistory(s),
      project: { ...s.project, objects: [...s.project.objects, object], updatedAt: Date.now() },
      selection: opts?.select === false ? s.selection : [object.id],
      saveStatus: 'dirty',
    })),

  removeObjects: (ids) =>
    set((s) => {
      const idSet = new Set(ids)
      // also remove descendants
      const all = s.project.objects
      const toRemove = new Set(idSet)
      let changed = true
      while (changed) {
        changed = false
        for (const o of all) {
          if (o.parentId && toRemove.has(o.parentId) && !toRemove.has(o.id)) {
            toRemove.add(o.id)
            changed = true
          }
        }
      }
      return {
        ...pushHistory(s),
        project: {
          ...s.project,
          objects: all.filter((o) => !toRemove.has(o.id)),
          updatedAt: Date.now(),
        },
        selection: s.selection.filter((id) => !toRemove.has(id)),
        saveStatus: 'dirty',
      }
    }),

  duplicateObjects: (ids) => {
    const state = get()
    const idMap = new Map<string, string>()
    const objs = state.project.objects
    const toDup = objs.filter((o) => ids.includes(o.id))
    const clones: SceneObject[] = toDup.map((o) => {
      const clone = { ...JSON.parse(JSON.stringify(o)), id: crypto.randomUUID() } as SceneObject
      idMap.set(o.id, clone.id)
      return clone
    })
    clones.forEach((c) => {
      if (c.parentId && idMap.has(c.parentId)) c.parentId = idMap.get(c.parentId)!
      c.position = [c.position[0] + 0.3, c.position[1], c.position[2] + 0.3]
      c.name = c.name + ' Copy'
    })
    set((s) => ({
      ...pushHistory(s),
      project: { ...s.project, objects: [...s.project.objects, ...clones], updatedAt: Date.now() },
      selection: clones.map((c) => c.id),
      saveStatus: 'dirty',
    }))
    return clones.map((c) => c.id)
  },

  updateObject: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    })),

  updateShape: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => (o.id === id ? { ...o, shape: { ...o.shape, ...patch } } : o)),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    })),

  updateMaterial: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) =>
          o.id === id ? { ...o, material: { ...o.material, ...patch } } : o,
        ),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    })),

  renameObject: (id, name) => {
    get().commit()
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => (o.id === id ? { ...o, name } : o)),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    }))
  },

  toggleVisible: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)),
      },
      saveStatus: 'dirty',
    })),

  toggleLocked: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o)),
      },
      saveStatus: 'dirty',
    })),

  reparent: (id, parentId) => {
    if (parentId === id) return
    if (parentId && isDescendantOf(get().project.objects, parentId, id)) return
    get().commit()
    // Preserve the object's on-screen position/rotation/scale across the
    // re-parent by converting its current world transform into local
    // coordinates relative to the new parent, using the live scene graph.
    const localTransform = computeLocalTransformForNewParent(id, parentId)
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) =>
          o.id === id ? { ...o, parentId, ...(localTransform ?? {}) } : o,
        ),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    }))
  },

  groupSelection: () => {
    const s = get()
    if (s.selection.length < 1) return
    get().commit()
    // Groups start at the origin with no rotation/scale so grouping never
    // moves the objects being grouped — their existing positions become
    // local-space coordinates relative to this identity-transform parent.
    const group = createSceneObject('group', {
      name: 'Group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    })
    set((st) => ({
      project: {
        ...st.project,
        objects: [
          ...st.project.objects.map((o) => (s.selection.includes(o.id) ? { ...o, parentId: group.id } : o)),
          group,
        ],
        updatedAt: Date.now(),
      },
      selection: [group.id],
      saveStatus: 'dirty',
    }))
  },

  // Pathfinder-style boolean combine: the first-selected object becomes the
  // base shape, every other selected object becomes a "tool" cutting/adding/
  // intersecting into it (and is hidden, matching the single-object flow in
  // the inspector's Combine & Shape section).
  applyBooleanToSelection: (op) => {
    const ids = get().selection
    if (ids.length < 2) return
    get().commit()
    const [baseId, ...toolIds] = ids
    const toolIdSet = new Set(toolIds)
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects.map((o) => {
          if (o.id === baseId) {
            const newMods: Modifier[] = toolIds.map((toolId) => ({ type: 'boolean', op, toolId }))
            return { ...o, modifiers: [...o.modifiers, ...newMods] }
          }
          if (toolIdSet.has(o.id)) return { ...o, visible: false }
          return o
        }),
        updatedAt: Date.now(),
      },
      selection: [baseId],
      saveStatus: 'dirty',
    }))
  },

  ungroup: (id) => {
    get().commit()
    const s0 = get()
    const groupParentId = s0.project.objects.find((o) => o.id === id)?.parentId ?? null
    // Bake each child's world transform into its own position/rotation/scale
    // (relative to whatever the group's own parent was, or the scene root)
    // so ungrouping doesn't snap objects back to some other location.
    const bakedTransforms = new Map<string, LocalTransform>()
    for (const o of s0.project.objects) {
      if (o.parentId === id) {
        const t = computeLocalTransformForNewParent(o.id, groupParentId)
        if (t) bakedTransforms.set(o.id, t)
      }
    }
    set((s) => ({
      project: {
        ...s.project,
        objects: s.project.objects
          .filter((o) => o.id !== id)
          .map((o) =>
            o.parentId === id ? { ...o, parentId: groupParentId, ...(bakedTransforms.get(o.id) ?? {}) } : o,
          ),
        updatedAt: Date.now(),
      },
      saveStatus: 'dirty',
    }))
  },

  updateEnvironment: (patch) =>
    set((s) => ({ project: { ...s.project, environment: { ...s.project.environment, ...patch } }, saveStatus: 'dirty' })),
  updateCamera: (patch) =>
    set((s) => ({ project: { ...s.project, camera: { ...s.project.camera, ...patch } }, saveStatus: 'dirty' })),

  setTransformMode: (mode) => set({ transformMode: mode }),

  commit: () => set((s) => pushHistory(s)),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s
      const previous = s.past[s.past.length - 1]
      const newPast = s.past.slice(0, -1)
      const currentSnap = snapshot(s)
      return {
        past: newPast,
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
      const newFuture = s.future.slice(1)
      const currentSnap = snapshot(s)
      return {
        future: newFuture,
        past: [...s.past, currentSnap].slice(-HISTORY_LIMIT),
        project: next.project,
        selection: next.selection,
        saveStatus: 'dirty',
      }
    }),
}))

/** True if `candidateAncestorId` is `objectId` itself or one of its
 * descendants — used to stop drag-to-reparent from creating a parent cycle
 * (which would otherwise make the whole subtree vanish from render). */
function isDescendantOf(objects: SceneObject[], candidateAncestorId: string, objectId: string): boolean {
  let current = objects.find((o) => o.id === candidateAncestorId)
  const visited = new Set<string>()
  while (current) {
    if (current.id === objectId) return true
    if (visited.has(current.id)) return false
    visited.add(current.id)
    current = current.parentId ? objects.find((o) => o.id === current!.parentId) : undefined
  }
  return false
}

function pushHistory(s: ProjectStore): Partial<ProjectStore> {
  const snap = snapshot(s)
  return { past: [...s.past, snap].slice(-HISTORY_LIMIT), future: [] }
}

export function getObject(id: string | undefined | null): SceneObject | undefined {
  if (!id) return undefined
  return useProjectStore.getState().project.objects.find((o) => o.id === id)
}
