import { v4 as uuid } from 'uuid'
import { Plus, X } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import type { ComponentNode } from '../../project/schema/types'
import { Section } from '../../../components/common/Section'

export function NavItemsEditor({ node }: { node: ComponentNode }) {
  const project = useAppBuilderStore((s) => s.project)
  const updateComponent = useAppBuilderStore((s) => s.updateComponent)
  const commit = useAppBuilderStore((s) => s.commit)

  function add() {
    commit()
    updateComponent(node.id, {
      navItems: [...node.navItems, { id: uuid(), label: 'Item', icon: 'circle', targetPageId: project.pages[0]?.id ?? null }],
    })
  }
  function patch(id: string, patch: Partial<ComponentNode['navItems'][number]>) {
    updateComponent(node.id, { navItems: node.navItems.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }
  function remove(id: string) {
    commit()
    updateComponent(node.id, { navItems: node.navItems.filter((i) => i.id !== id) })
  }

  return (
    <Section title="Navigation Items">
      {node.navItems.map((item) => (
        <div key={item.id} className="flex flex-col gap-1.5 rounded-lg border border-ink-200 p-2">
          <div className="flex items-center gap-1.5">
            <input
              value={item.label}
              onChange={(e) => patch(item.id, { label: e.target.value })}
              onBlur={commit}
              className="min-w-0 flex-1 rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-[11px]"
              placeholder="Label"
            />
            <input
              value={item.icon}
              onChange={(e) => patch(item.id, { icon: e.target.value })}
              onBlur={commit}
              className="w-20 rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-[11px]"
              placeholder="icon"
            />
            <button type="button" onClick={() => remove(item.id)} className="btn-icon h-6 w-6">
              <X size={12} />
            </button>
          </div>
          <select
            value={item.targetPageId ?? ''}
            onChange={(e) => patch(item.id, { targetPageId: e.target.value || null })}
            onBlur={commit}
            className="rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-[11px]"
          >
            <option value="">Opens nothing</option>
            {project.pages.map((p) => (
              <option key={p.id} value={p.id}>
                Opens {p.name}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 py-1.5 text-[11px] font-medium text-ink-500 hover:border-brand-400 hover:text-brand-600">
        <Plus size={12} /> Add Item
      </button>
    </Section>
  )
}
