import { FilePlus2, FolderOpen, LayoutTemplate, Sparkles, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Logo } from '../common/Logo'
import { useAppStore } from '../../state/appStore'
import { useProjectStore } from '../../state/projectStore'
import { useWireframeStore } from '../../state/wireframeStore'
import { useUIStore } from '../../state/uiStore'
import { useRecentProjects } from '../../persistence/useRecentProjects'
import { useRecentWireframes } from '../../persistence/useRecentWireframes'
import { createEmptyProject } from '../../types/factories'
import { createEmptyWireframeProject } from '../../types/wireframeFactories'
import { parseProjectFile, readFileAsText, ThreesyFileParseError } from '../../persistence/projectFile'
import { TEMPLATES } from '../../templates'
import { TemplateThumb } from '../library/TemplateThumb'
import { ThemeToggle } from '../common/ThemeToggle'

const IMPORT_ACCEPT = '.glb,.gltf,.obj,.fbx,.stl,.svg,.png,.jpg,.jpeg,.webp'

export function WelcomeScreen() {
  const { projects, loading, remove } = useRecentProjects()
  const { projects: wireframes, loading: wireframesLoading, remove: removeWireframe } = useRecentWireframes()
  const loadProject = useProjectStore((s) => s.loadProject)
  const loadWireframeProject = useWireframeStore((s) => s.loadProject)
  const goToEditor = useAppStore((s) => s.goToEditor)
  const goToWireframe = useAppStore((s) => s.goToWireframe)
  const showError = useUIStore((s) => s.showError)
  const openFileInput = useRef<HTMLInputElement>(null)
  const importFileInput = useRef<HTMLInputElement>(null)

  function handleNewMockup() {
    loadWireframeProject(createEmptyWireframeProject())
    goToWireframe()
  }

  function handleOpenRecentMockup(id: string) {
    const project = wireframes.find((p) => p.id === id)
    if (!project) return
    loadWireframeProject(project)
    goToWireframe()
  }

  function handleNewProject() {
    loadProject(createEmptyProject())
    goToEditor()
  }

  function handleTemplate(id: string) {
    const template = TEMPLATES.find((t) => t.id === id)
    if (!template) return
    loadProject(template.build())
    goToEditor()
  }

  async function handleOpenFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const parsed = parseProjectFile(text)
      loadProject(parsed.project)
      goToEditor()
    } catch (err) {
      showError(
        "Couldn't open this project",
        err instanceof ThreesyFileParseError
          ? 'The file appears to be invalid or unsupported.'
          : 'Something went wrong while reading this file.',
      )
    }
  }

  function handleImportModel(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    e.target.value = ''
    if (!files || files.length === 0) return
    loadProject(createEmptyProject('Imported Scene'))
    goToEditor(Array.from(files))
  }

  async function handleOpenRecent(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    loadProject(project)
    goToEditor()
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-gradient-to-b from-ink-50 to-brand-50/40 dark:to-brand-900/25">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center">
        <div className="mb-6 rounded-3xl bg-surface p-5 shadow-[0_4px_24px_-8px_rgba(76,90,220,0.35)] animate-scale-in">
          <Logo size={72} animated />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Make something 3D.</h1>
        <p className="mt-3 text-lg text-ink-500">Three dimensions. Zero headaches.</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNewProject}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-transform hover:-translate-y-0.5 hover:bg-brand-700"
          >
            <FilePlus2 size={17} /> New Project
          </button>
          <button
            type="button"
            onClick={() => openFileInput.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <FolderOpen size={17} /> Open Project
          </button>
          <button
            type="button"
            onClick={() => importFileInput.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Upload size={17} /> Import 3D Model
          </button>
          <input ref={openFileInput} type="file" accept=".threesy,application/json" onChange={handleOpenFile} className="hidden" />
          <input ref={importFileInput} type="file" accept={IMPORT_ACCEPT} multiple onChange={handleImportModel} className="hidden" />
        </div>

        {!loading && projects.length > 0 && (
          <section className="mt-16 w-full text-left">
            <h2 className="mb-4 text-sm font-semibold text-ink-500">Recent Projects</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {projects.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="group panel relative cursor-pointer overflow-hidden p-3 text-left transition-transform hover:-translate-y-0.5"
                  onClick={() => handleOpenRecent(p.id)}
                >
                  <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-ink-100">
                    <Logo size={28} />
                  </div>
                  <p className="truncate text-xs font-semibold text-ink-800">{p.name}</p>
                  <p className="text-[11px] text-ink-400">{new Date(p.updatedAt).toLocaleDateString()}</p>
                  <button
                    type="button"
                    aria-label={`Delete ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(p.id)
                    }}
                    className="btn-icon absolute right-2 top-2 h-6 w-6 bg-surface/90 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 w-full text-left">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-500">
            <Sparkles size={14} /> Templates
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplate(t.id)}
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
        </section>

        <section className="mt-16 w-full rounded-3xl border border-dashed border-ink-300 bg-surface/60 p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <LayoutTemplate size={20} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink-800">UI Mockups</h2>
                <p className="text-[11px] text-ink-400">
                  Sketch screens and flows in 2D — wireframes with connections, no 3D required.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNewMockup}
              className="flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-ink-800"
            >
              <FilePlus2 size={16} /> New UI Mockup
            </button>
          </div>

          {!wireframesLoading && wireframes.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {wireframes.slice(0, 8).map((w) => (
                <div
                  key={w.id}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-ink-200 bg-surface p-3 text-left transition-transform hover:-translate-y-0.5"
                  onClick={() => handleOpenRecentMockup(w.id)}
                >
                  <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-ink-100">
                    <LayoutTemplate size={20} className="text-ink-400" />
                  </div>
                  <p className="truncate text-xs font-semibold text-ink-800">{w.name}</p>
                  <p className="text-[11px] text-ink-400">{new Date(w.updatedAt).toLocaleDateString()}</p>
                  <button
                    type="button"
                    aria-label={`Delete ${w.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeWireframe(w.id)
                    }}
                    className="btn-icon absolute right-2 top-2 h-6 w-6 bg-surface/90 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
