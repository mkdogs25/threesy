import { Copy, Eye, EyeOff, Focus, Group, Lock, Sparkles, Trash2, Ungroup, Unlock } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { frameSelected } from '../../scene/camera/cameraActions'

export function ContextMenu() {
  const menu = useUIStore((s) => s.contextMenu)
  const close = useUIStore((s) => s.closeContextMenu)
  const objects = useProjectStore((s) => s.project.objects)
  const selection = useProjectStore((s) => s.selection)
  const duplicateObjects = useProjectStore((s) => s.duplicateObjects)
  const removeObjects = useProjectStore((s) => s.removeObjects)
  const toggleVisible = useProjectStore((s) => s.toggleVisible)
  const toggleLocked = useProjectStore((s) => s.toggleLocked)
  const groupSelection = useProjectStore((s) => s.groupSelection)
  const ungroup = useProjectStore((s) => s.ungroup)
  const updateObject = useProjectStore((s) => s.updateObject)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [close])

  if (!menu) return null
  const object = objects.find((o) => o.id === menu.objectId)
  if (!object) return null

  const items: { label: string; icon: typeof Copy; onClick: () => void; danger?: boolean }[] = [
    { label: 'Duplicate', icon: Copy, onClick: () => duplicateObjects([object.id]) },
    {
      label: object.visible ? 'Hide' : 'Show',
      icon: object.visible ? EyeOff : Eye,
      onClick: () => toggleVisible(object.id),
    },
    {
      label: object.locked ? 'Unlock' : 'Lock',
      icon: object.locked ? Unlock : Lock,
      onClick: () => toggleLocked(object.id),
    },
    { label: 'Focus', icon: Focus, onClick: () => frameSelected() },
    ...(selection.length > 1 ? [{ label: 'Group', icon: Group, onClick: () => groupSelection() }] : []),
    ...(object.kind === 'group' ? [{ label: 'Ungroup', icon: Ungroup, onClick: () => ungroup(object.id) }] : []),
    ...(object.kind === 'imported'
      ? [
          {
            label: 'Convert to Editable Shape',
            icon: Sparkles,
            onClick: () => updateObject(object.id, { kind: 'cube', importedAssetId: undefined, importedFormat: undefined }),
          },
        ]
      : []),
    { label: 'Delete', icon: Trash2, onClick: () => removeObjects([object.id]), danger: true },
  ]

  return (
    <div
      ref={ref}
      style={{ left: menu.x, top: menu.y }}
      className="fixed z-[120] w-48 animate-scale-in rounded-xl border border-ink-200 bg-white py-1.5 shadow-xl"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.onClick()
            close()
          }}
          className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs ${
            item.danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-700 hover:bg-ink-50'
          }`}
        >
          <item.icon size={13} />
          {item.label}
        </button>
      ))}
    </div>
  )
}
