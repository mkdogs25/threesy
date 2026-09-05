import { useFrame } from '@react-three/fiber'
import { useTimelineStore } from '../../state/timelineStore'

export function TimelineTicker() {
  useFrame((_, delta) => {
    useTimelineStore.getState().tick(delta)
  })
  return null
}
