import { createElement, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from 'react'
import * as Icons from 'lucide-react'
import type { AppBuilderProject, ComponentNode, InteractionTrigger } from '../../project/schema/types'
import { isContainerType } from '../../project/schema/componentDefs'
import { computeCssDeclarations, htmlTagFor, toReactStyle, type ResponsiveTier } from './styleEngine'

export interface RenderRuntime {
  /** Node ids whose modal should currently render (preview only). */
  openModalIds?: Set<string>
  /** Per-node content/visibility overrides applied on top of the saved
   * project — used by preview so "change text"/"show"/"hide" actions don't
   * mutate the actual saved project. */
  overrides?: Record<string, { text?: string; visible?: boolean; style?: Partial<ComponentNode['style']> }>
}

interface ComponentRendererProps {
  project: AppBuilderProject
  nodeId: string
  mode: 'edit' | 'preview'
  selection?: string[]
  onSelect?: (id: string, additive: boolean) => void
  onTriggerEvent?: (nodeId: string, trigger: InteractionTrigger, value?: string) => void
  registerRef?: (id: string, el: HTMLElement | null) => void
  runtime?: RenderRuntime
  tier?: ResponsiveTier
}

function IconGlyph({ name, size }: { name: string; size: number }) {
  const key = (name.charAt(0).toUpperCase() + name.slice(1)) as keyof typeof Icons
  const Cmp = (Icons[key] as Icons.LucideIcon) ?? Icons.Star
  return <Cmp size={size} />
}

export function ComponentRenderer({ project, nodeId, mode, selection = [], onSelect, onTriggerEvent, registerRef, runtime, tier = 'desktop' }: ComponentRendererProps) {
  const node = project.nodes[nodeId]
  const [previewToggle, setPreviewToggle] = useState(false)

  if (!node) return null

  const override = runtime?.overrides?.[nodeId]
  const effectiveVisible = override?.visible ?? node.visible
  const effectiveText = override?.text ?? node.text

  if (mode === 'preview' && !effectiveVisible) return null
  if (mode === 'preview' && node.type === 'modal' && !runtime?.openModalIds?.has(nodeId)) return null

  const decl = computeCssDeclarations({ ...node, visible: mode === 'edit' ? true : effectiveVisible, style: { ...node.style, ...override?.style } }, tier)
  if (mode === 'edit' && node.type === 'modal') {
    decl.position = 'static'
    decl.transform = 'none'
    decl.margin = decl.margin ?? '0'
  }
  const style: CSSProperties = { boxSizing: 'border-box', ...toReactStyle(decl) }
  if (mode === 'edit' && !effectiveVisible) style.opacity = 0.35

  const isSelected = mode === 'edit' && selection.includes(nodeId)

  function handleClick(e: MouseEvent) {
    if (mode === 'edit') {
      e.stopPropagation()
      onSelect?.(nodeId, e.shiftKey)
      return
    }
    if (node.type === 'toggle') setPreviewToggle((v) => !v)
    onTriggerEvent?.(nodeId, 'click')
  }

  const commonProps = {
    ref: (el: HTMLElement | null) => registerRef?.(nodeId, el),
    style,
    onClick: handleClick,
    'data-node-id': nodeId,
    'data-container': mode === 'edit' && isContainerType(node.type) ? 'true' : undefined,
    'data-selected': isSelected || undefined,
    className: mode === 'edit' ? 'threesy-node' : undefined,
    draggable: mode === 'edit' && node.parentId !== null,
    onDragStart:
      mode === 'edit' && node.parentId !== null
        ? (e: DragEvent) => {
            e.stopPropagation()
            e.dataTransfer.setData('application/threesy-move-node', nodeId)
            e.dataTransfer.effectAllowed = 'move'
          }
        : undefined,
  }

  const children: ReactNode = node.children.map((childId) => (
    <ComponentRenderer
      key={childId}
      project={project}
      nodeId={childId}
      mode={mode}
      selection={selection}
      onSelect={onSelect}
      onTriggerEvent={onTriggerEvent}
      registerRef={registerRef}
      runtime={runtime}
      tier={tier}
    />
  ))

  switch (node.type) {
    case 'text':
    case 'heading':
      return createElement(htmlTagFor(node.type), commonProps, effectiveText)
    case 'button':
    case 'fab':
      return createElement('button', { ...commonProps, type: 'button' }, effectiveText)
    case 'image':
      return (
        <div {...commonProps} style={{ ...style, overflow: 'hidden' }}>
          {node.imageUrl ? (
            <img src={node.imageUrl} alt={effectiveText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-400">
              <Icons.Image size={28} />
            </div>
          )}
        </div>
      )
    case 'input':
      return (
        <input
          {...commonProps}
          placeholder={node.placeholder}
          readOnly={mode === 'edit'}
          value={mode === 'preview' ? override?.text ?? '' : undefined}
          onChange={() => onTriggerEvent?.(nodeId, 'inputChanged')}
        />
      )
    case 'toggle': {
      const on = mode === 'preview' ? previewToggle : false
      return (
        <div {...commonProps} style={{ ...style, background: on ? '#4f46e5' : '#dfe2ea', borderRadius: 999, position: 'relative', transition: 'background 0.15s' }}>
          <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      )
    }
    case 'icon':
      return (
        <div {...commonProps}>
          <IconGlyph name={effectiveText || 'star'} size={node.style.fontSize || 20} />
        </div>
      )
    case 'divider':
      return <hr {...commonProps} />
    case 'table':
      return (
        <table {...commonProps} style={{ ...style, borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {['Column 1', 'Column 2', 'Column 3'].map((c) => (
                <th key={c} style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #dfe2ea', fontSize: 13, color: '#545a72' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row}>
                {[1, 2, 3].map((col) => (
                  <td key={col} style={{ padding: 8, borderBottom: '1px solid #eef0f4', fontSize: 13 }}>
                    Row {row}, {col}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'bottomNav':
    case 'tabBar':
      return (
        <div {...commonProps} style={{ ...style, display: 'flex', flexDirection: 'row', borderTop: '1px solid #dfe2ea', background: node.style.background === 'transparent' ? '#ffffff' : node.style.background }}>
          {(node.navItems.length > 0 ? node.navItems : [{ id: '1', label: 'Home', icon: 'home', targetPageId: null }]).map((item) => (
            <div
              key={item.id}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px]"
              onClick={(e) => {
                e.stopPropagation()
                if (mode === 'edit') {
                  onSelect?.(nodeId, e.shiftKey)
                } else if (item.targetPageId) {
                  onTriggerEvent?.(nodeId, 'itemSelected', item.targetPageId)
                }
              }}
              style={{ color: node.style.color || '#545a72', cursor: 'pointer' }}
            >
              <IconGlyph name={item.icon || 'circle'} size={18} />
              {item.label}
            </div>
          ))}
        </div>
      )
    case 'modal':
      if (mode === 'preview') {
        return (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
            onClick={() => onTriggerEvent?.(nodeId, 'click')}
          >
            <div
              {...commonProps}
              style={{ ...style, position: 'static' }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        )
      }
      return createElement(htmlTagFor(node.type), commonProps, children)
    default:
      return createElement(htmlTagFor(node.type), commonProps, children)
  }
}
