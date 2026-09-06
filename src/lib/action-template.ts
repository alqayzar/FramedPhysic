export interface ActionFilter {
  alternatives: string[][]
  raw: string
}

export type ActionTemplateSegment =
  | { type: 'text'; value: string }
  | { filter: ActionFilter; label?: string; type: 'filter' }
  | { label: string; type: 'reference' }

export type GeneratedActionSegment =
  | { type: 'text'; value: string }
  | { element: ActionElement; type: 'element' }
  | { type: 'unmatched'; value: string }

function parseFilter(raw: string): ActionFilter {
  return {
    alternatives: raw.split(/\s+OU\s+/).map((alternative) =>
      alternative
        .split(/\s+ET\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
    raw,
  }
}

function parseFilterSegment(raw: string): ActionTemplateSegment {
  const trimmedRaw = raw.trim()
  if (trimmedRaw.startsWith('=')) return { label: trimmedRaw.slice(1).trim(), type: 'reference' }

  const labelSeparatorIndex = trimmedRaw.indexOf('=')
  if (labelSeparatorIndex === -1) return { filter: parseFilter(trimmedRaw), type: 'filter' }

  return {
    filter: parseFilter(trimmedRaw.slice(labelSeparatorIndex + 1)),
    label: trimmedRaw.slice(0, labelSeparatorIndex).trim(),
    type: 'filter',
  }
}

export function parseActionTemplate(template: string): ActionTemplateSegment[] {
  const segments: ActionTemplateSegment[] = []
  const matcher = /\{([^{}]*)\}/g
  let lastIndex = 0

  for (const match of template.matchAll(matcher)) {
    if (match.index === undefined) continue
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }
    segments.push(parseFilterSegment(match[1]))
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < template.length) {
    segments.push({ type: 'text', value: template.slice(lastIndex) })
  }

  return segments
}

export function validateActionTemplate(template: string): string | undefined {
  if (!template.trim()) return 'Une action doit contenir du texte.'

  let depth = 0
  for (const character of template) {
    if (character === '{') depth += 1
    if (character === '}') depth -= 1
    if (depth < 0) return 'Une accolade fermante ne correspond à aucune accolade ouvrante.'
  }
  if (depth > 0) return 'Une ou plusieurs accolades fermantes sont manquantes.'

  const labels = new Set<string>()
  for (const segment of parseActionTemplate(template)) {
    if (segment.type === 'reference') {
      if (!segment.label) return 'Une référence doit avoir un label.'
      if (!labels.has(segment.label)) return `Le label ${segment.label} doit être défini avant d’être réutilisé.`
      continue
    }
    if (segment.type !== 'filter') continue
    if (segment.label !== undefined) {
      if (!segment.label) return 'Un label doit avoir un nom.'
      if (labels.has(segment.label)) return `Le label ${segment.label} est déjà utilisé.`
      labels.add(segment.label)
    }
    if (!segment.filter.raw.trim()) return 'Un filtre entre accolades ne peut pas être vide.'
    if (segment.filter.alternatives.some((alternative) => alternative.length === 0)) {
      return 'Chaque alternative doit contenir au moins un tag.'
    }
    if (segment.filter.alternatives.some((alternative) => alternative.some((tag) => tag === '-'))) {
      return 'Un tag exclu doit avoir un nom.'
    }
  }

  return undefined
}

export function generateActionPreview(template: string, elements: ActionElement[]): GeneratedActionSegment[] {
  const labeledElements = new Map<string, ActionElement>()

  return parseActionTemplate(template)
    .map((segment) => {
      if (segment.type === 'text') return segment.value
      if (segment.type === 'reference') {
        const element = labeledElements.get(segment.label)
        return element ? { element, type: 'element' as const } : { type: 'unmatched' as const, value: `N/A =${segment.label}` }
      }

      const matchingElements = elements.filter((element) =>
        segment.filter.alternatives.some((alternative) => alternative.every((tag) => (
          tag.startsWith('-') ? !element.tags.includes(tag.slice(1)) : element.tags.includes(tag)
        ))),
      )
      const selectedElement = matchingElements[Math.floor(Math.random() * matchingElements.length)]

      if (selectedElement) {
        if (segment.label) labeledElements.set(segment.label, selectedElement)
        return { element: selectedElement, type: 'element' as const }
      }
      return { type: 'unmatched' as const, value: `N/A ${segment.filter.raw}` }
    })
    .map((segment) => (typeof segment === 'string' ? { type: 'text' as const, value: segment } : segment))
}

export function getGeneratedActionEqualityKey(segments: GeneratedActionSegment[]): string {
  return JSON.stringify(segments.map((segment) => {
    if (segment.type === 'element') return ['element', segment.element.id]
    return [segment.type, segment.value]
  }))
}

export function areGeneratedActionsEqual(first: GeneratedActionSegment[], second: GeneratedActionSegment[]): boolean {
  return getGeneratedActionEqualityKey(first) === getGeneratedActionEqualityKey(second)
}
import { type ActionElement } from '@/lib/action-elements'
