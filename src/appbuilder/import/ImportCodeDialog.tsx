import { useRef, useState } from 'react'
import { FileCode2, FolderUp, Globe, Smartphone } from 'lucide-react'
import { Dialog } from '../../components/dialogs/Dialog'
import type { AppBuilderProject, AppTarget } from '../project/schema/types'
import { importCodeAsProject } from './htmlImport'
import { resolveFileList, resolveZipFile, type ResolvedUpload } from './resolveUploadedFiles'

interface ImportCodeDialogProps {
  onClose: () => void
  onImport: (project: AppBuilderProject) => void
}

export function ImportCodeDialog({ onClose, onImport }: ImportCodeDialogProps) {
  const [target, setTarget] = useState<AppTarget | null>(null)
  const [resolved, setResolved] = useState<ResolvedUpload | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const folderInput = useRef<HTMLInputElement>(null)
  const zipInput = useRef<HTMLInputElement>(null)

  if (!target) {
    return (
      <Dialog title="Import existing code" onClose={onClose} width="max-w-2xl">
        <p className="mb-3 text-[11px] text-ink-400">First, which kind of app is this?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTarget('web')}
            className="flex flex-col items-start gap-2 rounded-2xl border border-ink-200 p-5 text-left hover:border-brand-400 hover:bg-brand-50/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Globe size={22} />
            </span>
            <span className="text-sm font-semibold text-ink-800">🌐 Web App</span>
            <span className="text-xs text-ink-500">HTML/CSS built for a browser.</span>
          </button>
          <button
            type="button"
            onClick={() => setTarget('mobile')}
            className="flex flex-col items-start gap-2 rounded-2xl border border-ink-200 p-5 text-left hover:border-brand-400 hover:bg-brand-50/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Smartphone size={22} />
            </span>
            <span className="text-sm font-semibold text-ink-800">📱 Phone App</span>
            <span className="text-xs text-ink-500">HTML/CSS meant to look like a phone screen.</span>
          </button>
        </div>
      </Dialog>
    )
  }

  async function handleFiles(fn: () => Promise<ResolvedUpload>) {
    setError(null)
    try {
      const result = await fn()
      if (result.htmlFiles.length === 0) {
        setError('No .html file was found in that upload.')
        return
      }
      setResolved(result)
      if (!name) setName(target === 'web' ? 'Imported Web App' : 'Imported Phone App')
    } catch {
      setError("Couldn't read that upload — check it's a folder or .zip of HTML/CSS files.")
    }
  }

  async function handleImport() {
    if (!resolved || !target) return
    setBusy(true)
    setError(null)
    try {
      const project = await importCodeAsProject(target, name || 'Imported App', resolved.htmlFiles, resolved.css)
      onImport(project)
    } catch {
      setError("Something went wrong importing that code. Try a smaller page, or check the HTML is well-formed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog title="Import existing code" onClose={onClose} width="max-w-lg">
      <button type="button" onClick={() => setTarget(null)} className="mb-3 text-[11px] font-medium text-ink-400 hover:text-ink-600">
        ← Back
      </button>

      {!resolved ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => folderInput.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-300 p-6 text-center hover:border-brand-400 hover:bg-brand-50/40"
            >
              <FolderUp size={22} className="text-brand-600" />
              <span className="text-xs font-semibold text-ink-800">Upload a folder</span>
              <span className="text-[10.5px] text-ink-400">index.html + style.css</span>
            </button>
            <button
              type="button"
              onClick={() => zipInput.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-300 p-6 text-center hover:border-brand-400 hover:bg-brand-50/40"
            >
              <FileCode2 size={22} className="text-brand-600" />
              <span className="text-xs font-semibold text-ink-800">Upload a .zip</span>
              <span className="text-[10.5px] text-ink-400">A zipped code folder</span>
            </button>
          </div>
          <input
            ref={folderInput}
            type="file"
            multiple
            // @ts-expect-error non-standard but widely supported folder-select attribute
            webkitdirectory=""
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(() => resolveFileList(Array.from(e.target.files!)))}
          />
          <input
            ref={zipInput}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFiles(() => resolveZipFile(e.target.files![0]))}
          />
          <p className="mt-3 text-[11px] text-ink-400">
            Layout, text, colours, and fonts are imported. Scripts and interactions aren't — you can add those back afterward with the
            Interaction panel or the command bar.
          </p>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-ink-200 p-3 text-xs text-ink-600">
            Found {resolved.htmlFiles.length} page{resolved.htmlFiles.length === 1 ? '' : 's'}
            {resolved.css ? ' and a stylesheet' : ''}:
            <ul className="mt-1.5 list-disc pl-4 text-ink-500">
              {resolved.htmlFiles.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          </div>
          <label className="mt-3 flex flex-col gap-1 text-xs">
            <span className="text-ink-500">Project name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm"
            />
          </label>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setResolved(null)} className="text-[11px] font-medium text-ink-400 hover:text-ink-600">
              Choose different files
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={busy}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? 'Importing…' : 'Import'}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-3 text-[11px] text-red-600">{error}</p>}
    </Dialog>
  )
}
