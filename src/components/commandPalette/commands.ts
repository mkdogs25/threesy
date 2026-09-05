import type { LucideIcon } from 'lucide-react'
import {
  Box,
  Circle,
  Copy,
  Cylinder,
  Download,
  FolderOpen,
  Grid3x3,
  Group,
  Maximize2,
  Redo2,
  Save,
  Square,
  Type,
  Undo2,
} from 'lucide-react'
import { useAppStore } from '../../state/appStore'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { frameSelected } from '../../scene/camera/cameraActions'
import { downloadProjectFile } from '../../persistence/projectFile'
import { createEmptyProject } from '../../types/factories'

export interface Command {
  id: string
  label: string
  group: string
  icon: LucideIcon
  shortcut?: string
  run: () => void
}

export function useCommands(): Command[] {
  const addObject = useProjectStore((s) => s.addObject)
  const groupSelection = useProjectStore((s) => s.groupSelection)
  const duplicateObjects = useProjectStore((s) => s.duplicateObjects)
  const selection = useProjectStore((s) => s.selection)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const project = useProjectStore((s) => s.project)
  const loadProject = useProjectStore((s) => s.loadProject)
  const updateEnvironment = useProjectStore((s) => s.updateEnvironment)
  const environment = useProjectStore((s) => s.project.environment)
  const setExportDialogOpen = useUIStore((s) => s.setExportDialogOpen)
  const goToWelcome = useAppStore((s) => s.goToWelcome)

  const commands: Command[] = [
    { id: 'add-cube', label: 'Add Cube', group: 'Add', icon: Box, run: () => addObject('cube') },
    { id: 'add-rounded-cube', label: 'Add Rounded Cube', group: 'Add', icon: Box, run: () => addObject('roundedCube') },
    { id: 'add-sphere', label: 'Add Sphere', group: 'Add', icon: Circle, run: () => addObject('sphere') },
    { id: 'add-cylinder', label: 'Add Cylinder', group: 'Add', icon: Cylinder, run: () => addObject('cylinder') },
    { id: 'add-text', label: 'Add Text', group: 'Add', icon: Type, run: () => addObject('text') },
    { id: 'add-plane', label: 'Add Plane', group: 'Add', icon: Square, run: () => addObject('plane') },

    {
      id: 'group-selection',
      label: 'Group Selection',
      group: 'Edit',
      icon: Group,
      shortcut: 'Ctrl G',
      run: () => groupSelection(),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      group: 'Edit',
      icon: Copy,
      shortcut: 'Ctrl D',
      run: () => selection.length && duplicateObjects(selection),
    },
    { id: 'undo', label: 'Undo', group: 'Edit', icon: Undo2, shortcut: 'Ctrl Z', run: undo },
    { id: 'redo', label: 'Redo', group: 'Edit', icon: Redo2, shortcut: 'Ctrl Shift Z', run: redo },

    { id: 'frame-selected', label: 'Frame Selected', group: 'View', icon: Maximize2, shortcut: 'F', run: () => frameSelected() },
    {
      id: 'toggle-grid',
      label: 'Toggle Grid',
      group: 'View',
      icon: Grid3x3,
      run: () => updateEnvironment({ showGrid: !environment.showGrid }),
    },

    { id: 'save', label: 'Save to Computer', group: 'File', icon: Save, shortcut: 'Ctrl S', run: () => downloadProjectFile(project) },
    { id: 'export', label: 'Export…', group: 'File', icon: Download, run: () => setExportDialogOpen(true) },
    { id: 'new-project', label: 'New Project', group: 'File', icon: FolderOpen, run: () => loadProject(createEmptyProject()) },
    { id: 'go-home', label: 'Back to Welcome Screen', group: 'File', icon: FolderOpen, run: () => goToWelcome() },
  ]

  return commands
}
