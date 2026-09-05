import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useProjectStore } from '../../state/projectStore'
import { LIBRARY_CATEGORIES, LIBRARY_ITEMS } from './libraryItems'
import { objectIcon } from './objectIcon'
import { friendlyName } from '../../types/factories'

export function LibraryPanel() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof LIBRARY_CATEGORIES)[number] | 'All'>('All')
  const addObject = useProjectStore((s) => s.addObject)

  const items = useMemo(() => {
    return LIBRARY_ITEMS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesQuery = item.label.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-ink-100 p-2.5">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shapes & objects…"
            className="w-full rounded-lg border border-ink-200 bg-ink-50 py-1.5 pl-7 pr-2 text-xs focus:border-brand-400 focus:bg-white"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(['All', ...LIBRARY_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                category === c ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-2.5">
        {items.map((item) => {
          const Icon = objectIcon(item.kind)
          return (
            <button
              key={item.category + item.kind + item.label}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/threesy-shape', item.kind)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => addObject(item.kind, { name: friendlyName(item.kind) })}
              title={`Add ${item.label}`}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <span className="line-clamp-1 text-[10.5px] font-medium text-ink-600">{item.label}</span>
            </button>
          )
        })}
        {items.length === 0 && <p className="col-span-3 py-8 text-center text-xs text-ink-400">No matches. Try another search.</p>}
      </div>
    </div>
  )
}
