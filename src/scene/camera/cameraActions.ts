import type { CameraViewId } from './views'

interface Actions {
  frameSelected: () => void
  setView: (id: CameraViewId) => void
}

let current: Actions | null = null

export function registerCameraActions(actions: Actions | null) {
  current = actions
}

export function frameSelected() {
  current?.frameSelected()
}

export function setCameraView(id: CameraViewId) {
  current?.setView(id)
}
