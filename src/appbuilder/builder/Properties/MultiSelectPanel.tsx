import { Combine, Copy, Trash2, Ungroup as UngroupIcon } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'

export function MultiSelectPanel() {
  const selection = useAppBuilderStore((s) => s.selection)
  const project = useAppBuilderStore((s) => s.project)
  const groupSelection = useAppBuilderStore((s) => s.groupSelection)
  const ungroup = useAppBuilderStore((s) => s.ungroup)
  const duplicateComponents = useAppBuilderStore((s) => s.duplicateComponents)
  const removeComponents = useAppBuilderStore((s) => s.removeComponents)

  const nodes = selection.map((id) => project.nodes[id]).filter(Boolean)
  const singleGroup = nodes.length === 1 && nodes[0].type === 'container'

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-y-auto">
      <div className="border-b border-ink-100 px-3 py-2.5">
        <p className="text-sm font-semibold text-ink-800">{nodes.length} components selected</p>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg bg-ink-50 p-2">
          {nodes.map((n) => (
            <span key={n.id} className="truncate text-xs text-ink-600">
              {n.name}
            </span>
          ))}
        </div>
        <button type="button" onClick={groupSelection} className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600">
          <Combine size={16} /> Group
        </button>
        {singleGroup && (
          <button type="button" onClick={() => ungroup(nodes[0].id)} className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600">
            <UngroupIcon size={16} /> Ungroup
          </button>
        )}
        <button type="button" onClick={() => duplicateComponents(selection)} className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600">
          <Copy size={16} /> Duplicate
        </button>
        <button type="button" onClick={() => removeComponents(selection)} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-surface py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </aside>
  )
}
