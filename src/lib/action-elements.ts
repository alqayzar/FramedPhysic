import { idbGet, idbSet } from '@/lib/idb-store'

const ACTION_ELEMENTS_KEY = 'action-elements'

export interface ActionElement {
  id: string
  profileId: string
  title: string
  emoji?: string
  image?: Blob
  imageUrl?: string
  tags: string[]
}

export interface ActionElementInput {
  profileId: string
  title: string
  emoji?: string
  image?: Blob
  imageUrl?: string
  tags?: string | string[]
}

export function createActionElement(input: ActionElementInput): ActionElement {
  return {
    id: crypto.randomUUID(),
    profileId: input.profileId,
    title: input.title.trim(),
    emoji: input.emoji?.trim() || undefined,
    image: input.image,
    imageUrl: input.imageUrl?.trim() || undefined,
    tags: [
      ...new Set(
        (Array.isArray(input.tags) ? input.tags : input.tags?.split(',') ?? [])
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ],
  }
}

export async function getActionElements(): Promise<ActionElement[]> {
  return (await idbGet<ActionElement[]>(ACTION_ELEMENTS_KEY)) ?? []
}

export async function setActionElements(elements: ActionElement[]): Promise<void> {
  await idbSet(ACTION_ELEMENTS_KEY, elements)
}
