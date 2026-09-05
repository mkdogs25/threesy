import { create } from 'zustand'

interface TimelineState {
  currentTime: number
  isPlaying: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  setTime: (t: number) => void
  tick: (dt: number) => void
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set({ isPlaying: !get().isPlaying }),
  setTime: (t) => set({ currentTime: Math.max(0, t) }),
  tick: (dt) => {
    if (!get().isPlaying) return
    set({ currentTime: get().currentTime + dt })
  },
}))
