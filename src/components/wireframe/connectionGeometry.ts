import type { WireframeNode } from '../../types/wireframe'

interface Point {
  x: number
  y: number
}

function edgePoint(node: WireframeNode, dirX: number, dirY: number): Point {
  const halfW = node.width / 2
  const halfH = node.height / 2
  const cx = node.x + halfW
  const cy = node.y + halfH
  if (dirX === 0 && dirY === 0) return { x: cx, y: cy }
  const scaleX = dirX !== 0 ? halfW / Math.abs(dirX) : Infinity
  const scaleY = dirY !== 0 ? halfH / Math.abs(dirY) : Infinity
  const scale = Math.min(scaleX, scaleY)
  return { x: cx + dirX * scale, y: cy + dirY * scale }
}

/** Computes where a connection line should start/end on each node's edge
 * (rather than its centre), so arrows visually touch the boxes they link. */
export function connectionEndpoints(from: WireframeNode, to: WireframeNode): { from: Point; to: Point } {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 }
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 }
  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y
  const len = Math.hypot(dx, dy) || 1
  const dirX = dx / len
  const dirY = dy / len
  return {
    from: edgePoint(from, dirX, dirY),
    to: edgePoint(to, -dirX, -dirY),
  }
}
