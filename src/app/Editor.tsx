import { useEffect, useRef } from 'react'
import { Toolbar } from '../components/toolbar/Toolbar'
import { LeftPanel } from '../components/layout/LeftPanel'
import { Viewport } from '../components/viewport/Viewport'
import { Inspector } from '../components/inspector/Inspector'
import { Timeline } from '../components/timeline/Timeline'
import { CommandPalette } from '../components/commandPalette/CommandPalette'
import { ContextMenu } from '../components/dialogs/ContextMenu'
import { ErrorDialog } from '../components/dialogs/ErrorDialog'
import { SettingsDialog } from '../components/dialogs/SettingsDialog'
import { ExportDialog } from '../components/dialogs/ExportDialog'
import { useAutosave } from '../persistence/useAutosave'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useUIStore } from '../state/uiStore'
import { useAppStore } from '../state/appStore'
import { useImportFiles } from '../import/useImportFiles'

export function Editor() {
  useAutosave()
  useKeyboardShortcuts()

  const exportDialogOpen = useUIStore((s) => s.exportDialogOpen)
  const previewMode = useUIStore((s) => s.previewMode)
  const pendingImportFiles = useAppStore((s) => s.pendingImportFiles)
  const clearPendingImportFiles = useAppStore((s) => s.clearPendingImportFiles)
  const importFiles = useImportFiles()
  const handledImport = useRef(false)

  useEffect(() => {
    if (pendingImportFiles && !handledImport.current) {
      handledImport.current = true
      importFiles(pendingImportFiles).finally(() => clearPendingImportFiles())
    }
  }, [pendingImportFiles, importFiles, clearPendingImportFiles])

  return (
    <div className="flex h-full w-full flex-col gap-2 bg-ink-50 p-2">
      {!previewMode && <Toolbar />}

      <div className="flex min-h-0 flex-1 gap-2">
        {!previewMode && <LeftPanel />}
        <main className="min-w-0 flex-1 overflow-hidden rounded-2xl">
          <Viewport />
        </main>
        {!previewMode && <Inspector />}
      </div>

      {!previewMode && <Timeline />}

      <CommandPalette />
      <ContextMenu />
      <ErrorDialog />
      <SettingsDialog />
      {exportDialogOpen && <ExportDialog />}
    </div>
  )
}
