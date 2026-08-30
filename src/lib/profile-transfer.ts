import { type ActionElement } from '@/lib/action-elements'
import { type GameAction } from '@/lib/game-actions'

interface SaveFilePickerOptions {
  suggestedName: string
  types: Array<{ accept: Record<string, string[]>; description: string }>
}

interface SaveFileHandle {
  createWritable: () => Promise<{ close: () => Promise<void>; write: (data: Blob) => Promise<void> }>
}

function supportsSaveFilePicker(value: Window): value is Window & { showSaveFilePicker: (options: SaveFilePickerOptions) => Promise<SaveFileHandle> } {
  return typeof (value as { showSaveFilePicker?: unknown }).showSaveFilePicker === 'function'
}

export interface ActionProfileExport {
  actions: Array<Pick<GameAction, 'template' | 'title'>>
  kind: 'actions'
}

export interface ElementProfileExport {
  elements: Array<Omit<ActionElement, 'id' | 'image' | 'profileId'> & { image?: string }>
  kind: 'elements'
}

export async function createElementProfileExport(elements: ActionElement[]): Promise<ElementProfileExport> {
  return {
    elements: await Promise.all(elements.map(async (element) => ({
      emoji: element.emoji,
      image: element.image ? await blobToDataUrl(element.image) : undefined,
      imageUrl: element.imageUrl,
      tags: element.tags,
      title: element.title,
    }))),
    kind: 'elements',
  }
}

export function createActionProfileExport(actions: GameAction[]): ActionProfileExport {
  return {
    actions: actions.map((action) => ({ template: action.template, title: action.title })),
    kind: 'actions',
  }
}

export async function downloadProfileExport(filename: string, content: ActionProfileExport | ElementProfileExport): Promise<void> {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })

  if (supportsSaveFilePicker(window)) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          accept: { 'application/json': ['.json'] },
          description: 'Profil Framed',
        }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      throw error
    }
  }

  const source = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = source
  link.download = filename
  link.click()
  URL.revokeObjectURL(source)
}

export async function parseProfileExport(file: File): Promise<unknown> {
  return JSON.parse(await file.text())
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob()
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Impossible de lire l’image.'))
    reader.onerror = () => reject(reader.error ?? new Error('Impossible de lire l’image.'))
    reader.readAsDataURL(blob)
  })
}
