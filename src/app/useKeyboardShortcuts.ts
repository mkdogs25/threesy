import { useEffect } from 'react'
import { useProjectStore } from '../state/projectStore'
import { useUIStore } from '../state/uiStore'
import { downloadProjectFile } from '../persistence/projectFile'
import { frameSelected } from '../scene/camera/cameraActions'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.tagName === 'SELECT'
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useUIStore.getState().setCommandPaletteOpen(true)
        return
      }

      if (isTypingTarget(e.target)) return

      const store = useProjectStore.getState()

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (store.selection.length) store.duplicateObjects(store.selection)
        return
      }
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        downloadProjectFile(store.project)
        return
      }
      if (meta && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        store.groupSelection()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selection.length) {
          e.preventDefault()
          store.removeObjects(store.selection)
        }
        return
      }
      if (e.key.toLowerCase() === 'w') {
        store.setTransformMode('move')
        return
      }
      if (e.key.toLowerCase() === 'e') {
        store.setTransformMode('rotate')
        return
      }
      if (e.key.toLowerCase() === 'r') {
        store.setTransformMode('scale')
        return
      }
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        frameSelected()
        return
      }
      if (e.key === 'Escape') {
        store.clearSelection()
        useUIStore.getState().closeContextMenu()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
