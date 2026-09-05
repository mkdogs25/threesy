import { Combine, Group, Scissors, SquaresIntersect, Trash2 } from 'lucide-react'
import type { BooleanOp, SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { Logo } from '../common/Logo'

const BOOLEAN_ACTIONS: { op: BooleanOp; label: string; hint: string; icon: typeof Combine }[] = [
  { op: 'add', label: 'Unite', hint: 'Merge into one shape', icon: Combine },
  { op: 'cut', label: 'Subtract', hint: 'Cut the rest out of the first', icon: Scissors },
  { op: 'intersect', label: 'Intersect', hint: 'Keep only the overlap', icon: SquaresIntersect },
]

/** Shown instead of the single-object inspector whenever 2+ objects are
 * selected — a small pathfinder-style panel so combining shapes feels like a
 * vector editor (select, then Unite/Subtract/Intersect) rather than the
 * pick-a-tool-from-a-dropdown flow needed for a single object. */
export function MultiSelectionPanel({ objects }: { objects: SceneObject[] }) {
  const groupSelection = useProjectStore((s) => s.groupSelection)
  const applyBooleanToSelection = useProjectStore((s) => s.applyBooleanToSelection)
  const removeObjects = useProjectStore((s) => s.removeObjects)
  const selection = useProjectStore((s) => s.selection)

  return (
    <aside className="panel flex h-full w-72 flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2.5">
        <p className="text-sm font-semibold text-ink-800">{objects.length} objects selected</p>
        <button
          type="button"
          onClick={() => removeObjects(selection)}
          className="btn-icon h-7 w-7 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete selected objects"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex max-h-28 flex-col gap-1 overflow-y-auto rounded-lg bg-ink-50 p-2">
          {objects.map((o) => (
            <span key={o.id} className="truncate text-xs text-ink-600">
              {o.name}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={groupSelection}
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600"
        >
          <Group size={16} /> Group
        </button>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-ink-500">Combine Shapes</p>
          <p className="mb-2 text-[11px] text-ink-400">
            The first shape you selected is kept; the rest become tools that shape it.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {BOOLEAN_ACTIONS.map((action) => (
              <button
                key={action.op}
                type="button"
                title={action.hint}
                onClick={() => applyBooleanToSelection(action.op)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-surface py-3 text-[11px] font-medium text-ink-600 hover:border-brand-400 hover:text-brand-600"
              >
                <action.icon size={16} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 px-4 py-6 text-center text-ink-300">
        <Logo size={22} className="opacity-50" />
        <p className="text-[10.5px]">Tip: Shift-click to add or remove objects from the selection.</p>
      </div>
    </aside>
  )
}
