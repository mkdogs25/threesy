import { Plus, X } from 'lucide-react'
import type { Interaction, InteractionAction, InteractionTrigger, SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { Section } from '../common/Section'

const TRIGGERS: InteractionTrigger[] = ['hover', 'click', 'mousedown', 'mouseup', 'scroll']
const ACTION_LABELS: Record<InteractionAction['type'], string> = {
  rotate: 'Rotate',
  move: 'Move',
  scale: 'Scale',
  colorChange: 'Change Colour',
  playAnimation: 'Play Animation',
  openUrl: 'Open URL',
}

function defaultAction(type: InteractionAction['type']): InteractionAction {
  switch (type) {
    case 'rotate':
      return { type: 'rotate', axis: 'y', amount: 90 }
    case 'move':
      return { type: 'move', delta: [0, 0.3, 0] }
    case 'scale':
      return { type: 'scale', amount: 1.15 }
    case 'colorChange':
      return { type: 'colorChange', color: '#ff5ede' }
    case 'playAnimation':
      return { type: 'playAnimation' }
    case 'openUrl':
      return { type: 'openUrl', url: 'https://' }
  }
}

export function InteractionsSection({ object }: { object: SceneObject }) {
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)

  function add() {
    commit()
    const interaction: Interaction = { id: crypto.randomUUID(), trigger: 'click', action: defaultAction('scale') }
    updateObject(object.id, { interactions: [...object.interactions, interaction] })
  }

  function remove(id: string) {
    commit()
    updateObject(object.id, { interactions: object.interactions.filter((i) => i.id !== id) })
  }

  function patch(id: string, patch: Partial<Interaction>) {
    updateObject(object.id, { interactions: object.interactions.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  return (
    <Section title="Interactivity" defaultOpen={false}>
      {object.interactions.map((interaction) => (
        <div key={interaction.id} className="flex flex-col gap-2 rounded-lg border border-ink-200 p-2.5">
          <div className="flex items-center gap-1.5">
            <select
              value={interaction.trigger}
              onChange={(e) => patch(interaction.id, { trigger: e.target.value as InteractionTrigger })}
              className="flex-1 rounded-md border border-ink-200 bg-white px-1.5 py-1 text-[11px] capitalize"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-ink-400">→</span>
            <select
              value={interaction.action.type}
              onChange={(e) => patch(interaction.id, { action: defaultAction(e.target.value as InteractionAction['type']) })}
              className="flex-1 rounded-md border border-ink-200 bg-white px-1.5 py-1 text-[11px]"
            >
              {(Object.keys(ACTION_LABELS) as InteractionAction['type'][]).map((t) => (
                <option key={t} value={t}>
                  {ACTION_LABELS[t]}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => remove(interaction.id)} className="btn-icon h-6 w-6">
              <X size={12} />
            </button>
          </div>
          {interaction.action.type === 'openUrl' && (
            <input
              type="url"
              value={interaction.action.url}
              onChange={(e) => patch(interaction.id, { action: { type: 'openUrl', url: e.target.value } })}
              placeholder="https://example.com"
              className="rounded-md border border-ink-200 px-2 py-1 text-[11px]"
            />
          )}
          {interaction.action.type === 'colorChange' && (
            <input
              type="color"
              value={interaction.action.color}
              onChange={(e) => patch(interaction.id, { action: { type: 'colorChange', color: e.target.value } })}
              className="h-7 w-12 cursor-pointer rounded border border-ink-200"
            />
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 py-1.5 text-[11px] font-medium text-ink-500 hover:border-brand-400 hover:text-brand-600"
      >
        <Plus size={12} /> Add Interaction
      </button>
    </Section>
  )
}
