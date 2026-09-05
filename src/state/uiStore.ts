import { create } from 'zustand'

export type ActivePanel = 'library' | 'hierarchy'

interface UIState {
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  leftPanel: ActivePanel
  setLeftPanel: (panel: ActivePanel) => void

  timelineOpen: boolean
  setTimelineOpen: (open: boolean) => void

  contextMenu: { x: number; y: number; objectId: string } | null
  openContextMenu: (x: number, y: number, objectId: string) => void
  closeContextMenu: () => void

  errorDialog: { title: string; message: string } | null
  showError: (title: string, message: string) => void
  clearError: () => void

  exportDialogOpen: boolean
  setExportDialogOpen: (open: boolean) => void

  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  snapEnabled: boolean
  toggleSnap: () => void

  previewMode: boolean
  setPreviewMode: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  leftPanel: 'library',
  setLeftPanel: (panel) => set({ leftPanel: panel }),

  timelineOpen: false,
  setTimelineOpen: (open) => set({ timelineOpen: open }),

  contextMenu: null,
  openContextMenu: (x, y, objectId) => set({ contextMenu: { x, y, objectId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  errorDialog: null,
  showError: (title, message) => set({ errorDialog: { title, message } }),
  clearError: () => set({ errorDialog: null }),

  exportDialogOpen: false,
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),

  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  snapEnabled: false,
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  previewMode: false,
  setPreviewMode: (v) => set({ previewMode: v }),
}))
