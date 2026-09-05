import { useState } from 'react'
import { BuilderToolbar } from './BuilderToolbar'
import { BuilderLeftPanel } from './BuilderLeftPanel'
import { Canvas } from './Canvas/Canvas'
import { PropertiesPanel } from './Properties/PropertiesPanel'
import { CommandBar } from './CommandBar/CommandBar'
import { ExportDialog } from './ExportDialog'
import { Preview } from '../preview/Preview'
import { CodeView } from '../preview/CodeView'
import { useAppBuilderStore } from '../project/appBuilderStore'
import { useAppBuilderAutosave } from '../project/persistence/useAutosave'
import { useBuilderKeyboardShortcuts } from './useBuilderKeyboardShortcuts'

export function AppBuilderEditor() {
  useAppBuilderAutosave()
  useBuilderKeyboardShortcuts()
  const viewMode = useAppBuilderStore((s) => s.viewMode)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex h-full w-full flex-col gap-2 bg-ink-50 p-2">
      <BuilderToolbar onExport={() => setExportOpen(true)} />

      <div className="flex min-h-0 flex-1 gap-2">
        {viewMode === 'design' && <BuilderLeftPanel />}
        <main className="min-w-0 flex-1 overflow-hidden rounded-2xl">
          {viewMode === 'design' && <Canvas />}
          {viewMode === 'preview' && <Preview />}
          {viewMode === 'code' && <CodeView />}
        </main>
        {viewMode === 'design' && <PropertiesPanel />}
      </div>

      {viewMode === 'design' && <CommandBar />}

      {exportOpen && <ExportDialog onClose={() => setExportOpen(false)} />}
    </div>
  )
}
