import { create } from 'zustand'

export type AppView = 'welcome' | 'editor' | 'wireframe'

interface AppState {
  view: AppView
  pendingImportFiles: File[] | null
  goToWelcome: () => void
  goToEditor: (pendingImportFiles?: File[]) => void
  goToWireframe: () => void
  clearPendingImportFiles: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'welcome',
  pendingImportFiles: null,
  goToWelcome: () => set({ view: 'welcome' }),
  goToEditor: (pendingImportFiles) => set({ view: 'editor', pendingImportFiles: pendingImportFiles ?? null }),
  goToWireframe: () => set({ view: 'wireframe' }),
  clearPendingImportFiles: () => set({ pendingImportFiles: null }),
}))
