import type { ComponentType } from '../../project/schema/types'

export const COLOR_WORDS: Record<string, string> = {
  blue: '#2563eb',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#f59e0b',
  black: '#111827',
  white: '#ffffff',
  gray: '#6b7280',
  grey: '#6b7280',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  indigo: '#4f46e5',
  teal: '#14b8a6',
}

/** Keyword → ComponentType, longest phrases first so "bottom navigation
 * bar" matches before the generic word "bar" ever could. */
export const COMPONENT_KEYWORDS: [string, ComponentType][] = [
  ['bottom navigation bar', 'bottomNav'],
  ['bottom navigation', 'bottomNav'],
  ['bottom nav', 'bottomNav'],
  ['floating action button', 'fab'],
  ['fab', 'fab'],
  ['app bar', 'appBar'],
  ['appbar', 'appBar'],
  ['tab bar', 'tabBar'],
  ['tabs', 'tabs'],
  ['navbar', 'navbar'],
  ['nav bar', 'navbar'],
  ['sidebar', 'sidebar'],
  ['side bar', 'sidebar'],
  ['footer', 'footer'],
  ['hero', 'hero'],
  ['section', 'section'],
  ['heading', 'heading'],
  ['title', 'heading'],
  ['button', 'button'],
  ['text field', 'input'],
  ['input', 'input'],
  ['text box', 'input'],
  ['toggle', 'toggle'],
  ['switch', 'toggle'],
  ['icon', 'icon'],
  ['divider', 'divider'],
  ['line', 'divider'],
  ['list item', 'listItem'],
  ['list', 'list'],
  ['modal', 'modal'],
  ['popup', 'modal'],
  ['dialog', 'modal'],
  ['card', 'card'],
  ['table', 'table'],
  ['form', 'form'],
  ['row', 'row'],
  ['container', 'container'],
  ['box', 'container'],
  ['image', 'image'],
  ['picture', 'image'],
  ['photo', 'image'],
  ['text', 'text'],
  ['paragraph', 'text'],
]

export function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/colour/g, 'color')
    .replace(/\s+/g, ' ')
}

export function findComponentKeyword(text: string): ComponentType | null {
  for (const [phrase, type] of COMPONENT_KEYWORDS) {
    if (text.includes(phrase)) return type
  }
  return null
}
