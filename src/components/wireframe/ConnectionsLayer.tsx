import { X } from 'lucide-react'
import { useWireframeStore } from '../../state/wireframeStore'
import { connectionEndpoints } from './connectionGeometry'
import type { WireframeNode } from '../../types/wireframe'

interface ConnectionsLayerProps {
  width: number
  height: number
  liveEnd: { x: number; y: number } | null
}

export function ConnectionsLayer({ width, height, liveEnd }: ConnectionsLayerProps) {
  const nodes = useWireframeStore((s) => s.project.nodes)
  const connections = useWireframeStore((s) => s.project.connections)
  const connectingFromId = useWireframeStore((s) => s.connectingFromId)
  const removeConnection = useWireframeStore((s) => s.removeConnection)

  const byId = new Map<string, WireframeNode>(nodes.map((n) => [n.id, n]))
  const connectingFrom = connectingFromId ? byId.get(connectingFromId) : undefined

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker id="wf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--color-brand-500)' }} />
        </marker>
      </defs>

      {connections.map((c) => {
        const from = byId.get(c.fromId)
        const to = byId.get(c.toId)
        if (!from || !to) return null
        const { from: p1, to: p2 } = connectionEndpoints(from, to)
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        return (
          <g key={c.id}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              markerEnd="url(#wf-arrow)"
              style={{ stroke: 'var(--color-brand-500)' }}
              strokeWidth={2}
            />
            <g className="pointer-events-auto cursor-pointer" onClick={() => removeConnection(c.id)}>
              <circle cx={midX} cy={midY} r={9} style={{ fill: 'var(--color-surface)' }} stroke="var(--color-ink-300)" />
              <foreignObject x={midX - 6} y={midY - 6} width={12} height={12}>
                <X size={12} className="text-ink-500" />
              </foreignObject>
            </g>
          </g>
        )
      })}

      {connectingFrom && liveEnd && (
        <line
          x1={connectingFrom.x + connectingFrom.width / 2}
          y1={connectingFrom.y + connectingFrom.height / 2}
          x2={liveEnd.x}
          y2={liveEnd.y}
          style={{ stroke: 'var(--color-brand-400)' }}
          strokeDasharray="6 4"
          strokeWidth={2}
        />
      )}
    </svg>
  )
}
