import { Box, Grid3x3, Maximize2 } from 'lucide-react'
import { useProjectStore } from '../../state/projectStore'
import { frameSelected, setCameraView } from '../../scene/camera/cameraActions'
import { IconButton } from '../common/IconButton'
import type { CameraViewId } from '../../scene/camera/views'

const VIEWS: { id: CameraViewId; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
]

export function ViewportOverlay() {
  const environment = useProjectStore((s) => s.project.environment)
  const updateEnvironment = useProjectStore((s) => s.updateEnvironment)

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pointer-events-auto absolute left-3 top-3 flex flex-col gap-1 rounded-xl bg-white/90 p-1 shadow-md backdrop-blur">
        <IconButton label="Frame Selected" shortcut="F" onClick={() => frameSelected()}>
          <Maximize2 size={16} />
        </IconButton>
        <IconButton
          label={environment.orthographic ? 'Switch to Perspective' : 'Switch to Orthographic'}
          active={environment.orthographic}
          onClick={() => updateEnvironment({ orthographic: !environment.orthographic })}
        >
          <Box size={16} />
        </IconButton>
        <IconButton
          label="Toggle Grid"
          active={environment.showGrid}
          onClick={() => updateEnvironment({ showGrid: !environment.showGrid })}
        >
          <Grid3x3 size={16} />
        </IconButton>
      </div>

      <div className="pointer-events-auto absolute bottom-3 left-3 flex gap-1 rounded-xl bg-white/90 p-1 text-[11px] font-medium text-ink-600 shadow-md backdrop-blur">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setCameraView(v.id)}
            className="rounded-lg px-2 py-1 hover:bg-ink-100"
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
