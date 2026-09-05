import { useAppBuilderStore } from '../../project/appBuilderStore'
import type { ParsedCommand } from '../Parser/types'

export function applyCommand(command: ParsedCommand) {
  const store = useAppBuilderStore.getState()

  switch (command.kind) {
    case 'addComponent': {
      const page = store.project.pages.find((p) => p.id === store.project.activePageId)
      if (page) store.addComponent(command.componentType, page.rootId)
      break
    }
    case 'addPreset': {
      store.commit()
      const isLogin = command.preset === 'loginScreen'
      const pageId = store.addPage(isLogin ? 'Login' : 'Sign Up')
      const page = store.project.pages.find((p) => p.id === pageId)
      if (!page) break
      const rootId = page.rootId
      const headingId = store.addComponent('heading', rootId)
      store.updateComponent(headingId, { text: isLogin ? 'Welcome back' : 'Create your account' })
      const emailId = store.addComponent('input', rootId)
      store.updateComponent(emailId, { placeholder: 'Email' })
      const passwordId = store.addComponent('input', rootId)
      store.updateComponent(passwordId, { placeholder: 'Password' })
      if (!isLogin) {
        const confirmId = store.addComponent('input', rootId)
        store.updateComponent(confirmId, { placeholder: 'Confirm Password' })
      }
      const buttonId = store.addComponent('button', rootId)
      store.updateComponent(buttonId, { text: isLogin ? 'Log In' : 'Sign Up' })
      store.select(rootId)
      break
    }
    case 'changeStyle':
      store.commit()
      store.updateStyle(command.targetId, command.style)
      break
    case 'move': {
      store.commit()
      const target = store.project.nodes[command.targetId]
      const relativeTo = store.project.nodes[command.relativeToId]
      if (target && relativeTo && relativeTo.parentId) {
        const parent = store.project.nodes[relativeTo.parentId]
        const index = parent.children.indexOf(command.relativeToId)
        store.moveComponent(command.targetId, relativeTo.parentId, command.before ? index : index + 1)
      }
      break
    }
    case 'addInteraction':
      store.addEvent(command.targetId, command.trigger, { type: 'navigate', pageId: command.pageId })
      break
    case 'setResponsive':
      store.commit()
      for (const id of command.targetIds) {
        const node = store.project.nodes[id]
        if (!node) continue
        store.updateComponent(id, { responsive: { ...node.responsive, [command.tier]: command.behavior } })
      }
      break
  }
}
