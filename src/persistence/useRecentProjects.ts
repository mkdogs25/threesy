import { useCallback, useEffect, useState } from 'react'
import type { ProjectData } from '../types/scene'
import { deleteProject, listProjects } from './db'

export function useRecentProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listProjects()
      setProjects(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    async (id: string) => {
      await deleteProject(id)
      await refresh()
    },
    [refresh],
  )

  return { projects, loading, refresh, remove }
}
