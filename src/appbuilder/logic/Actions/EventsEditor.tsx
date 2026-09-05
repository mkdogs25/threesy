import { Plus, X } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import type { ComponentNode, InteractionAction, InteractionTrigger } from '../../project/schema/types'
import { collectSubtreeIds } from '../../project/history/tree'

const TRIGGERS: { id: InteractionTrigger; label: string }[] = [
  { id: 'click', label: 'Clicked' },
  { id: 'pageOpened', label: 'Page opened' },
  { id: 'inputChanged', label: 'Input changed' },
  { id: 'toggleChanged', label: 'Toggle changed' },
  { id: 'formSubmitted', label: 'Form submitted' },
  { id: 'itemSelected', label: 'Item selected' },
]

const ACTION_TYPES: { id: InteractionAction['type']; label: string }[] = [
  { id: 'navigate', label: 'Navigate' },
  { id: 'show', label: 'Show' },
  { id: 'hide', label: 'Hide' },
  { id: 'changeText', label: 'Change text' },
  { id: 'changeStyle', label: 'Change style' },
  { id: 'setValue', label: 'Set value' },
  { id: 'openModal', label: 'Open popup' },
  { id: 'closeModal', label: 'Close popup' },
  { id: 'notify', label: 'Show notification' },
  { id: 'openUrl', label: 'Open URL' },
  { id: 'goBack', label: 'Go back' },
]

function defaultAction(type: InteractionAction['type'], firstPageId: string, firstOtherId: string): InteractionAction {
  switch (type) {
    case 'navigate':
      return { type: 'navigate', pageId: firstPageId }
    case 'show':
      return { type: 'show', targetId: firstOtherId }
    case 'hide':
      return { type: 'hide', targetId: firstOtherId }
    case 'changeText':
      return { type: 'changeText', targetId: firstOtherId, text: 'New text' }
    case 'changeStyle':
      return { type: 'changeStyle', targetId: firstOtherId, style: { background: '#4f46e5' } }
    case 'setValue':
      return { type: 'setValue', targetId: firstOtherId, value: '' }
    case 'openModal':
      return { type: 'openModal', targetId: firstOtherId }
    case 'closeModal':
      return { type: 'closeModal', targetId: firstOtherId }
    case 'notify':
      return { type: 'notify', message: 'Done!' }
    case 'openUrl':
      return { type: 'openUrl', url: 'https://' }
    case 'goBack':
      return { type: 'goBack' }
  }
}

/** WHEN → DO visual logic editor. Reused by the Properties panel's
 * Interaction section — one implementation, so an event created there
 * behaves identically wherever it's inspected. */
export function EventsEditor({ node }: { node: ComponentNode }) {
  const project = useAppBuilderStore((s) => s.project)
  const addEvent = useAppBuilderStore((s) => s.addEvent)
  const updateEvent = useAppBuilderStore((s) => s.updateEvent)
  const removeEvent = useAppBuilderStore((s) => s.removeEvent)
  const commit = useAppBuilderStore((s) => s.commit)

  const page = project.pages.find((p) => p.id === project.activePageId)
  const otherNodes: ComponentNode[] = page
    ? collectSubtreeIds(project, page.rootId)
        .filter((id) => id !== node.id)
        .map((id) => project.nodes[id])
        .filter(Boolean)
    : []

  function handleAdd() {
    commit()
    addEvent(node.id, 'click', defaultAction('navigate', project.pages[0]?.id ?? '', otherNodes[0]?.id ?? ''))
  }

  return (
    <div className="flex flex-col gap-2">
      {node.events.map((event) => (
        <div key={event.id} className="flex flex-col gap-2 rounded-lg border border-ink-200 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">When</span>
            <button type="button" onClick={() => removeEvent(node.id, event.id)} className="btn-icon h-5 w-5">
              <X size={12} />
            </button>
          </div>
          <select
            value={event.trigger}
            onChange={(e) => updateEvent(node.id, event.id, { trigger: e.target.value as InteractionTrigger })}
            className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
          >
            {TRIGGERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Do</span>
          <select
            value={event.action.type}
            onChange={(e) =>
              updateEvent(node.id, event.id, {
                action: defaultAction(e.target.value as InteractionAction['type'], project.pages[0]?.id ?? '', otherNodes[0]?.id ?? ''),
              })
            }
            className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>

          {event.action.type === 'navigate' && (
            <select
              value={event.action.pageId}
              onChange={(e) => updateEvent(node.id, event.id, { action: { type: 'navigate', pageId: e.target.value } })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            >
              {project.pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {(event.action.type === 'show' || event.action.type === 'hide' || event.action.type === 'openModal' || event.action.type === 'closeModal' || event.action.type === 'changeText' || event.action.type === 'changeStyle' || event.action.type === 'setValue') && (
            <select
              value={event.action.targetId}
              onChange={(e) => updateEvent(node.id, event.id, { action: { ...event.action, targetId: e.target.value } as InteractionAction })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            >
              {otherNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          )}

          {event.action.type === 'changeText' && (
            <input
              value={event.action.text}
              onChange={(e) => updateEvent(node.id, event.id, { action: { ...event.action, text: e.target.value } as InteractionAction })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            />
          )}
          {event.action.type === 'setValue' && (
            <input
              value={event.action.value}
              onChange={(e) => updateEvent(node.id, event.id, { action: { ...event.action, value: e.target.value } as InteractionAction })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            />
          )}
          {event.action.type === 'changeStyle' && (
            <input
              type="color"
              value={event.action.style.background ?? '#4f46e5'}
              onChange={(e) => updateEvent(node.id, event.id, { action: { ...event.action, style: { background: e.target.value } } as InteractionAction })}
              className="h-7 w-12 cursor-pointer rounded border border-ink-200"
            />
          )}
          {event.action.type === 'notify' && (
            <input
              value={event.action.message}
              onChange={(e) => updateEvent(node.id, event.id, { action: { type: 'notify', message: e.target.value } })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            />
          )}
          {event.action.type === 'openUrl' && (
            <input
              value={event.action.url}
              onChange={(e) => updateEvent(node.id, event.id, { action: { type: 'openUrl', url: e.target.value } })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs"
            />
          )}
        </div>
      ))}
      <button type="button" onClick={handleAdd} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 py-1.5 text-[11px] font-medium text-ink-500 hover:border-brand-400 hover:text-brand-600">
        <Plus size={12} /> Add Interaction
      </button>
    </div>
  )
}
