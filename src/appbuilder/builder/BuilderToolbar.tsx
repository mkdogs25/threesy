import { Code2, Download, Eye, Palette, Pencil, Redo2, Undo2 } from 'lucide-react'
import { Logo } from '../../components/common/Logo'
import { IconButton } from '../../components/common/IconButton'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { useAppBuilderStore } from '../project/appBuilderStore'
import { useAppStore } from '../../state/appStore'
import { presetsFor } from './Canvas/devicePresets'

export function BuilderToolbar({ onExport, onTheme }: { onExport: () => void; onTheme: () => void }) {
  const project = useAppBuilderStore((s) => s.project)
  const renameProject = useAppBuilderStore((s) => s.renameProject)
  const undo = useAppBuilderStore((s) => s.undo)
  const redo = useAppBuilderStore((s) => s.redo)
  const canUndo = useAppBuilderStore((s) => s.past.length > 0)
  const canRedo = useAppBuilderStore((s) => s.future.length > 0)
  const viewMode = useAppBuilderStore((s) => s.viewMode)
  const setViewMode = useAppBuilderStore((s) => s.setViewMode)
  const setViewport = useAppBuilderStore((s) => s.setViewport)
  const saveStatus = useAppBuilderStore((s) => s.saveStatus)
  const goToWelcome = useAppStore((s) => s.goToWelcome)

  return (
    <header className="panel flex h-14 items-center gap-3 px-3">
      <button type="button" onClick={goToWelcome} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-50" title="Back to Welcome">
        <Logo size={26} />
      </button>

      <input
        value={project.name}
        onChange={(e) => renameProject(e.target.value)}
        className="w-40 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink-800 hover:border-ink-200 focus:border-brand-400 focus:bg-ink-50"
      />

      <div className="mx-1 h-6 w-px bg-ink-200" />
      <IconButton label="Undo" shortcut="Ctrl Z" onClick={undo} disabled={!canUndo}>
        <Undo2 size={16} />
      </IconButton>
      <IconButton label="Redo" shortcut="Ctrl Shift Z" onClick={redo} disabled={!canRedo}>
        <Redo2 size={16} />
      </IconButton>

      <div className="mx-1 h-6 w-px bg-ink-200" />
      <select
        value={project.viewport}
        onChange={(e) => setViewport(e.target.value as typeof project.viewport)}
        className="rounded-lg border border-ink-200 bg-surface px-2 py-1.5 text-xs"
      >
        {presetsFor(project.target).map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <div className="flex-1" />

      <div className="flex rounded-lg bg-ink-100 p-0.5 text-xs font-semibold">
        {(
          [
            { id: 'design', label: 'Design', icon: Pencil },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'code', label: 'Code', icon: Code2 },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${viewMode === tab.id ? 'bg-surface text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      <span className="text-xs text-ink-400">{saveStatus === 'saved' ? 'Saved locally' : saveStatus === 'saving' ? 'Saving…' : 'Unsaved'}</span>
      <IconButton label="Theme" onClick={onTheme}>
        <Palette size={16} />
      </IconButton>
      <ThemeToggle />
      <button type="button" onClick={onExport} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
        <Download size={14} /> Export
      </button>
    </header>
  )
}
