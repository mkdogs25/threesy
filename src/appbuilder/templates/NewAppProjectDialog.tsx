import { useState } from 'react'
import { Globe, Smartphone } from 'lucide-react'
import { Dialog } from '../../components/dialogs/Dialog'
import type { AppBuilderProject, AppTarget } from '../project/schema/types'
import { templatesFor } from './index'
import { TemplateThumb } from '../../components/library/TemplateThumb'

interface NewAppProjectDialogProps {
  onClose: () => void
  onCreate: (project: AppBuilderProject) => void
}

export function NewAppProjectDialog({ onClose, onCreate }: NewAppProjectDialogProps) {
  const [target, setTarget] = useState<AppTarget | null>(null)

  if (!target) {
    return (
      <Dialog title="What are you building?" onClose={onClose} width="max-w-2xl">
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
            <span className="text-xs text-ink-500">Create applications designed primarily for browsers.</span>
            <span className="text-[11px] text-ink-400">Websites, dashboards, web tools, portfolios, interactive applications</span>
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
            <span className="text-xs text-ink-500">Create applications designed for phones.</span>
            <span className="text-[11px] text-ink-400">To-do apps, notes apps, productivity apps, social-style interfaces, simple utilities</span>
          </button>
        </div>
      </Dialog>
    )
  }

  const templates = templatesFor(target)

  return (
    <Dialog title={target === 'web' ? 'Choose a Web template' : 'Choose a Phone template'} onClose={onClose} width="max-w-3xl">
      <button type="button" onClick={() => setTarget(null)} className="mb-3 text-[11px] font-medium text-ink-400 hover:text-ink-600">
        ← Back
      </button>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onCreate(t.build())}
            className="panel group flex flex-col overflow-hidden text-left transition-transform hover:-translate-y-0.5"
          >
            <TemplateThumb accent={t.accent} />
            <div className="p-2.5">
              <p className="text-xs font-semibold text-ink-800">{t.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-400">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
