import type { WireframeFile, WireframeProject } from '../types/wireframe'
import { WIREFRAME_FILE_VERSION } from '../types/wireframe'
import { sanitizeFileName } from './projectFile'

export function downloadWireframeFile(project: WireframeProject) {
  const file: WireframeFile = { version: WIREFRAME_FILE_VERSION, project }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFileName(project.name)}.threesy-ui`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export class WireframeFileParseError extends Error {}

export function parseWireframeFile(json: string): WireframeFile {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new WireframeFileParseError('Not valid JSON')
  }
  if (typeof data !== 'object' || data === null || !('project' in data)) {
    throw new WireframeFileParseError('Missing project data')
  }
  return data as WireframeFile
}
