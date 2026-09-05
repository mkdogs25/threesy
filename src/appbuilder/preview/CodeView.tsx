import { useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { useAppBuilderStore } from '../project/appBuilderStore'
import { generateHtmlProject } from '../exporters/html/generateProject'
import { useThemeStore } from '../../state/themeStore'

type Tab = { id: string; label: string; lang: 'html' | 'css' | 'js'; content: string }

export function CodeView() {
  const project = useAppBuilderStore((s) => s.project)
  const isDark = useThemeStore((s) => s.isDark)
  const generated = useMemo(() => generateHtmlProject(project), [project])
  const htmlFiles = Object.keys(generated.html)
  const [activeTab, setActiveTab] = useState(htmlFiles[0])

  const tabs: Tab[] = [
    ...htmlFiles.map((filename) => ({ id: filename, label: filename, lang: 'html' as const, content: generated.html[filename] })),
    { id: 'style.css', label: 'style.css', lang: 'css' as const, content: generated.css },
    { id: 'script.js', label: 'script.js', lang: 'js' as const, content: generated.js },
  ]
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0]
  const extensions = active.lang === 'html' ? [html()] : active.lang === 'css' ? [css()] : [javascript()]

  return (
    <div className="panel flex h-full w-full flex-col overflow-hidden">
      <div className="flex gap-1 overflow-x-auto border-b border-ink-100 p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab.id === active.id ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror value={active.content} height="100%" theme={isDark ? 'dark' : 'light'} extensions={extensions} editable={false} basicSetup={{ lineNumbers: true, foldGutter: true }} />
      </div>
    </div>
  )
}
