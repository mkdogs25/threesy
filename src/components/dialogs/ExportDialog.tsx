import { Download, Image as ImageIcon, FileBox, FileJson } from 'lucide-react'
import { useState } from 'react'
import { Dialog } from './Dialog'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { downloadProjectFile } from '../../persistence/projectFile'
import { exportGLB, exportGLTF, exportImage, exportOBJ, ExportError } from '../../export/exportScene'

type ExportKind = 'threesy' | 'glb' | 'gltf' | 'obj' | 'png' | 'jpg' | 'webp'

const OPTIONS: { id: ExportKind; label: string; hint: string; icon: typeof Download }[] = [
  { id: 'threesy', label: '.threesy Project', hint: 'Full editable project file', icon: FileJson },
  { id: 'glb', label: 'GLB', hint: 'Single-file 3D model', icon: FileBox },
  { id: 'gltf', label: 'GLTF', hint: 'Text-based 3D model', icon: FileBox },
  { id: 'obj', label: 'OBJ', hint: 'Universal mesh format', icon: FileBox },
  { id: 'png', label: 'PNG', hint: 'Transparent-capable image', icon: ImageIcon },
  { id: 'jpg', label: 'JPG', hint: 'Compressed image', icon: ImageIcon },
  { id: 'webp', label: 'WebP', hint: 'Modern compressed image', icon: ImageIcon },
]

export function ExportDialog() {
  const setOpen = useUIStore((s) => s.setExportDialogOpen)
  const showError = useUIStore((s) => s.showError)
  const project = useProjectStore((s) => s.project)
  const [busy, setBusy] = useState<ExportKind | null>(null)

  async function handleExport(kind: ExportKind) {
    setBusy(kind)
    try {
      if (kind === 'threesy') downloadProjectFile(project)
      else if (kind === 'glb') await exportGLB(project.name)
      else if (kind === 'gltf') await exportGLTF(project.name)
      else if (kind === 'obj') exportOBJ(project.name)
      else exportImage(project.name, kind)
      setOpen(false)
    } catch (err) {
      showError("Couldn't export this project", err instanceof ExportError ? err.message : 'Something went wrong while exporting.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog title="Export" onClose={() => setOpen(false)}>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={busy !== null}
            onClick={() => handleExport(opt.id)}
            className="flex flex-col items-start gap-1 rounded-xl border border-ink-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50/50 disabled:opacity-50"
          >
            <opt.icon size={18} className="text-brand-600" />
            <span className="text-xs font-semibold text-ink-800">{opt.label}</span>
            <span className="text-[10.5px] text-ink-400">{opt.hint}</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
