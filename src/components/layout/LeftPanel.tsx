import { useUIStore } from '../../state/uiStore'
import { LibraryPanel } from '../library/LibraryPanel'
import { HierarchyPanel } from '../hierarchy/HierarchyPanel'

export function LeftPanel() {
  const leftPanel = useUIStore((s) => s.leftPanel)
  const setLeftPanel = useUIStore((s) => s.setLeftPanel)

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-hidden">
      <div className="flex border-b border-ink-100 p-1.5">
        <button
          type="button"
          onClick={() => setLeftPanel('library')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
            leftPanel === 'library' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'
          }`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => setLeftPanel('hierarchy')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
            leftPanel === 'hierarchy' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'
          }`}
        >
          Scene
        </button>
      </div>
      {leftPanel === 'library' ? <LibraryPanel /> : <HierarchyPanel />}
    </aside>
  )
}
