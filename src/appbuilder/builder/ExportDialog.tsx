import { useState } from 'react'
import { FileCode2, FileJson, FileType2 } from 'lucide-react'
import { Dialog } from '../../components/dialogs/Dialog'
import { useAppBuilderStore } from '../project/appBuilderStore'
import { downloadHtmlZip } from '../exporters/html/downloadZip'
import { downloadProjectJson } from '../project/persistence/projectFile'
import { downloadFlaskZip } from '../exporters/python/downloadFlaskZip'
import { downloadReactZip } from '../exporters/react/downloadReactZip'
import { downloadReactNativeZip } from '../exporters/react-native/downloadReactNativeZip'

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const project = useAppBuilderStore((s) => s.project)
  const [busy, setBusy] = useState<string | null>(null)

  async function run(id: string, fn: () => Promise<void> | void) {
    setBusy(id)
    try {
      await fn()
      onClose()
    } finally {
      setBusy(null)
    }
  }

  const options = [
    { id: 'html', label: 'Web (HTML/CSS/JS)', hint: 'A deployable static site', icon: FileCode2, run: () => downloadHtmlZip(project), always: true },
    { id: 'react', label: 'React', hint: 'A basic React + Vite project', icon: FileCode2, run: () => downloadReactZip(project), always: true },
    {
      id: 'python',
      label: project.target === 'web' ? 'Python (Flask)' : 'Python (Flask backend)',
      hint: project.target === 'web' ? 'Serves your pages from a Flask app' : 'A backend starter — not a native mobile UI',
      icon: FileType2,
      run: () => downloadFlaskZip(project),
      always: true,
    },
    {
      id: 'rn',
      label: 'React Native / Expo',
      hint: 'A simplified Expo project mapping your screens',
      icon: FileCode2,
      run: () => downloadReactNativeZip(project),
      always: project.target === 'mobile',
    },
    { id: 'json', label: 'Project File', hint: 'Full editable project JSON', icon: FileJson, run: () => downloadProjectJson(project), always: true },
  ].filter((o) => o.always)

  return (
    <Dialog title="Export" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={busy !== null}
            onClick={() => run(opt.id, opt.run)}
            className="flex flex-col items-start gap-1 rounded-xl border border-ink-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50/50 disabled:opacity-50"
          >
            <opt.icon size={18} className="text-brand-600" />
            <span className="text-xs font-semibold text-ink-800">{busy === opt.id ? 'Preparing…' : opt.label}</span>
            <span className="text-[10.5px] text-ink-400">{opt.hint}</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
