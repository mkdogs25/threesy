import type { WireframeNodeType } from '../../types/wireframe'
import { useWireframeStore } from '../../state/wireframeStore'
import { wireframeIcon } from './wireframeIcon'

const PALETTE: { type: WireframeNodeType; label: string }[] = [
  { type: 'frame', label: 'Screen' },
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'text', label: 'Text' },
  { type: 'button', label: 'Button' },
  { type: 'input', label: 'Input' },
  { type: 'image', label: 'Image' },
  { type: 'circle', label: 'Circle' },
]

export function WireframePalette() {
  const addNode = useWireframeStore((s) => s.addNode)
  const nodeCount = useWireframeStore((s) => s.project.nodes.length)

  function handleAdd(type: WireframeNodeType) {
    const offset = (nodeCount % 8) * 28
    addNode(type, { x: 80 + offset, y: 80 + offset })
  }

  return (
    <aside className="panel flex h-full w-64 flex-col overflow-hidden">
      <div className="border-b border-ink-100 px-3 py-2.5">
        <h2 className="text-xs font-semibold text-ink-600">Elements</h2>
        <p className="mt-0.5 text-[11px] text-ink-400">Drag onto the canvas, or click to add</p>
      </div>
      <div className="grid grid-cols-2 gap-2 overflow-y-auto p-2.5">
        {PALETTE.map((item) => {
          const Icon = wireframeIcon(item.type)
          return (
            <button
              key={item.type}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/threesy-wireframe-node', item.type)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => handleAdd(item.type)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-surface p-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <span className="text-[10.5px] font-medium text-ink-600">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-auto border-t border-ink-100 px-3 py-2.5 text-[11px] text-ink-400">
        Hover an element and drag the <span className="font-semibold text-ink-500">link handle</span> on its edge to
        connect it to another screen.
      </div>
    </aside>
  )
}
