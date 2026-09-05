import JSZip from 'jszip'
import type { UploadedHtmlFile } from './htmlImport'

export interface ResolvedUpload {
  htmlFiles: UploadedHtmlFile[]
  css: string
}

function baseName(path: string): string {
  return path.split('/').pop() ?? path
}

/** Folder upload (`<input webkitdirectory>`) or a plain multi-file select —
 * either way the browser hands us a flat FileList. */
export async function resolveFileList(files: File[]): Promise<ResolvedUpload> {
  const htmlFiles: UploadedHtmlFile[] = []
  const cssParts: string[] = []
  for (const file of files) {
    const lower = file.name.toLowerCase()
    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      htmlFiles.push({ name: baseName(file.name), html: await file.text() })
    } else if (lower.endsWith('.css')) {
      cssParts.push(await file.text())
    }
  }
  return { htmlFiles, css: cssParts.join('\n\n') }
}

/** A .zip of a code folder — unpacked in-browser, same file-type rules as
 * resolveFileList. Assets other than .html/.css (images, JS) are ignored:
 * images keep whatever absolute/remote URL they already had, and scripts
 * are never imported (see htmlImport.ts). */
export async function resolveZipFile(file: File): Promise<ResolvedUpload> {
  const zip = await JSZip.loadAsync(file)
  const htmlFiles: UploadedHtmlFile[] = []
  const cssParts: string[] = []
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue
    const lower = path.toLowerCase()
    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      htmlFiles.push({ name: baseName(path), html: await entry.async('text') })
    } else if (lower.endsWith('.css')) {
      cssParts.push(await entry.async('text'))
    }
  }
  return { htmlFiles, css: cssParts.join('\n\n') }
}
