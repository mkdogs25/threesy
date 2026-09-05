import { useCallback, useEffect, useState } from 'react'
import type { WireframeProject } from '../types/wireframe'
import { deleteWireframe, listWireframes } from './db'

export function useRecentWireframes() {
  const [projects, setProjects] = useState<WireframeProject[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setProjects(await listWireframes())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    async (id: string) => {
      await deleteWireframe(id)
      await refresh()
    },
    [refresh],
  )

  return { projects, loading, refresh, remove }
}
