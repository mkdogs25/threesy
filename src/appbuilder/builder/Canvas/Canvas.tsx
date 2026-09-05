import { useRef, type DragEvent } from 'react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import { isContainerType } from '../../project/schema/componentDefs'
import type { ComponentType } from '../../project/schema/types'
import { ComponentRenderer } from '../Components/ComponentRenderer'
import { SelectionOverlay } from '../Selection/SelectionOverlay'
import { findPreset, tierFor } from './devicePresets'

function resolveDropTarget(
  targetEl: HTMLElement,
  clientX: number,
  clientY: number,
  project: ReturnType<typeof useAppBuilderStore.getState>['project'],
): { parentId: string; index: number } | null {
  const nodeEl = targetEl.closest<HTMLElement>('[data-node-id]')
  if (!nodeEl) return null
  const nodeId = nodeEl.dataset.nodeId!
  const node = project.nodes[nodeId]
  if (!node) return null

  if (isContainerType(node.type)) {
    // Dropped directly on a container background (not one of its
    // children) — insert based on cursor position among existing children.
    for (let i = 0; i < node.children.length; i++) {
      const selector = `[data-node-id="${node.children[i]}"]`
      const childEl: HTMLElement | null = nodeEl.querySelector(selector)
      if (!childEl || childEl.parentElement !== nodeEl) continue
      const r = childEl.getBoundingClientRect()
      const before = node.layout.direction === 'row' ? clientX < r.left + r.width / 2 : clientY < r.top + r.height / 2
      if (before) return { parentId: node.id, index: i }
    }
    return { parentId: node.id, index: node.children.length }
  }

  if (!node.parentId) return null
  const parent = project.nodes[node.parentId]
  const index = parent.children.indexOf(nodeId)
  const rect = nodeEl.getBoundingClientRect()
  const before = parent.layout.direction === 'row' ? clientX < rect.left + rect.width / 2 : clientY < rect.top + rect.height / 2
  return { parentId: parent.id, index: before ? index : index + 1 }
}

export function Canvas() {
  const project = useAppBuilderStore((s) => s.project)
  const selection = useAppBuilderStore((s) => s.selection)
  const select = useAppBuilderStore((s) => s.select)
  const clearSelection = useAppBuilderStore((s) => s.clearSelection)
  const addComponent = useAppBuilderStore((s) => s.addComponent)
  const moveComponent = useAppBuilderStore((s) => s.moveComponent)

  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map())

  const page = project.pages.find((p) => p.id === project.activePageId)
  const preset = findPreset(project.viewport)
  const tier = tierFor(project.viewport)

  function registerRef(id: string, el: HTMLElement | null) {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }

  function handleDragOver(e: DragEvent) {
    if (e.dataTransfer.types.includes('application/threesy-new-component') || e.dataTransfer.types.includes('application/threesy-move-node')) {
      e.preventDefault()
    }
  }

  function handleDrop(e: DragEvent) {
    const newType = e.dataTransfer.getData('application/threesy-new-component') as ComponentType
    const moveId = e.dataTransfer.getData('application/threesy-move-node')
    if (!newType && !moveId) return
    e.preventDefault()
    e.stopPropagation()

    const rootId = page?.rootId
    if (!rootId) return
    const target = resolveDropTarget(e.target as HTMLElement, e.clientX, e.clientY, project) ?? { parentId: rootId, index: project.nodes[rootId].children.length }

    if (newType) {
      addComponent(newType, target.parentId, target.index)
    } else if (moveId) {
      moveComponent(moveId, target.parentId, target.index)
    }
  }

  if (!page) return null

  return (
    <div className="relative h-full w-full overflow-auto rounded-2xl bg-ink-100 p-10" onPointerDown={() => clearSelection()}>
      <div className="mx-auto" style={{ width: preset.width }}>
        {preset.frame === 'phone' && (
          <div className="mb-2 flex justify-center text-[11px] font-medium text-ink-400">{preset.label}</div>
        )}
        {preset.frame === 'browser' && (
          <div className="flex items-center gap-1.5 rounded-t-xl border border-b-0 border-ink-200 bg-surface px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
        )}
        <div
          className={`relative overflow-hidden border border-ink-200 bg-white ${preset.frame === 'browser' ? 'rounded-b-xl' : 'rounded-[2.5rem] border-[6px] border-ink-800 p-1.5'}`}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            ref={containerRef}
            className="relative"
            style={{ minHeight: preset.frame === 'phone' ? 640 : 480 }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => select(null)}
          >
            <ComponentRenderer
              project={project}
              nodeId={page.rootId}
              mode="edit"
              selection={selection}
              onSelect={select}
              registerRef={registerRef}
              tier={tier}
            />
            <SelectionOverlay containerRef={containerRef} nodeRefs={nodeRefs} />
          </div>
        </div>
      </div>
    </div>
  )
}
