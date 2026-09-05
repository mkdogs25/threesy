import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { getRenderContext } from './exportRegistry'
import { sanitizeFileName } from '../persistence/projectFile'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export class ExportError extends Error {}

export async function exportGLB(projectName: string): Promise<void> {
  const ctx = getRenderContext()
  if (!ctx) throw new ExportError('The 3D view is not ready yet')
  const exporter = new GLTFExporter()
  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(ctx.scene, (result) => resolve(result as ArrayBuffer), (err) => reject(err), { binary: true })
  })
  downloadBlob(new Blob([glb], { type: 'model/gltf-binary' }), `${sanitizeFileName(projectName)}.glb`)
}

export async function exportGLTF(projectName: string): Promise<void> {
  const ctx = getRenderContext()
  if (!ctx) throw new ExportError('The 3D view is not ready yet')
  const exporter = new GLTFExporter()
  const json = await new Promise<object>((resolve, reject) => {
    exporter.parse(ctx.scene, (result) => resolve(result as object), (err) => reject(err), { binary: false })
  })
  downloadBlob(new Blob([JSON.stringify(json)], { type: 'application/json' }), `${sanitizeFileName(projectName)}.gltf`)
}

export function exportOBJ(projectName: string): void {
  const ctx = getRenderContext()
  if (!ctx) throw new ExportError('The 3D view is not ready yet')
  const exporter = new OBJExporter()
  const obj = exporter.parse(ctx.scene)
  downloadBlob(new Blob([obj], { type: 'text/plain' }), `${sanitizeFileName(projectName)}.obj`)
}

export type ImageFormat = 'png' | 'jpg' | 'webp'

export function exportImage(projectName: string, format: ImageFormat): void {
  const ctx = getRenderContext()
  if (!ctx) throw new ExportError('The 3D view is not ready yet')
  ctx.gl.render(ctx.scene, ctx.camera)
  const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
  const dataUrl = ctx.gl.domElement.toDataURL(mime, 0.92)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${sanitizeFileName(projectName)}.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
