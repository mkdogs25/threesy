import type { AppBuilderProject, ComponentNode, ComponentType, InteractionTrigger } from '../../project/schema/types'
import { collectSubtreeIds } from '../../project/history/tree'
import { COLOR_WORDS, findComponentKeyword, normalize } from './dictionaries'
import type { ParseResult, SummaryRow } from './types'

function pageNodes(project: AppBuilderProject): ComponentNode[] {
  const page = project.pages.find((p) => p.id === project.activePageId)
  if (!page) return []
  return collectSubtreeIds(project, page.rootId)
    .map((id) => project.nodes[id])
    .filter(Boolean)
}

function findTarget(project: AppBuilderProject, phrase: string, selectedId: string | null): ComponentNode | null {
  const text = normalize(phrase).replace(/^(this|the)\s+/, '')
  const nodes = pageNodes(project)
  const type = findComponentKeyword(text)

  if (selectedId) {
    const selected = project.nodes[selectedId]
    if (selected && (selected.type === type || normalize(selected.name).includes(text))) return selected
  }
  if (type) {
    const byType = nodes.find((n) => n.type === type)
    if (byType) return byType
  }
  return nodes.find((n) => normalize(n.name).includes(text)) ?? null
}

function findAllTargets(project: AppBuilderProject, phrase: string): ComponentNode[] {
  const text = normalize(phrase).replace(/^(these|the)\s+/, '').replace(/s$/, '')
  const type = findComponentKeyword(text)
  const nodes = pageNodes(project)
  if (type) return nodes.filter((n) => n.type === type)
  return nodes.filter((n) => normalize(n.name).includes(text))
}

function findPage(project: AppBuilderProject, phrase: string) {
  const text = normalize(phrase).replace(/^(the|to)\s+/, '')
  return project.pages.find((p) => normalize(p.name) === text || normalize(p.name).includes(text) || text.includes(normalize(p.name)))
}

function row(label: string, value: string): SummaryRow {
  return { label, value }
}

const SIZE_DELTA: Record<string, number> = {
  bigger: 6,
  larger: 6,
  huge: 16,
  smaller: -4,
  tiny: -8,
}

export function parseCommand(rawInput: string, project: AppBuilderProject, selectedId: string | null): ParseResult {
  const input = normalize(rawInput)
  const label = project.target === 'web' ? 'page' : 'screen'

  // "add a login/signup screen"
  const presetMatch = input.match(/^add (a |an )?(login|sign ?up) (screen|page)$/)
  if (presetMatch) {
    const preset = presetMatch[2].replace(' ', '') === 'signup' ? 'signupScreen' : 'loginScreen'
    return {
      kind: 'addPreset',
      title: 'Create Screen',
      preset,
      summary: [row('Add', preset === 'loginScreen' ? 'Login screen' : 'Sign up screen')],
    }
  }

  // "add a/an <component>"
  const addMatch = input.match(/^add (a |an )?(.+)$/)
  if (addMatch) {
    const type = findComponentKeyword(addMatch[2])
    if (type) {
      return {
        kind: 'addComponent',
        title: 'Add Component',
        componentType: type,
        summary: [row('Add', addMatch[2]), row('To', `Current ${label}`)],
      }
    }
  }

  // "make this/the <target> <color>"
  const colorMatch = input.match(/^make (this|the) (.+?) (blue|red|green|yellow|black|white|gray|grey|purple|pink|orange|indigo|teal)$/)
  if (colorMatch) {
    const target = findTarget(project, colorMatch[2], selectedId)
    if (target) {
      return {
        kind: 'changeStyle',
        title: `Change ${target.name}`,
        targetId: target.id,
        targetName: target.name,
        style: { background: COLOR_WORDS[colorMatch[3]] },
        summary: [row('Color', colorMatch[3])],
      }
    }
  }

  // "make this/the <target> bigger/smaller/..."
  const sizeMatch = input.match(/^make (this|the) (.+?) (bigger|larger|smaller|huge|tiny)$/)
  if (sizeMatch) {
    const target = findTarget(project, sizeMatch[2], selectedId)
    if (target) {
      const delta = SIZE_DELTA[sizeMatch[3]]
      const nextSize = Math.max(10, target.style.fontSize + delta)
      return {
        kind: 'changeStyle',
        title: `Change ${target.name}`,
        targetId: target.id,
        targetName: target.name,
        style: { fontSize: nextSize },
        summary: [row('Text size', `${target.style.fontSize}px → ${nextSize}px`)],
      }
    }
  }

  // "move the/this <target> above/below/before/after the/this <other>"
  const moveMatch = input.match(/^move (the |this )?(.+?) (above|below|before|after) (the |this )?(.+)$/)
  if (moveMatch) {
    const target = findTarget(project, moveMatch[2], selectedId)
    const relativeTo = findTarget(project, moveMatch[5], null)
    if (target && relativeTo && target.id !== relativeTo.id) {
      const before = moveMatch[3] === 'above' || moveMatch[3] === 'before'
      return {
        kind: 'move',
        title: `Move ${target.name}`,
        targetId: target.id,
        targetName: target.name,
        relativeToId: relativeTo.id,
        relativeToName: relativeTo.name,
        before,
        summary: [row('Move', target.name), row(before ? 'Before' : 'After', relativeTo.name)],
      }
    }
  }

  // "when clicked/click this/the <target>, go to/open/navigate to <page>"
  const interactionMatch = input.match(
    /^when (i |you )?click(ed)?(?: on)? (this|the) (.+?),? (?:go to|open|navigate to) (.+)$/,
  )
  if (interactionMatch) {
    const target = findTarget(project, interactionMatch[4], selectedId)
    const page = findPage(project, interactionMatch[5])
    if (target && page) {
      return {
        kind: 'addInteraction',
        title: 'Create Interaction',
        targetId: target.id,
        targetName: target.name,
        trigger: 'click' as InteractionTrigger,
        pageId: page.id,
        pageName: page.name,
        summary: [row('When', `${target.name} clicked`), row('Do', 'Navigate'), row(label.charAt(0).toUpperCase() + label.slice(1), page.name)],
      }
    }
  }

  // "make these/the <target> stack/wrap/hide on mobile/tablet"
  const responsiveMatch = input.match(/^make (these |the )?(.+?) (stack|wrap|hide|resize|full ?width) on (mobile|tablet)$/)
  if (responsiveMatch) {
    const targets = findAllTargets(project, responsiveMatch[2])
    if (targets.length > 0) {
      const behaviorWord = responsiveMatch[3].replace(' ', '')
      const behavior = behaviorWord === 'fullwidth' ? 'fullWidth' : (behaviorWord as 'stack' | 'wrap' | 'hide' | 'resize')
      return {
        kind: 'setResponsive',
        title: 'Set Responsive Behavior',
        targetIds: targets.map((t) => t.id),
        targetLabel: responsiveMatch[2],
        tier: responsiveMatch[4] as 'mobile' | 'tablet',
        behavior,
        summary: [row('Elements', `${targets.length} × ${responsiveMatch[2]}`), row('On', responsiveMatch[4]), row('Behavior', responsiveMatch[3])],
      }
    }
  }

  return { kind: 'unrecognized', input: rawInput }
}

export type { ComponentType }
