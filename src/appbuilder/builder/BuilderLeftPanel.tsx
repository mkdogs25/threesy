import { useState } from 'react'
import { ComponentPalette } from './Components/ComponentPalette'
import { PagesPanel } from './Layers/PagesPanel'
import { LayersPanel } from './Layers/LayersPanel'

export function BuilderLeftPanel() {
  const [tab, setTab] = useState<'add' | 'pages'>('add')

  return (
    <aside className="panel flex h-full w-64 flex-col overflow-hidden">
      <div className="flex gap-1 border-b border-ink-100 p-1.5">
        <button
          type="button"
          onClick={() => setTab('add')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${tab === 'add' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'}`}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setTab('pages')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${tab === 'pages' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'}`}
        >
          Pages & Layers
        </button>
      </div>
      {tab === 'add' ? (
        <ComponentPalette />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <PagesPanel />
          <LayersPanel />
        </div>
      )}
    </aside>
  )
}
