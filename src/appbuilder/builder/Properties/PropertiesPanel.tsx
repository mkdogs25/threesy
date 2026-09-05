import { Trash2 } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'
import { isContainerType } from '../../project/schema/componentDefs'
import { Section } from '../../../components/common/Section'
import { Slider } from '../../../components/common/Slider'
import { EventsEditor } from '../../logic/Actions/EventsEditor'
import { NavItemsEditor } from './NavItemsEditor'
import { MultiSelectPanel } from './MultiSelectPanel'

const FONT_WEIGHTS = [400, 500, 600, 700] as const
const ALIGN_OPTIONS = ['start', 'center', 'end', 'stretch', 'space-between'] as const

function SizeField({ label, value, onChange }: { label: string; value: number | 'auto' | 'fill'; onChange: (v: number | 'auto' | 'fill') => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-ink-500">{label}</span>
      <div className="flex gap-1">
        {(['auto', 'fill'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-md py-1 text-[11px] font-medium capitalize ${value === opt ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}
          >
            {opt}
          </button>
        ))}
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          placeholder="px"
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 'auto')}
          className="w-16 rounded-md border border-ink-200 bg-surface px-1.5 text-[11px]"
        />
      </div>
    </label>
  )
}

export function PropertiesPanel() {
  const project = useAppBuilderStore((s) => s.project)
  const selection = useAppBuilderStore((s) => s.selection)
  const updateComponent = useAppBuilderStore((s) => s.updateComponent)
  const updateStyle = useAppBuilderStore((s) => s.updateStyle)
  const updateLayout = useAppBuilderStore((s) => s.updateLayout)
  const removeComponents = useAppBuilderStore((s) => s.removeComponents)
  const commit = useAppBuilderStore((s) => s.commit)

  if (selection.length > 1) return <MultiSelectPanel />

  const node = selection[0] ? project.nodes[selection[0]] : undefined
  if (!node) {
    return (
      <aside className="panel flex h-full w-72 flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-ink-400">Select a component to edit its properties</p>
      </aside>
    )
  }

  const isText = node.type === 'text' || node.type === 'heading' || node.type === 'button' || node.type === 'fab'
  const isContainer = isContainerType(node.type)
  const hasNavItems = node.type === 'bottomNav' || node.type === 'tabBar'

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-y-auto" key={node.id}>
      <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2.5">
        <input
          value={node.name}
          onChange={(e) => updateComponent(node.id, { name: e.target.value })}
          onBlur={commit}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-ink-800 hover:border-ink-200 focus:border-brand-400 focus:bg-surface"
        />
        {node.parentId && (
          <button type="button" onClick={() => removeComponents([node.id])} className="btn-icon h-7 w-7 hover:bg-red-50 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {(isText || node.type === 'input' || node.type === 'image' || node.type === 'icon') && (
        <Section title="Content">
          {isText && (
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Text</span>
              <input
                value={node.text}
                onChange={(e) => updateComponent(node.id, { text: e.target.value })}
                onBlur={commit}
                className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          )}
          {node.type === 'input' && (
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Placeholder</span>
              <input
                value={node.placeholder}
                onChange={(e) => updateComponent(node.id, { placeholder: e.target.value })}
                onBlur={commit}
                className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          )}
          {node.type === 'image' && (
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Image URL</span>
              <input
                value={node.imageUrl}
                onChange={(e) => updateComponent(node.id, { imageUrl: e.target.value })}
                onBlur={commit}
                placeholder="https://…"
                className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          )}
          {node.type === 'icon' && (
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Icon name</span>
              <input
                value={node.text}
                onChange={(e) => updateComponent(node.id, { text: e.target.value })}
                onBlur={commit}
                placeholder="star, heart, home…"
                className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          )}
        </Section>
      )}

      {hasNavItems && <NavItemsEditor node={node} />}

      <Section title="Appearance" defaultOpen={false}>
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="text-ink-500">Background</span>
          <input type="color" value={node.style.background === 'transparent' ? '#ffffff' : node.style.background} onChange={(e) => updateStyle(node.id, { background: e.target.value })} onBlur={commit} className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent" />
        </label>
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="text-ink-500">Text colour</span>
          <input type="color" value={node.style.color} onChange={(e) => updateStyle(node.id, { color: e.target.value })} onBlur={commit} className="h-7 w-12 cursor-pointer rounded border border-ink-200 bg-transparent" />
        </label>
        <Slider label="Text size" value={node.style.fontSize} min={10} max={48} step={1} onChange={(v) => updateStyle(node.id, { fontSize: v })} onCommit={commit} format={(v) => `${v}px`} />
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-ink-500">Text weight</span>
          <div className="grid grid-cols-4 gap-1">
            {FONT_WEIGHTS.map((w) => (
              <button key={w} type="button" onClick={() => updateStyle(node.id, { fontWeight: w })} className={`rounded-md py-1 text-[11px] ${node.style.fontWeight === w ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500'}`}>
                {w}
              </button>
            ))}
          </div>
        </label>
        <Slider label="Corner radius" value={node.style.borderRadius} min={0} max={40} step={1} onChange={(v) => updateStyle(node.id, { borderRadius: v })} onCommit={commit} format={(v) => `${v}px`} />
        <label className="flex items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" checked={node.style.shadow} onChange={(e) => updateStyle(node.id, { shadow: e.target.checked })} />
          Shadow
        </label>
      </Section>

      <Section title="Layout" defaultOpen={false}>
        <SizeField label="Width" value={node.width} onChange={(v) => updateComponent(node.id, { width: v })} />
        <SizeField label="Height" value={node.height} onChange={(v) => updateComponent(node.id, { height: v })} />
        <Slider label="Padding" value={node.style.padding} min={0} max={64} step={1} onChange={(v) => updateStyle(node.id, { padding: v })} onCommit={commit} format={(v) => `${v}px`} />
        <Slider label="Margin" value={node.style.margin} min={0} max={64} step={1} onChange={(v) => updateStyle(node.id, { margin: v })} onCommit={commit} format={(v) => `${v}px`} />
        {isContainer && (
          <>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Direction</span>
              <div className="grid grid-cols-2 gap-1">
                {(['column', 'row'] as const).map((d) => (
                  <button key={d} type="button" onClick={() => updateLayout(node.id, { direction: d })} className={`rounded-md py-1 text-[11px] capitalize ${node.layout.direction === d ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500'}`}>
                    {d === 'column' ? 'Vertical' : 'Horizontal'}
                  </button>
                ))}
              </div>
            </label>
            <Slider label="Spacing" value={node.layout.gap} min={0} max={48} step={1} onChange={(v) => updateLayout(node.id, { gap: v })} onCommit={commit} format={(v) => `${v}px`} />
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-ink-500">Align</span>
              <select value={node.layout.align} onChange={(e) => updateLayout(node.id, { align: e.target.value as (typeof ALIGN_OPTIONS)[number] })} className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs capitalize">
                {ALIGN_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </Section>

      <Section title="Interaction" defaultOpen={false}>
        <EventsEditor node={node} />
      </Section>

      <Section title="Responsive" defaultOpen={false}>
        <p className="text-[11px] text-ink-400">How this element behaves on smaller screens.</p>
        {(['tablet', 'mobile'] as const).map((tier) => (
          <label key={tier} className="flex flex-col gap-1 text-xs">
            <span className="capitalize text-ink-500">{tier}</span>
            <select
              value={node.responsive[tier]}
              onChange={(e) => updateComponent(node.id, { responsive: { ...node.responsive, [tier]: e.target.value } })}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-xs capitalize"
            >
              {['default', 'stack', 'wrap', 'hide', 'resize', 'fullWidth', 'keepPosition'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        ))}
      </Section>
    </aside>
  )
}
