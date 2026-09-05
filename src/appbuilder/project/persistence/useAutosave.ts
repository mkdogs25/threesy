import { useEffect, useRef } from 'react'
import { useAppBuilderStore } from '../appBuilderStore'
import { saveAppBuilderProject } from './db'

const DEBOUNCE_MS = 800

export function useAppBuilderAutosave() {
  const project = useAppBuilderStore((s) => s.project)
  const saveStatus = useAppBuilderStore((s) => s.saveStatus)
  const setSaveStatus = useAppBuilderStore((s) => s.setSaveStatus)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveStatus !== 'dirty') return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveAppBuilderProject(project)
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
