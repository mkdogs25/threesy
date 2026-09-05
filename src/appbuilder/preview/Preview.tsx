import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useAppBuilderStore } from '../project/appBuilderStore'
import type { InteractionAction, InteractionTrigger } from '../project/schema/types'
import { ComponentRenderer, type RenderRuntime } from '../builder/Components/ComponentRenderer'
import { findPreset, tierFor } from '../builder/Canvas/devicePresets'

type Overrides = NonNullable<RenderRuntime['overrides']>

/** Actually runs the project: navigation, show/hide, modals, and
 * notifications all work for real, driven by the same ComponentRenderer the
 * canvas uses — this is not a mockup of the interactions, it *is* them. */
export function Preview() {
  const project = useAppBuilderStore((s) => s.project)
  const [currentPageId, setCurrentPageId] = useState(project.activePageId)
  const [history, setHistory] = useState<string[]>([])
  const [openModalIds, setOpenModalIds] = useState<Set<string>>(new Set())
  const [overrides, setOverrides] = useState<Overrides>({})
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedPageOpen = useRef<Set<string>>(new Set())

  const preset = findPreset(project.viewport)
  const tier = tierFor(project.viewport)

  function runAction(action: InteractionAction) {
    switch (action.type) {
      case 'navigate':
        setHistory((h) => [...h, currentPageId])
        setCurrentPageId(action.pageId)
        break
      case 'show':
        setOverrides((o) => ({ ...o, [action.targetId]: { ...o[action.targetId], visible: true } }))
        break
      case 'hide':
        setOverrides((o) => ({ ...o, [action.targetId]: { ...o[action.targetId], visible: false } }))
        break
      case 'changeText':
        setOverrides((o) => ({ ...o, [action.targetId]: { ...o[action.targetId], text: action.text } }))
        break
      case 'setValue':
        setOverrides((o) => ({ ...o, [action.targetId]: { ...o[action.targetId], text: action.value } }))
        break
      case 'changeStyle':
        setOverrides((o) => ({ ...o, [action.targetId]: { ...o[action.targetId], style: { ...o[action.targetId]?.style, ...action.style } } }))
        break
      case 'openModal':
        setOpenModalIds((s) => new Set(s).add(action.targetId))
        break
      case 'closeModal':
        setOpenModalIds((s) => {
          const next = new Set(s)
          next.delete(action.targetId)
          return next
        })
        break
      case 'notify':
        setToast(action.message)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2500)
        break
      case 'openUrl':
        window.open(action.url, '_blank', 'noopener,noreferrer')
        break
      case 'goBack':
        setHistory((h) => {
          if (h.length === 0) return h
          setCurrentPageId(h[h.length - 1])
          return h.slice(0, -1)
        })
        break
    }
  }

  function handleTriggerEvent(nodeId: string, trigger: InteractionTrigger, value?: string) {
    if (trigger === 'itemSelected' && value) {
      setHistory((h) => [...h, currentPageId])
      setCurrentPageId(value)
      return
    }
    const node = project.nodes[nodeId]
    if (!node) return
    for (const event of node.events) {
      if (event.trigger === trigger) runAction(event.action)
    }
  }

  useEffect(() => {
    if (firedPageOpen.current.has(currentPageId)) return
    firedPageOpen.current.add(currentPageId)
    const page = project.pages.find((p) => p.id === currentPageId)
    if (!page) return
    const root = project.nodes[page.rootId]
    for (const event of root?.events ?? []) {
      if (event.trigger === 'pageOpened') runAction(event.action)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId])

  function reset() {
    setCurrentPageId(project.activePageId)
    setHistory([])
    setOpenModalIds(new Set())
    setOverrides({})
    firedPageOpen.current = new Set()
  }

  const page = project.pages.find((p) => p.id === currentPageId) ?? project.pages[0]

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-auto rounded-2xl bg-ink-100 p-10">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50">
          <RotateCcw size={12} /> Restart
        </button>
        {history.length > 0 && (
          <button type="button" onClick={() => runAction({ type: 'goBack' })} className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50">
            <ArrowLeft size={12} /> Back
          </button>
        )}
      </div>
      <div
        className={`relative overflow-hidden bg-white shadow-xl ${preset.frame === 'phone' ? 'rounded-[2.5rem] border-[6px] border-ink-800 p-1.5' : 'rounded-xl border border-ink-200'}`}
        style={{ width: preset.width }}
      >
        <div className="relative overflow-y-auto" style={{ maxHeight: '80vh', minHeight: preset.frame === 'phone' ? 640 : 480 }}>
          {page && (
            <ComponentRenderer
              project={project}
              nodeId={page.rootId}
              mode="preview"
              onTriggerEvent={handleTriggerEvent}
              tier={tier}
              runtime={{ openModalIds, overrides }}
            />
          )}
        </div>
        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
