import type { AppBuilderFile, AppBuilderProject } from '../schema/types'
import { APPBUILDER_FILE_VERSION } from '../schema/types'

function sanitizeFileName(name: string): string {
  return name.trim().replace(/[^a-z0-9\-_ ]/gi, '').replace(/\s+/g, '-') || 'app-project'
}

export function downloadProjectJson(project: AppBuilderProject) {
  const file: AppBuilderFile = { version: APPBUILDER_FILE_VERSION, project }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFileName(project.name)}.threesy-app.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export class AppBuilderFileParseError extends Error {}

export function parseProjectFile(json: string): AppBuilderFile {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new AppBuilderFileParseError('Not valid JSON')
  }
  if (typeof data !== 'object' || data === null || !('project' in data)) {
    throw new AppBuilderFileParseError('Missing project data')
  }
  return data as AppBuilderFile
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
