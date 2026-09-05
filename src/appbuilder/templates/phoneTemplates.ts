import { buildTemplateProject, TreeBuilder } from './builderHelpers'
import type { AppBuilderProject } from '../project/schema/types'

export interface PhoneTemplateDef {
  id: string
  name: string
  description: string
  accent: string
  build: () => AppBuilderProject
}

function withBottomNav(b: TreeBuilder, root: string, items: string[]) {
  const nav = b.add('bottomNav', root)
  b.nodes[nav.id] = {
    ...b.nodes[nav.id],
    navItems: items.map((label, i) => ({ id: `${nav.id}-${i}`, label, icon: 'circle', targetPageId: null })),
  }
}

export const PHONE_TEMPLATES: PhoneTemplateDef[] = [
  {
    id: 'blank-app',
    name: 'Blank App',
    description: 'Start from an empty screen.',
    accent: '#6c8cff',
    build: () => buildTemplateProject('mobile', 'Blank App', () => {}),
  },
  {
    id: 'todo-phone',
    name: 'To-do App',
    description: 'A task list with a floating add button.',
    accent: '#22c55e',
    build: () =>
      buildTemplateProject('mobile', 'To-do App', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'My Tasks', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const list = b.add('list', root, { style: { padding: 16 } })
        ;['Buy groceries', 'Finish report', 'Walk the dog'].forEach((task) => {
          const item = b.add('listItem', list.id)
          b.add('toggle', item.id)
          b.add('text', item.id, { text: task })
        })
        b.add('fab', root)
        withBottomNav(b, root, ['Tasks', 'Calendar', 'Me'])
      }),
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'A list of notes with quick add.',
    accent: '#f59e0b',
    build: () =>
      buildTemplateProject('mobile', 'Notes', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'Notes', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const list = b.add('list', root, { style: { padding: 16 } })
        ;['Grocery list', 'Meeting notes', 'Book ideas'].forEach((title) => {
          const item = b.add('card', list.id)
          b.add('heading', item.id, { text: title, style: { fontSize: 15, fontWeight: 600 } })
          b.add('text', item.id, { text: 'Tap to edit this note…' })
        })
        b.add('fab', root)
      }),
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Track daily habits with toggles.',
    accent: '#8b5cf6',
    build: () =>
      buildTemplateProject('mobile', 'Habit Tracker', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'Habits', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const list = b.add('list', root, { style: { padding: 16 } })
        ;['Drink water', 'Read 10 pages', 'Exercise', 'Meditate'].forEach((habit) => {
          const item = b.add('listItem', list.id)
          b.add('text', item.id, { text: habit, width: 'fill' })
          b.add('toggle', item.id)
        })
        withBottomNav(b, root, ['Today', 'Progress', 'Me'])
      }),
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'A running list of expenses with a total.',
    accent: '#ef4444',
    build: () =>
      buildTemplateProject('mobile', 'Expense Tracker', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'Expenses', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const summary = b.add('card', root, { style: { padding: 20 } })
        b.add('text', summary.id, { text: 'This month' })
        b.add('heading', summary.id, { text: '$482.16', style: { fontSize: 28, fontWeight: 700 } })
        const list = b.add('list', root, { style: { padding: 16 } })
        ;[
          ['Groceries', '$64.20'],
          ['Rent', '$1,200.00'],
          ['Coffee', '$4.50'],
        ].forEach(([label, amount]) => {
          const item = b.add('listItem', list.id)
          b.add('text', item.id, { text: label, width: 'fill' })
          b.add('text', item.id, { text: amount, style: { fontWeight: 600 } })
        })
        b.add('fab', root)
      }),
  },
  {
    id: 'social',
    name: 'Social App',
    description: 'A feed of posts with a bottom nav.',
    accent: '#ec4899',
    build: () =>
      buildTemplateProject('mobile', 'Social App', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'Feed', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const list = b.add('list', root, { style: { padding: 16 } })
        for (let i = 1; i <= 2; i++) {
          const card = b.add('card', list.id)
          const header = b.add('row', card.id)
          b.add('text', header.id, { text: `User ${i}`, style: { fontWeight: 600 } })
          b.add('image', card.id, { width: 'fill', height: 160 })
          b.add('text', card.id, { text: 'A caption for this post goes here.' })
        }
        withBottomNav(b, root, ['Feed', 'Search', 'Profile'])
      }),
  },
  {
    id: 'productivity',
    name: 'Productivity App',
    description: 'A dashboard-style home screen for a productivity app.',
    accent: '#14b8a6',
    build: () =>
      buildTemplateProject('mobile', 'Productivity App', (b, root) => {
        const bar = b.add('appBar', root)
        b.add('heading', bar.id, { text: 'Today', style: { fontSize: 18, fontWeight: 700, color: '#ffffff' } })
        const row = b.add('row', root, { style: { padding: 16 } })
        ;[
          ['Tasks', '5'],
          ['Focus', '2h 10m'],
        ].forEach(([label, value]) => {
          const card = b.add('card', row.id, { width: 'fill' })
          b.add('text', card.id, { text: label })
          b.add('heading', card.id, { text: value, style: { fontSize: 22, fontWeight: 700 } })
        })
        const list = b.add('list', root, { style: { padding: 16 } })
        ;['Finish proposal', 'Review PR', 'Plan sprint'].forEach((task) => {
          const item = b.add('listItem', list.id)
          b.add('toggle', item.id)
          b.add('text', item.id, { text: task })
        })
        withBottomNav(b, root, ['Home', 'Tasks', 'Me'])
      }),
  },
]
