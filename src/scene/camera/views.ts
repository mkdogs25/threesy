import type { Vec3 } from '../../types/scene'

export type CameraViewId = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

const DIST = 6

export const CAMERA_VIEWS: Record<CameraViewId, Vec3> = {
  front: [0, 1, DIST],
  back: [0, 1, -DIST],
  left: [-DIST, 1, 0],
  right: [DIST, 1, 0],
  top: [0, DIST, 0.01],
  bottom: [0, -DIST, 0.01],
}
