import { useLayoutEffect, useState } from 'react'
import { useAppBuilderStore } from '../../project/appBuilderStore'

interface Rect {
  id: string
  name: string
  top: number
  left: number
  width: number
  height: number
  primary: boolean
}

interface SelectionOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  nodeRefs: React.RefObject<Map<string, HTMLElement>>
}

/** Draws a thin outline + resize handles sized to each selected component's
 * *actual* rendered bounds (measured live via getBoundingClientRect), never
 * a synthetic bounding volume — so selection always matches reality even
 * for auto-sized/flex-grown elements. */
export function SelectionOverlay({ containerRef, nodeRefs }: SelectionOverlayProps) {
  const project = useAppBuilderStore((s) => s.project)
  const selection = useAppBuilderStore((s) => s.selection)
  const updateComponent = useAppBuilderStore((s) => s.updateComponent)
  const commit = useAppBuilderStore((s) => s.commit)
  const [rects, setRects] = useState<Rect[]>([])

  useLayoutEffect(() => {
    function measure() {
      const containerEl = containerRef.current
      if (!containerEl) return
      const containerRect = containerEl.getBoundingClientRect()
      const next: Rect[] = []
      for (const id of selection) {
        const el = nodeRefs.current?.get(id)
        const node = project.nodes[id]
        if (!el || !node) continue
        const r = el.getBoundingClientRect()
        next.push({
          id,
          name: node.name,
          top: r.top - containerRect.top + containerEl.scrollTop,
          left: r.left - containerRect.left + containerEl.scrollLeft,
          width: r.width,
          height: r.height,
          primary: id === selection[selection.length - 1],
        })
      }
      setRects(next)
    }
    measure()
    window.addEventListener('resize', measure)
    const interval = setInterval(measure, 200)
    return () => {
      window.removeEventListener('resize', measure)
      clearInterval(interval)
    }
  }, [selection, project, containerRef, nodeRefs])

  function handleResizeStart(e: React.PointerEvent, id: string) {
    e.stopPropagation()
    e.preventDefault()
    const node = project.nodes[id]
    if (!node) return
    commit()
    const el = nodeRefs.current?.get(id)
    const startRect = el?.getBoundingClientRect()
    const startWidth = typeof node.width === 'number' ? node.width : startRect?.width ?? 120
    const startHeight = typeof node.height === 'number' ? node.height : startRect?.height ?? 40
    const startX = e.clientX
    const startY = e.clientY

    function onMove(ev: PointerEvent) {
      updateComponent(id, {
        width: Math.max(16, Math.round(startWidth + (ev.clientX - startX))),
        height: Math.max(16, Math.round(startHeight + (ev.clientY - startY))),
      })
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
      {rects.map((r) => (
        <div key={r.id} className="absolute" style={{ top: r.top, left: r.left, width: r.width, height: r.height }}>
          <div className={`absolute inset-0 rounded-[2px] ring-1 ${r.primary ? 'ring-brand-500' : 'ring-brand-300'}`} />
          {r.primary && (
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {r.name}
            </span>
          )}
          {r.primary && (
            <div
              onPointerDown={(e) => handleResizeStart(e, r.id)}
              className="pointer-events-auto absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border border-white bg-brand-500 shadow"
            />
          )}
        </div>
      ))}
    </div>
  )
}
