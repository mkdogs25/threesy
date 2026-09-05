import { Eye, EyeOff, Lock, Unlock, Ungroup } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { objectIcon } from '../library/objectIcon'

interface TreeNode {
  object: SceneObject
  children: TreeNode[]
}

function buildTree(objects: SceneObject[]): TreeNode[] {
  const byId = new Map(objects.map((o) => [o.id, { object: o, children: [] as TreeNode[] }]))
  const roots: TreeNode[] = []
  for (const o of objects) {
    const node = byId.get(o.id)!
    if (o.parentId && byId.has(o.parentId)) byId.get(o.parentId)!.children.push(node)
    else roots.push(node)
  }
  return roots
}

export function HierarchyPanel() {
  const objects = useProjectStore((s) => s.project.objects)
  const selection = useProjectStore((s) => s.selection)
  const select = useProjectStore((s) => s.select)
  const toggleVisible = useProjectStore((s) => s.toggleVisible)
  const toggleLocked = useProjectStore((s) => s.toggleLocked)
  const reparent = useProjectStore((s) => s.reparent)
  const ungroup = useProjectStore((s) => s.ungroup)
  const openContextMenu = useUIStore((s) => s.openContextMenu)
  const [dragId, setDragId] = useState<string | null>(null)

  const tree = useMemo(() => buildTree(objects), [objects])

  if (objects.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-10 text-center text-xs text-ink-400">
        <p>Nothing in your scene yet.</p>
        <p>Drag a shape from the library to get started.</p>
      </div>
    )
  }

  function renderNode(node: TreeNode, depth: number) {
    const { object } = node
    const isSelected = selection.includes(object.id)
    const Icon = objectIcon(object.kind)
    return (
      <div key={object.id}>
        <div
          draggable
          onDragStart={() => setDragId(object.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (dragId && dragId !== object.id) reparent(dragId, object.id)
            setDragId(null)
          }}
          onClick={(e) => select(object.id, e.shiftKey)}
          onContextMenu={(e) => {
            e.preventDefault()
            select(object.id)
            openContextMenu(e.clientX, e.clientY, object.id)
          }}
          style={{ paddingLeft: 10 + depth * 14 }}
          className={`group flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-1.5 text-xs ${
            isSelected ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
          }`}
        >
          <Icon size={13} className="shrink-0 opacity-70" />
          <span className="min-w-0 flex-1 truncate">{object.name}</span>
          {object.kind === 'group' && (
            <button
              type="button"
              title="Ungroup"
              onClick={(e) => {
                e.stopPropagation()
                ungroup(object.id)
              }}
              className="btn-icon h-5 w-5 opacity-0 group-hover:opacity-100"
            >
              <Ungroup size={11} />
            </button>
          )}
          <button
            type="button"
            title={object.locked ? 'Unlock' : 'Lock'}
            onClick={(e) => {
              e.stopPropagation()
              toggleLocked(object.id)
            }}
            className={`btn-icon h-5 w-5 ${object.locked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            {object.locked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
          <button
            type="button"
            title={object.visible ? 'Hide' : 'Show'}
            onClick={(e) => {
              e.stopPropagation()
              toggleVisible(object.id)
            }}
            className={`btn-icon h-5 w-5 ${!object.visible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            {object.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
        </div>
        {node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 py-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        if (dragId) reparent(dragId, null)
        setDragId(null)
      }}
    >
      {tree.map((n) => renderNode(n, 0))}
    </div>
  )
}
