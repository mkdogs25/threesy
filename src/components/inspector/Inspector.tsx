import { Trash2 } from 'lucide-react'
import { useProjectStore } from '../../state/projectStore'
import { Logo } from '../common/Logo'
import { TransformSection } from './TransformSection'
import { ShapeSection } from './ShapeSection'
import { MaterialSection } from './MaterialSection'
import { ModifiersSection } from './ModifiersSection'
import { AnimationSection } from './AnimationSection'
import { InteractionsSection } from './InteractionsSection'
import { EnvironmentSection } from './EnvironmentSection'

export function Inspector() {
  const objects = useProjectStore((s) => s.project.objects)
  const selection = useProjectStore((s) => s.selection)
  const renameObject = useProjectStore((s) => s.renameObject)
  const removeObjects = useProjectStore((s) => s.removeObjects)
  const primaryId = selection[selection.length - 1]
  const object = objects.find((o) => o.id === primaryId)

  if (!object) {
    return (
      <aside className="panel flex h-full w-72 flex-col overflow-y-auto">
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <Logo size={32} className="opacity-60" />
          <p className="text-xs text-ink-400">Select an object to edit its properties</p>
        </div>
        <EnvironmentSection />
      </aside>
    )
  }

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-y-auto" key={object.id}>
      <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2.5">
        <input
          value={object.name}
          onChange={(e) => renameObject(object.id, e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-ink-800 hover:border-ink-200 focus:border-brand-400 focus:bg-white"
          aria-label="Object name"
        />
        <button
          type="button"
          onClick={() => removeObjects([object.id])}
          className="btn-icon h-7 w-7 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete object"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <TransformSection object={object} />
      <ShapeSection object={object} />
      <MaterialSection object={object} />
      <ModifiersSection object={object} />
      <AnimationSection object={object} />
      <InteractionsSection object={object} />
    </aside>
  )
}
