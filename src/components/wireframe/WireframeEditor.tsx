import { WireframeToolbar } from './WireframeToolbar'
import { WireframePalette } from './WireframePalette'
import { WireframeCanvas } from './WireframeCanvas'
import { WireframeInspector } from './WireframeInspector'
import { useWireframeAutosave } from '../../persistence/useWireframeAutosave'
import { useWireframeKeyboardShortcuts } from '../../app/useWireframeKeyboardShortcuts'

export function WireframeEditor() {
  useWireframeAutosave()
  useWireframeKeyboardShortcuts()

  return (
    <div className="flex h-full w-full flex-col gap-2 bg-ink-50 p-2">
      <WireframeToolbar />
      <div className="flex min-h-0 flex-1 gap-2">
        <WireframePalette />
        <main className="min-w-0 flex-1 overflow-hidden rounded-2xl">
          <WireframeCanvas />
        </main>
        <WireframeInspector />
      </div>
    </div>
  )
}
