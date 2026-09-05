import { useAppStore } from './state/appStore'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { Editor } from './app/Editor'
import { WireframeEditor } from './components/wireframe/WireframeEditor'

export default function App() {
  const view = useAppStore((s) => s.view)

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink-50">
      {view === 'welcome' && <WelcomeScreen />}
      {view === 'editor' && <Editor />}
      {view === 'wireframe' && <WireframeEditor />}
    </div>
  )
}
