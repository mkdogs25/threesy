import { Download, Eye, Move, RotateCw, Scale, Settings, Undo2, Redo2 } from 'lucide-react'
import { Logo } from '../common/Logo'
import { IconButton } from '../common/IconButton'
import { SaveStatus } from './SaveStatus'
import { ThemeToggle } from '../common/ThemeToggle'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { useAppStore } from '../../state/appStore'

export function Toolbar() {
  const projectName = useProjectStore((s) => s.project.name)
  const renameProject = useProjectStore((s) => s.renameProject)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.past.length > 0)
  const canRedo = useProjectStore((s) => s.future.length > 0)
  const transformMode = useProjectStore((s) => s.transformMode)
  const setTransformMode = useProjectStore((s) => s.setTransformMode)
  const setExportDialogOpen = useUIStore((s) => s.setExportDialogOpen)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const previewMode = useUIStore((s) => s.previewMode)
  const setPreviewMode = useUIStore((s) => s.setPreviewMode)
  const goToWelcome = useAppStore((s) => s.goToWelcome)

  return (
    <header className="panel flex h-14 items-center gap-3 px-3">
      <button type="button" onClick={goToWelcome} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-50" title="Back to Welcome">
        <Logo size={26} />
      </button>

      <input
        value={projectName}
        onChange={(e) => renameProject(e.target.value)}
        className="w-44 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink-800 hover:border-ink-200 focus:border-brand-400 focus:bg-ink-50"
        aria-label="Project name"
      />

      <div className="mx-1 h-6 w-px bg-ink-200" />

      <IconButton label="Undo" shortcut="Ctrl Z" onClick={undo} disabled={!canUndo}>
        <Undo2 size={16} />
      </IconButton>
      <IconButton label="Redo" shortcut="Ctrl Shift Z" onClick={redo} disabled={!canRedo}>
        <Redo2 size={16} />
      </IconButton>

      <div className="mx-1 h-6 w-px bg-ink-200" />

      <IconButton label="Move" shortcut="W" active={transformMode === 'move'} onClick={() => setTransformMode('move')}>
        <Move size={16} />
      </IconButton>
      <IconButton label="Rotate" shortcut="E" active={transformMode === 'rotate'} onClick={() => setTransformMode('rotate')}>
        <RotateCw size={16} />
      </IconButton>
      <IconButton label="Scale" shortcut="R" active={transformMode === 'scale'} onClick={() => setTransformMode('scale')}>
        <Scale size={16} />
      </IconButton>

      <div className="flex-1" />

      <SaveStatus />

      <IconButton label={previewMode ? 'Exit Preview' : 'Preview'} active={previewMode} onClick={() => setPreviewMode(!previewMode)}>
        <Eye size={16} />
      </IconButton>
      <button
        type="button"
        onClick={() => setExportDialogOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
      >
        <Download size={14} /> Export
      </button>
      <ThemeToggle />
      <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
        <Settings size={16} />
      </IconButton>
    </header>
  )
}
