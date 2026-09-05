import { useEffect, useRef } from 'react'
import { useProjectStore } from '../state/projectStore'
import { saveProjectToDb } from './db'

const DEBOUNCE_MS = 800

/** Debounced local autosave: whenever the project changes, persist it to
 * IndexedDB shortly afterwards and reflect the state as "Saved locally". */
export function useAutosave() {
  const project = useProjectStore((s) => s.project)
  const saveStatus = useProjectStore((s) => s.saveStatus)
  const setSaveStatus = useProjectStore((s) => s.setSaveStatus)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveStatus !== 'dirty') return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveProjectToDb(project)
      } finally {
        setSaveStatus('saved')
      }
    }, DEBOUNCE_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])
}
