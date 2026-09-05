import type { InteractionAction } from '../../types/scene'
import { useTimelineStore } from '../../state/timelineStore'

/** Executes the "one-shot" side effects of an interaction action. Continuous
 * effects (rotate/move/scale/colorChange while hovered or activated) are
 * handled directly inside ObjectMesh's per-frame update. */
export function runInteractionAction(action: InteractionAction, _objectId: string) {
  switch (action.type) {
    case 'playAnimation':
      useTimelineStore.getState().setTime(0)
      useTimelineStore.getState().play()
      break
    case 'openUrl':
      window.open(action.url, '_blank', 'noopener,noreferrer')
      break
    default:
      break
  }
}
