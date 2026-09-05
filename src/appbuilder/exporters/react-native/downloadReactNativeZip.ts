import JSZip from 'jszip'
import type { AppBuilderProject } from '../../project/schema/types'
import { generateExpoProject } from './generateExpo'

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app'
}

export async function downloadReactNativeZip(project: AppBuilderProject) {
  const { files } = generateExpoProject(project)
  const zip = new JSZip()
  const root = zip.folder(slug(project.name))!
  for (const [path, content] of Object.entries(files)) root.file(path, content)
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(project.name)}-expo.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
