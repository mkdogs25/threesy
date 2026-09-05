import { useEffect } from 'react'
import { useWireframeStore } from '../state/wireframeStore'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export function useWireframeKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return
      const store = useWireframeStore.getState()
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (store.selection.length) store.duplicateNodes(store.selection)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selection.length) {
          e.preventDefault()
          store.removeNodes(store.selection)
        }
        return
      }
      if (e.key === 'Escape') {
        store.clearSelection()
        store.cancelConnection()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
