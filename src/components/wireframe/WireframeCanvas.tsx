import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useWireframeStore } from '../../state/wireframeStore'
import type { WireframeNodeType } from '../../types/wireframe'
import { createWireframeNode } from '../../types/wireframeFactories'
import { WireframeNodeView } from './WireframeNodeView'
import { ConnectionsLayer } from './ConnectionsLayer'

const WORLD_WIDTH = 2600
const WORLD_HEIGHT = 1800

export function WireframeCanvas() {
  const nodes = useWireframeStore((s) => s.project.nodes)
  const selection = useWireframeStore((s) => s.selection)
  const clearSelection = useWireframeStore((s) => s.clearSelection)
  const startConnection = useWireframeStore((s) => s.startConnection)
  const cancelConnection = useWireframeStore((s) => s.cancelConnection)
  const addNode = useWireframeStore((s) => s.addNode)
  const containerRef = useRef<HTMLDivElement>(null)
  const [liveEnd, setLiveEnd] = useState<{ x: number; y: number } | null>(null)

  function toLocalPoint(clientX: number, clientY: number) {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return { x: clientX - rect.left + el.scrollLeft, y: clientY - rect.top + el.scrollTop }
  }

  function handleConnectorPointerDown(e: ReactPointerEvent, nodeId: string) {
    e.stopPropagation()
    e.preventDefault()
    startConnection(nodeId)
    setLiveEnd(toLocalPoint(e.clientX, e.clientY))

    function onMove(ev: PointerEvent) {
      setLiveEnd(toLocalPoint(ev.clientX, ev.clientY))
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setLiveEnd(null)
      // If the pointer was released over a node, that node's own handler
      // already called finishConnection; otherwise cancel the dangling drag.
      if (useWireframeStore.getState().connectingFromId) cancelConnection()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function handleBackgroundPointerDown(e: ReactPointerEvent) {
    if (e.target !== e.currentTarget) return
    clearSelection()
  }

  function handleDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('application/threesy-wireframe-node')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function handleDrop(e: React.DragEvent) {
    const type = e.dataTransfer.getData('application/threesy-wireframe-node') as WireframeNodeType
    if (!type) return
    e.preventDefault()
    const point = toLocalPoint(e.clientX, e.clientY)
    const template = createWireframeNode(type)
    addNode(type, { x: point.x - template.width / 2, y: point.y - template.height / 2 })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto rounded-2xl bg-ink-100 [background-image:radial-gradient(var(--color-ink-300)_1px,transparent_1px)] [background-size:20px_20px]"
      onPointerDown={handleBackgroundPointerDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="w-80 text-center text-sm text-ink-400">
            Drag a screen or element from the left to start your mockup.
          </p>
        </div>
      )}
      <div className="relative" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
        <ConnectionsLayer width={WORLD_WIDTH} height={WORLD_HEIGHT} liveEnd={liveEnd} />
        {nodes.map((node) => (
          <WireframeNodeView
            key={node.id}
            node={node}
            selected={selection.includes(node.id)}
            onConnectorPointerDown={handleConnectorPointerDown}
          />
        ))}
      </div>
    </div>
  )
}
