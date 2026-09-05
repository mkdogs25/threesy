import { buildTemplateProject } from './builderHelpers'
import type { AppBuilderProject } from '../project/schema/types'

export interface WebTemplateDef {
  id: string
  name: string
  description: string
  accent: string
  build: () => AppBuilderProject
}

export const WEB_TEMPLATES: WebTemplateDef[] = [
  {
    id: 'blank',
    name: 'Blank Website',
    description: 'Start from an empty page.',
    accent: '#6c8cff',
    build: () => buildTemplateProject('web', 'Blank Website', () => {}),
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A simple personal portfolio page.',
    accent: '#4f46e5',
    build: () =>
      buildTemplateProject('web', 'Portfolio', (b, root) => {
        const hero = b.add('hero', root)
        b.add('heading', hero.id, { text: 'Hi, I’m Jordan.' })
        b.add('text', hero.id, { text: 'I design and build things for the web.' })
        b.add('button', hero.id, { text: 'View My Work' })
        const section = b.add('section', root)
        const row = b.add('row', section.id)
        for (let i = 1; i <= 3; i++) {
          const card = b.add('card', row.id, { width: 'fill' })
          b.add('image', card.id, { width: 'fill', height: 140 })
          b.add('heading', card.id, { text: `Project ${i}`, style: { fontSize: 18, fontWeight: 600, color: '#1a1d29' } })
          b.add('text', card.id, { text: 'A short project description goes here.' })
        }
        const footer = b.add('footer', root)
        b.add('text', footer.id, { text: '© 2025 Jordan. All rights reserved.', style: { color: '#ffffff' } })
      }),
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'A hero, features, and a call to action.',
    accent: '#33c17a',
    build: () =>
      buildTemplateProject('web', 'Landing Page', (b, root) => {
        const navbar = b.add('navbar', root)
        b.add('heading', navbar.id, { text: 'Brandly', style: { fontSize: 20, fontWeight: 700, color: '#1a1d29' } })
        const navRow = b.add('row', navbar.id)
        b.add('button', navRow.id, { text: 'Get Started' })
        const hero = b.add('hero', root)
        b.add('heading', hero.id, { text: 'Launch faster with Brandly' })
        b.add('text', hero.id, { text: 'Everything you need to ship your next idea.' })
        b.add('button', hero.id, { text: 'Start Free Trial' })
        const section = b.add('section', root)
        const row = b.add('row', section.id)
        ;['Fast', 'Reliable', 'Secure'].forEach((label) => {
          const card = b.add('card', row.id, { width: 'fill' })
          b.add('heading', card.id, { text: label, style: { fontSize: 18, fontWeight: 600, color: '#1a1d29' } })
          b.add('text', card.id, { text: 'A short supporting sentence about this feature.' })
        })
      }),
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'A sidebar, stat cards, and a data table.',
    accent: '#f59e0b',
    build: () =>
      buildTemplateProject('web', 'Dashboard', (b, root) => {
        const shell = b.add('row', root, { width: 'fill', style: { padding: 0 } })
        const sidebar = b.add('sidebar', shell.id)
        b.add('heading', sidebar.id, { text: 'Admin', style: { fontSize: 18, fontWeight: 700 } })
        ;['Overview', 'Customers', 'Orders', 'Settings'].forEach((label) => b.add('text', sidebar.id, { text: label }))
        const main = b.add('container', shell.id, { width: 'fill' })
        const statsRow = b.add('row', main.id)
        ;[
          ['Revenue', '$12,480'],
          ['Users', '1,204'],
          ['Orders', '389'],
        ].forEach(([label, value]) => {
          const card = b.add('card', statsRow.id, { width: 'fill' })
          b.add('text', card.id, { text: label })
          b.add('heading', card.id, { text: value, style: { fontSize: 24, fontWeight: 700, color: '#1a1d29' } })
        })
        b.add('table', main.id)
      }),
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A list of posts on a simple layout.',
    accent: '#ec4899',
    build: () =>
      buildTemplateProject('web', 'Blog', (b, root) => {
        const navbar = b.add('navbar', root)
        b.add('heading', navbar.id, { text: 'The Journal', style: { fontSize: 20, fontWeight: 700 } })
        const section = b.add('section', root)
        for (let i = 1; i <= 3; i++) {
          const card = b.add('card', section.id, { width: 'fill' })
          b.add('heading', card.id, { text: `Post title ${i}`, style: { fontSize: 20, fontWeight: 700, color: '#1a1d29' } })
          b.add('text', card.id, { text: 'A short excerpt introducing this blog post goes here.' })
        }
      }),
  },
  {
    id: 'todo-web',
    name: 'To-do App',
    description: 'A simple task list with an add form.',
    accent: '#22c55e',
    build: () =>
      buildTemplateProject('web', 'To-do App', (b, root) => {
        b.add('heading', root, { text: 'My Tasks' })
        const form = b.add('form', root)
        const row = b.add('row', form.id)
        b.add('input', row.id, { placeholder: 'Add a task…', width: 'fill' })
        b.add('button', row.id, { text: 'Add' })
        const list = b.add('list', root)
        ;['Buy groceries', 'Finish report', 'Call the dentist'].forEach((task) => {
          const item = b.add('listItem', list.id)
          b.add('toggle', item.id)
          b.add('text', item.id, { text: task })
        })
      }),
  },
  {
    id: 'store',
    name: 'Store',
    description: 'A product grid with a navbar.',
    accent: '#f97316',
    build: () =>
      buildTemplateProject('web', 'Store', (b, root) => {
        const navbar = b.add('navbar', root)
        b.add('heading', navbar.id, { text: 'Shopfront', style: { fontSize: 20, fontWeight: 700 } })
        b.add('button', navbar.id, { text: 'Cart (0)' })
        const section = b.add('section', root)
        const row = b.add('row', section.id, { layout: { wrap: true, direction: 'row', gap: 16, align: 'stretch', justify: 'start' } })
        for (let i = 1; i <= 4; i++) {
          const card = b.add('card', row.id, { width: 220 })
          b.add('image', card.id, { width: 'fill', height: 120 })
          b.add('heading', card.id, { text: `Product ${i}`, style: { fontSize: 15, fontWeight: 600, color: '#1a1d29' } })
          b.add('text', card.id, { text: '$29.00' })
          b.add('button', card.id, { text: 'Add to Cart' })
        }
      }),
  },
]
