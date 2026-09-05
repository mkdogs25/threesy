import { Copy, Download, Redo2, Trash2, Undo2 } from 'lucide-react'
import { Logo } from '../common/Logo'
import { IconButton } from '../common/IconButton'
import { ThemeToggle } from '../common/ThemeToggle'
import { useWireframeStore } from '../../state/wireframeStore'
import { useAppStore } from '../../state/appStore'
import { downloadWireframeFile } from '../../persistence/wireframeFile'

export function WireframeToolbar() {
  const projectName = useWireframeStore((s) => s.project.name)
  const renameProject = useWireframeStore((s) => s.renameProject)
  const undo = useWireframeStore((s) => s.undo)
  const redo = useWireframeStore((s) => s.redo)
  const canUndo = useWireframeStore((s) => s.past.length > 0)
  const canRedo = useWireframeStore((s) => s.future.length > 0)
  const selection = useWireframeStore((s) => s.selection)
  const duplicateNodes = useWireframeStore((s) => s.duplicateNodes)
  const removeNodes = useWireframeStore((s) => s.removeNodes)
  const project = useWireframeStore((s) => s.project)
  const saveStatus = useWireframeStore((s) => s.saveStatus)
  const goToWelcome = useAppStore((s) => s.goToWelcome)

  return (
    <header className="panel flex h-14 items-center gap-3 px-3">
      <button
        type="button"
        onClick={goToWelcome}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-50"
        title="Back to Welcome"
      >
        <Logo size={26} />
      </button>

      <input
        value={projectName}
        onChange={(e) => renameProject(e.target.value)}
        className="w-44 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink-800 hover:border-ink-200 focus:border-brand-400 focus:bg-ink-50"
        aria-label="Mockup name"
      />

      <div className="mx-1 h-6 w-px bg-ink-200" />

      <IconButton label="Undo" shortcut="Ctrl Z" onClick={undo} disabled={!canUndo}>
        <Undo2 size={16} />
      </IconButton>
      <IconButton label="Redo" shortcut="Ctrl Shift Z" onClick={redo} disabled={!canRedo}>
        <Redo2 size={16} />
      </IconButton>

      {selection.length > 0 && (
        <>
          <div className="mx-1 h-6 w-px bg-ink-200" />
          <IconButton label="Duplicate" shortcut="Ctrl D" onClick={() => duplicateNodes(selection)}>
            <Copy size={16} />
          </IconButton>
          <IconButton label="Delete" onClick={() => removeNodes(selection)}>
            <Trash2 size={16} />
          </IconButton>
        </>
      )}

      <div className="flex-1" />

      <span className="text-xs text-ink-400">{saveStatus === 'saved' ? 'Saved locally' : saveStatus === 'saving' ? 'Saving…' : 'Unsaved changes'}</span>

      <ThemeToggle />

      <button
        type="button"
        onClick={() => downloadWireframeFile(project)}
        className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
      >
        <Download size={14} /> Save to Computer
      </button>
    </header>
  )
}
