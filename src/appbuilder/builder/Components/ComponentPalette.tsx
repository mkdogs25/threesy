import * as Icons from 'lucide-react'
import { paletteFor } from '../../project/schema/componentDefs'
import type { ComponentType } from '../../project/schema/types'
import { useAppBuilderStore } from '../../project/appBuilderStore'

const ICONS: Partial<Record<ComponentType, keyof typeof Icons>> = {
  container: 'Square',
  row: 'Columns2',
  card: 'CreditCard',
  modal: 'PictureInPicture2',
  list: 'List',
  listItem: 'Rows3',
  text: 'Type',
  heading: 'Heading',
  button: 'RectangleHorizontal',
  image: 'Image',
  input: 'TextCursorInput',
  toggle: 'ToggleLeft',
  icon: 'Star',
  divider: 'Minus',
  navbar: 'PanelTop',
  sidebar: 'PanelLeft',
  hero: 'Layout',
  section: 'LayoutPanelTop',
  table: 'Table',
  form: 'FileText',
  footer: 'PanelBottom',
  tabs: 'GalleryHorizontal',
  appBar: 'PanelTop',
  bottomNav: 'PanelBottom',
  fab: 'CirclePlus',
  mobileForm: 'FileText',
  tabBar: 'GalleryHorizontal',
}

export function ComponentPalette() {
  const target = useAppBuilderStore((s) => s.project.target)
  const activePageId = useAppBuilderStore((s) => s.project.activePageId)
  const project = useAppBuilderStore((s) => s.project)
  const addComponent = useAppBuilderStore((s) => s.addComponent)
  const items = paletteFor(target)

  function handleAdd(type: ComponentType) {
    const page = project.pages.find((p) => p.id === activePageId)
    if (!page) return
    addComponent(type, page.rootId)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-ink-100 px-3 py-2.5">
        <p className="text-[11px] text-ink-400">Drag onto the canvas, or click to add</p>
      </div>
      <div className="grid grid-cols-2 gap-2 overflow-y-auto p-2.5">
        {items.map((item) => {
          const Icon = Icons[ICONS[item.type] ?? 'Square'] as Icons.LucideIcon
          return (
            <button
              key={item.type}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/threesy-new-component', item.type)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => handleAdd(item.type)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-surface p-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <span className="text-[10.5px] font-medium text-ink-600">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
