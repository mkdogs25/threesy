import { useCallback, useEffect, useState } from 'react'
import type { AppBuilderProject } from '../schema/types'
import { deleteAppBuilderProject, listAppBuilderProjects } from './db'

export function useRecentAppBuilderProjects() {
  const [projects, setProjects] = useState<AppBuilderProject[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setProjects(await listAppBuilderProjects())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    async (id: string) => {
      await deleteAppBuilderProject(id)
      await refresh()
    },
    [refresh],
  )

  return { projects, loading, refresh, remove }
}
