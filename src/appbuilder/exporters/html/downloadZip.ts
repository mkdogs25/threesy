import JSZip from 'jszip'
import type { AppBuilderProject } from '../../project/schema/types'
import { generateHtmlProject } from './generateProject'

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app'
}

async function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function downloadHtmlZip(project: AppBuilderProject) {
  const { html, css, js } = generateHtmlProject(project)
  const zip = new JSZip()
  const root = zip.folder(slug(project.name))!
  for (const [filename, content] of Object.entries(html)) root.file(filename, content)
  root.file('style.css', css)
  root.file('script.js', js)
  const blob = await zip.generateAsync({ type: 'blob' })
  await triggerDownload(blob, `${slug(project.name)}.zip`)
}
