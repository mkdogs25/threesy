import type { ComponentType, InteractionTrigger, ResponsiveBehavior } from '../../project/schema/types'

export interface SummaryRow {
  label: string
  value: string
}

export type ParsedCommand =
  | { kind: 'addComponent'; title: string; componentType: ComponentType; summary: SummaryRow[] }
  | { kind: 'addPreset'; title: string; preset: 'loginScreen' | 'signupScreen'; summary: SummaryRow[] }
  | { kind: 'changeStyle'; title: string; targetId: string; targetName: string; style: Record<string, string | number>; summary: SummaryRow[] }
  | { kind: 'move'; title: string; targetId: string; targetName: string; relativeToId: string; relativeToName: string; before: boolean; summary: SummaryRow[] }
  | { kind: 'addInteraction'; title: string; targetId: string; targetName: string; trigger: InteractionTrigger; pageId: string; pageName: string; summary: SummaryRow[] }
  | { kind: 'setResponsive'; title: string; targetIds: string[]; targetLabel: string; tier: 'mobile' | 'tablet'; behavior: ResponsiveBehavior; summary: SummaryRow[] }

export interface ParseFailure {
  kind: 'unrecognized'
  input: string
}

export type ParseResult = ParsedCommand | ParseFailure
