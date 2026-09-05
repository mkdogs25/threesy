import { useEffect, useRef } from 'react'
import { useWireframeStore } from '../state/wireframeStore'
import { saveWireframeToDb } from './db'

const DEBOUNCE_MS = 800

export function useWireframeAutosave() {
  const project = useWireframeStore((s) => s.project)
  const saveStatus = useWireframeStore((s) => s.saveStatus)
  const setSaveStatus = useWireframeStore((s) => s.setSaveStatus)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveStatus !== 'dirty') return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveWireframeToDb(project)
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
