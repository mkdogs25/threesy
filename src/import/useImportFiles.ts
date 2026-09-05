import { useCallback } from 'react'
import { useProjectStore } from '../state/projectStore'
import { useUIStore } from '../state/uiStore'
import { importFileToObject, ImportError } from './importFile'

export function useImportFiles() {
  const insertObject = useProjectStore((s) => s.insertObject)
  const commit = useProjectStore((s) => s.commit)
  const showError = useUIStore((s) => s.showError)

  return useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      commit()
      let offset = 0
      for (const file of files) {
        try {
          const object = await importFileToObject(file)
          object.position = [object.position[0] + offset, object.position[1], object.position[2]]
          insertObject(object)
          offset += 1.2
        } catch (err) {
          showError(
            "Couldn't import this file",
            err instanceof ImportError ? err.message : `"${file.name}" appears to be invalid or unsupported.`,
          )
        }
      }
    },
    [insertObject, commit, showError],
  )
}
