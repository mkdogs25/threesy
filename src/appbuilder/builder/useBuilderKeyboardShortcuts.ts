import { useEffect } from 'react'
import { useAppBuilderStore } from '../project/appBuilderStore'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.tagName === 'SELECT'
}

export function useBuilderKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return
      const store = useAppBuilderStore.getState()
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (store.selection.length) store.duplicateComponents(store.selection)
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
          store.removeComponents(store.selection)
        }
        return
      }
      if (e.key === 'Escape') {
        store.clearSelection()
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
