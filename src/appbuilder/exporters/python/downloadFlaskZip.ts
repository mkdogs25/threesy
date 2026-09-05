import JSZip from 'jszip'
import type { AppBuilderProject } from '../../project/schema/types'
import { generateFlaskProject } from './generateFlask'

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app'
}

export async function downloadFlaskZip(project: AppBuilderProject) {
  const flask = generateFlaskProject(project)
  const zip = new JSZip()
  const root = zip.folder(slug(project.name))!
  root.file('app.py', flask.appPy)
  root.file('README.md', flask.readme)
  const templates = root.folder('templates')!
  for (const [filename, content] of Object.entries(flask.templates)) templates.file(filename, content)
  const staticFolder = root.folder('static')!
  staticFolder.file('style.css', flask.staticCss)
  staticFolder.file('script.js', flask.staticJs)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(project.name)}-flask.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
