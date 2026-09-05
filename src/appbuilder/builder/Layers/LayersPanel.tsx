import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import type { ComponentNode } from '../../project/schema/types'

function LayerRow({ node, depth }: { node: ComponentNode; depth: number }) {
  const project = useAppBuilderStore((s) => s.project)
  const selection = useAppBuilderStore((s) => s.selection)
  const select = useAppBuilderStore((s) => s.select)
  const updateComponent = useAppBuilderStore((s) => s.updateComponent)
  const isSelected = selection.includes(node.id)

  return (
    <div>
      <div
        onClick={(e) => select(node.id, e.shiftKey)}
        style={{ paddingLeft: 10 + depth * 14 }}
        className={`group flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-1.5 text-xs ${isSelected ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}
      >
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            updateComponent(node.id, { locked: !node.locked })
          }}
          className={`btn-icon h-5 w-5 ${node.locked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {node.locked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            updateComponent(node.id, { visible: !node.visible })
          }}
          className={`btn-icon h-5 w-5 ${!node.visible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {node.visible ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
      </div>
      {node.children.map((childId) => {
        const child = project.nodes[childId]
        return child ? <LayerRow key={childId} node={child} depth={depth + 1} /> : null
      })}
    </div>
  )
}

export function LayersPanel() {
  const project = useAppBuilderStore((s) => s.project)
  const page = project.pages.find((p) => p.id === project.activePageId)
  const root = page ? project.nodes[page.rootId] : undefined

  if (!root) return null

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 py-2">
      {root.children.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-ink-400">Nothing on this {project.target === 'web' ? 'page' : 'screen'} yet.</p>
      ) : (
        root.children.map((childId) => {
          const child = project.nodes[childId]
          return child ? <LayerRow key={childId} node={child} depth={0} /> : null
        })
      )}
    </div>
  )
}
