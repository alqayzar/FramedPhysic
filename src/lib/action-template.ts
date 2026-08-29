export interface ActionFilter {
  alternatives: string[][]
  raw: string
}

export type ActionTemplateSegment =
  | { type: 'text'; value: string }
  | { filter: ActionFilter; type: 'filter' }

export type GeneratedActionSegment =
  | { type: 'text'; value: string }
  | { element: ActionElement; type: 'element' }
  | { type: 'unmatched'; value: string }

function parseFilter(raw: string): ActionFilter {
  return {
    alternatives: raw.split(',').map((alternative) =>
      alternative
        .split('&')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
    raw,
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
    segments.push({ filter: parseFilter(match[1]), type: 'filter' })
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

  for (const segment of parseActionTemplate(template)) {
    if (segment.type !== 'filter') continue
    if (!segment.filter.raw.trim()) return 'Un filtre entre accolades ne peut pas être vide.'
    if (segment.filter.alternatives.some((alternative) => alternative.length === 0)) {
      return 'Chaque alternative doit contenir au moins un tag.'
    }
  }

  return undefined
}

export function generateActionPreview(template: string, elements: ActionElement[]): GeneratedActionSegment[] {
  return parseActionTemplate(template)
    .map((segment) => {
      if (segment.type === 'text') return segment.value

      const matchingElements = elements.filter((element) =>
        segment.filter.alternatives.some((alternative) => alternative.every((tag) => element.tags.includes(tag))),
      )
      const selectedElement = matchingElements[Math.floor(Math.random() * matchingElements.length)]

      if (selectedElement) return { element: selectedElement, type: 'element' as const }
      return { type: 'unmatched' as const, value: `Aucun élément pour ${segment.filter.raw}` }
    })
    .map((segment) => (typeof segment === 'string' ? { type: 'text' as const, value: segment } : segment))
}
import { type ActionElement } from '@/lib/action-elements'
