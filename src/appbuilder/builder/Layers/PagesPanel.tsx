import { Copy, Plus, Trash2 } from 'lucide-react'
import { useAppBuilderStore } from '../../project/appBuilderStore'

export function PagesPanel() {
  const project = useAppBuilderStore((s) => s.project)
  const setActivePage = useAppBuilderStore((s) => s.setActivePage)
  const addPage = useAppBuilderStore((s) => s.addPage)
  const duplicatePage = useAppBuilderStore((s) => s.duplicatePage)
  const renamePage = useAppBuilderStore((s) => s.renamePage)
  const removePage = useAppBuilderStore((s) => s.removePage)
  const label = project.target === 'web' ? 'Page' : 'Screen'

  return (
    <div className="border-b border-ink-100 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink-600">{label}s</h3>
        <button type="button" onClick={() => addPage()} className="btn-icon h-6 w-6">
          <Plus size={13} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {project.pages.map((page) => (
          <div
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs cursor-pointer ${page.id === project.activePageId ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}
          >
            <input
              value={page.name}
              onChange={(e) => renamePage(page.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="min-w-0 flex-1 truncate bg-transparent outline-none"
            />
            <button type="button" onClick={(e) => { e.stopPropagation(); duplicatePage(page.id) }} className="btn-icon h-5 w-5 opacity-0 group-hover:opacity-100">
              <Copy size={11} />
            </button>
            {project.pages.length > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); removePage(page.id) }} className="btn-icon h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-red-600">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
