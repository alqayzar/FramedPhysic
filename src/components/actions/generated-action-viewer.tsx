import { useEffect, useState, type MouseEvent } from 'react'
import { GeneratedElementViewer } from '@/components/actions/generated-element-viewer'
import { type ActionElement } from '@/lib/action-elements'
import { type GeneratedActionSegment } from '@/lib/action-template'
import { cn } from '@/lib/utils'

const ACTION_BACKGROUND_CLASSES = [
  'bg-game-blue/15',
  'bg-game-green/15',
  'bg-game-pink/15',
  'bg-game-purple/15',
  'bg-game-red/15',
  'bg-game-yellow/15',
]

interface GeneratedActionViewerAction {
  id: string
  segments: GeneratedActionSegment[]
}

interface GeneratedActionViewerProps {
  actions: GeneratedActionViewerAction[]
  onSelect?: (actionId: string, isSelected: boolean) => void
  selectedActionIds?: string[]
  selectedActionClassName?: string
}

interface GeneratedActionElementButtonProps {
  element: ActionElement
  onSelect: (element: ActionElement) => void
}

function getActionBackgroundClass(action: GeneratedActionViewerAction, index: number): string {
  const seed = action.segments.reduce((total, segment) => {
    const value = segment.type === 'element' ? segment.element.id : segment.value
    return [...value].reduce((sum, character) => sum + character.charCodeAt(0), total)
  }, index)
  return ACTION_BACKGROUND_CLASSES[seed % ACTION_BACKGROUND_CLASSES.length]
}

function GeneratedActionElementButton(props: GeneratedActionElementButtonProps) {
  const [imageSource, setImageSource] = useState(props.element.imageUrl ?? '')

  useEffect(() => {
    if (!props.element.image) {
      setImageSource(props.element.imageUrl ?? '')
      return
    }

    const source = URL.createObjectURL(props.element.image)
    setImageSource(source)
    return () => URL.revokeObjectURL(source)
  }, [props.element.image, props.element.imageUrl])

  function selectElement(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    props.onSelect(props.element)
  }

  return (
    <button
      aria-label={`Afficher ${props.element.title}`}
      className="inline-flex size-12 shrink-0 overflow-hidden rounded-lg border-2 border-game-ink"
      onClick={selectElement}
      type="button"
    >
      {imageSource ? (
        <img alt="" className="size-full object-cover" src={imageSource} />
      ) : (
        <span aria-hidden="true" className="flex size-full items-center justify-center bg-white text-3xl">{props.element.emoji || '?'}</span>
      )}
    </button>
  )
}

function GeneratedActionViewer(props: GeneratedActionViewerProps) {
  const [selectedElement, setSelectedElement] = useState<ActionElement>()
  const [internalSelectedActionIds, setInternalSelectedActionIds] = useState<Set<string>>(new Set())
  const selectedActionIds = props.selectedActionIds ? new Set(props.selectedActionIds) : internalSelectedActionIds

  function handleActionSelect(event: MouseEvent<HTMLLIElement>) {
    if (!props.onSelect) return

    const actionId = event.currentTarget.dataset.actionId
    if (!actionId) return

    const isSelected = !selectedActionIds.has(actionId)
    const nextSelectedActionIds = new Set(selectedActionIds)
    if (isSelected) nextSelectedActionIds.add(actionId)
    else nextSelectedActionIds.delete(actionId)
    if (!props.selectedActionIds) setInternalSelectedActionIds(nextSelectedActionIds)
    props.onSelect(actionId, isSelected)
  }

  function handleElementViewerOpenChange(open: boolean) {
    if (!open) setSelectedElement(undefined)
  }

  return (
    <>
      {props.actions.length > 0 ? (
        <ul className="grid gap-2 pb-3">
          {props.actions.map((action, actionIndex) => (
            <li
              className={cn(
                'rounded-xl border-4 border-game-ink px-3 py-3 shadow-[0_4px_0_0_#16171d]',
                getActionBackgroundClass(action, actionIndex),
                props.onSelect && 'cursor-pointer',
                selectedActionIds.has(action.id) && props.selectedActionClassName,
              )}
              data-action-id={action.id}
              key={action.id}
              onClick={handleActionSelect}
            >
              <p className="flex flex-wrap items-center gap-2 text-lg font-bold leading-8 sm:text-xl sm:leading-9">
                {action.segments.map((segment, segmentIndex) => {
                  if (segment.type === 'text') return <span key={`${segment.value}-${segmentIndex}`}>{segment.value}</span>
                  if (segment.type === 'unmatched') {
                    return <span className="rounded-lg border-2 border-game-ink bg-game-red px-2 py-1 text-xs text-white" key={`${segment.value}-${segmentIndex}`}>{segment.value}</span>
                  }

                  return <GeneratedActionElementButton element={segment.element} key={`${segment.element.id}-${segmentIndex}`} onSelect={setSelectedElement} />
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-bold text-game-ink/60">Aucune action attribuée.</p>
      )}
      <GeneratedElementViewer
        emoji={selectedElement?.emoji}
        image={selectedElement?.image}
        imageSource={selectedElement?.imageUrl}
        onOpenChange={handleElementViewerOpenChange}
        open={Boolean(selectedElement)}
        title={selectedElement?.title}
      />
    </>
  )
}

export { GeneratedActionElementButton, GeneratedActionViewer, type GeneratedActionViewerAction }
