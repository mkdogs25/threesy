import { Trash2 } from 'lucide-react'
import { useWireframeStore } from '../../state/wireframeStore'
import { NumberField } from '../common/NumberField'

export function WireframeInspector() {
  const nodes = useWireframeStore((s) => s.project.nodes)
  const selection = useWireframeStore((s) => s.selection)
  const updateNode = useWireframeStore((s) => s.updateNode)
  const removeNodes = useWireframeStore((s) => s.removeNodes)
  const commit = useWireframeStore((s) => s.commit)

  if (selection.length !== 1) {
    return (
      <aside className="panel flex h-full w-72 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-xs text-ink-400">
          {selection.length === 0 ? 'Select an element to edit it' : `${selection.length} elements selected`}
        </p>
      </aside>
    )
  }

  const node = nodes.find((n) => n.id === selection[0])
  if (!node) return null

  const showLabel = node.type !== 'rectangle' && node.type !== 'circle'
  // A frame's background intentionally follows the app's light/dark theme
  // rather than a per-node colour, so there's nothing for this field to do.
  const showColor = node.type !== 'frame'

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2.5">
        <span className="flex-1 truncate text-sm font-semibold capitalize text-ink-800">{node.type}</span>
        <button
          type="button"
          onClick={() => removeNodes([node.id])}
          className="btn-icon h-7 w-7 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete element"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {showLabel && (
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-ink-500">Label</span>
            <input
              type="text"
              value={node.label}
              onChange={(e) => updateNode(node.id, { label: e.target.value })}
              onBlur={commit}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
            />
          </label>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-ink-500">Position</span>
          <div className="grid grid-cols-2 gap-1.5">
            <NumberField label="X" value={node.x} step={1} onChange={(v) => updateNode(node.id, { x: v })} onCommit={commit} />
            <NumberField label="Y" value={node.y} step={1} onChange={(v) => updateNode(node.id, { y: v })} onCommit={commit} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-ink-500">Size</span>
          <div className="grid grid-cols-2 gap-1.5">
            <NumberField label="W" value={node.width} step={1} onChange={(v) => updateNode(node.id, { width: Math.max(8, v) })} onCommit={commit} />
            <NumberField label="H" value={node.height} step={1} onChange={(v) => updateNode(node.id, { height: Math.max(8, v) })} onCommit={commit} />
          </div>
        </div>

        {showColor && (
          <label className="flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-500">Colour</span>
            <input
              type="color"
              value={node.color}
              onChange={(e) => updateNode(node.id, { color: e.target.value })}
              onBlur={commit}
              className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent"
            />
          </label>
        )}
      </div>
    </aside>
  )
}
