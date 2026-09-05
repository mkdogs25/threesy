import { create } from 'zustand'

export type AppView = 'welcome' | 'editor' | 'appbuilder'

interface AppState {
  view: AppView
  pendingImportFiles: File[] | null
  goToWelcome: () => void
  goToEditor: (pendingImportFiles?: File[]) => void
  goToAppBuilder: () => void
  clearPendingImportFiles: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'welcome',
  pendingImportFiles: null,
  goToWelcome: () => set({ view: 'welcome' }),
  goToEditor: (pendingImportFiles) => set({ view: 'editor', pendingImportFiles: pendingImportFiles ?? null }),
  goToAppBuilder: () => set({ view: 'appbuilder' }),
  clearPendingImportFiles: () => set({ pendingImportFiles: null }),
}))
