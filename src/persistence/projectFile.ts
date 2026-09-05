import type { ProjectData, ThreesyFile } from '../types/scene'
import { THREESY_FILE_VERSION } from '../types/scene'

export function serializeProject(project: ProjectData, assets: Record<string, string> = {}): string {
  const file: ThreesyFile = { version: THREESY_FILE_VERSION, project, assets }
  return JSON.stringify(file, null, 2)
}

export function downloadProjectFile(project: ProjectData, assets: Record<string, string> = {}) {
  const json = serializeProject(project, assets)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFileName(project.name)}.threesy`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function sanitizeFileName(name: string): string {
  return name.trim().replace(/[^a-z0-9\-_ ]/gi, '').replace(/\s+/g, '-') || 'threesy-project'
}

export class ThreesyFileParseError extends Error {}

export function parseProjectFile(json: string): ThreesyFile {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ThreesyFileParseError('Not valid JSON')
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('project' in data) ||
    typeof (data as ThreesyFile).project !== 'object'
  ) {
    throw new ThreesyFileParseError('Missing project data')
  }
  return data as ThreesyFile
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
