import { Image as ImageIcon, Link2 } from 'lucide-react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { WireframeNode } from '../../types/wireframe'
import { useWireframeStore } from '../../state/wireframeStore'

const MIN_SIZE = 24

interface WireframeNodeViewProps {
  node: WireframeNode
  selected: boolean
  onConnectorPointerDown: (e: ReactPointerEvent, nodeId: string) => void
}

export function WireframeNodeView({ node, selected, onConnectorPointerDown }: WireframeNodeViewProps) {
  const select = useWireframeStore((s) => s.select)
  const updateNode = useWireframeStore((s) => s.updateNode)
  const commit = useWireframeStore((s) => s.commit)

  function handleBodyPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return
    e.stopPropagation()
    select(node.id, e.shiftKey)
    commit()
    const startX = e.clientX
    const startY = e.clientY
    const startNodeX = node.x
    const startNodeY = node.y

    function onMove(ev: PointerEvent) {
      updateNode(node.id, { x: startNodeX + (ev.clientX - startX), y: startNodeY + (ev.clientY - startY) })
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function handleResizePointerDown(e: ReactPointerEvent) {
    e.stopPropagation()
    commit()
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = node.width
    const startHeight = node.height

    function onMove(ev: PointerEvent) {
      updateNode(node.id, {
        width: Math.max(MIN_SIZE, startWidth + (ev.clientX - startX)),
        height: Math.max(MIN_SIZE, startHeight + (ev.clientY - startY)),
      })
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function handlePointerUp() {
    const { connectingFromId, finishConnection } = useWireframeStore.getState()
    if (connectingFromId) finishConnection(node.id)
  }

  return (
    <div
      onPointerDown={handleBodyPointerDown}
      onPointerUp={handlePointerUp}
      className={`group absolute cursor-move select-none rounded-md ${selected ? 'ring-2 ring-brand-500' : ''}`}
      style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
    >
      <NodeBody node={node} />

      <button
        type="button"
        title="Drag to connect to another element"
        onPointerDown={(e) => onConnectorPointerDown(e, node.id)}
        className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full border border-ink-300 bg-surface text-ink-400 opacity-0 shadow-sm hover:border-brand-400 hover:text-brand-600 group-hover:opacity-100"
      >
        <Link2 size={12} />
      </button>

      {selected && (
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border border-white bg-brand-500 shadow"
        />
      )}
    </div>
  )
}

function NodeBody({ node }: { node: WireframeNode }) {
  switch (node.type) {
    case 'frame':
      return (
        <div className="h-full w-full rounded-lg border-2 border-ink-300 bg-surface shadow-sm">
          <div className="truncate rounded-t-md border-b border-ink-200 bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-600">
            {node.label || 'Screen'}
          </div>
        </div>
      )
    case 'rectangle':
      return <div className="h-full w-full rounded-md border border-ink-300" style={{ backgroundColor: node.color }} />
    case 'circle':
      return <div className="h-full w-full rounded-full border border-ink-300" style={{ backgroundColor: node.color }} />
    case 'text':
      return (
        <div className="flex h-full w-full items-center overflow-hidden text-sm font-medium" style={{ color: node.color }}>
          {node.label}
        </div>
      )
    case 'button':
      return (
        <div
          className="flex h-full w-full items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: node.color }}
        >
          {node.label}
        </div>
      )
    case 'input':
      return (
        <div className="flex h-full w-full items-center rounded-md border border-ink-300 bg-surface px-3 text-sm text-ink-400">
          {node.label}
        </div>
      )
    case 'image':
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink-300 text-ink-400"
          style={{ backgroundColor: node.color }}
        >
          <ImageIcon size={20} />
          <span className="text-[10px]">{node.label}</span>
        </div>
      )
    default:
      return null
  }
}
