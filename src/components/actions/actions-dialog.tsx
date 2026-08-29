import { useEffect, useState, type MouseEvent } from 'react'
import { ActionDialog } from '@/components/actions/action-dialog'
import { ActionTemplatePreview } from '@/components/actions/action-template-preview'
import { ProfileDialog } from '@/components/profiles/profile-dialog'
import { ProfileTabs } from '@/components/profiles/profile-tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGame } from '@/contexts/game-context'
import { type ActionElement } from '@/lib/action-elements'
import { type GameAction } from '@/lib/game-actions'
import { generateActionPreview, type GeneratedActionSegment } from '@/lib/action-template'
import { Copy, Plus, Shuffle, Trash2 } from 'lucide-react'

interface ActionsDialogProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

interface GeneratedPreviewSegment {
  emoji?: string
  imageSource?: string
  title?: string
  type: GeneratedActionSegment['type']
  value?: string
}

interface GeneratedAction {
  imageSources: string[]
  preview: GeneratedPreviewSegment[]
  title: string
}

interface GeneratedElementViewer {
  emoji?: string
  imageSource?: string
  title: string
}

function getExistingTags(elements: ActionElement[]): string[] {
  return [...new Set(elements.flatMap((element) => element.tags))].sort((first, second) =>
    first.localeCompare(second, 'fr'),
  )
}

function ActionsDialog(props: ActionsDialogProps) {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<GameAction>()
  const [activeProfileId, setActiveProfileId] = useState<string>()
  const [generatedAction, setGeneratedAction] = useState<GeneratedAction>()
  const [selectedGeneratedElement, setSelectedGeneratedElement] = useState<GeneratedElementViewer>()
  const {
    actionElements,
    actions,
    actionProfiles,
    actionsError,
    addAction,
    addActionProfile,
    deleteAction,
    deleteActionProfile,
    duplicateAction,
    updateAction,
  } = useGame()

  useEffect(() => {
    return () => generatedAction?.imageSources.forEach((source) => URL.revokeObjectURL(source))
  }, [generatedAction])

  useEffect(() => {
    if (!actionProfiles.some((profile) => profile.id === activeProfileId)) setActiveProfileId(actionProfiles[0]?.id)
  }, [actionProfiles, activeProfileId])

  function handleOpenChange(open: boolean) {
    props.onOpenChange(open)
    if (!open) handleActionDialogOpenChange(false)
  }

  function openCreateDialog() {
    if (!activeProfileId) return
    setEditingAction(undefined)
    setIsActionDialogOpen(true)
  }

  function openProfileDialog() {
    setIsProfileDialogOpen(true)
  }

  function handleProfileDialogOpenChange(open: boolean) {
    setIsProfileDialogOpen(open)
  }

  function handleProfileSelect(profileId: string) {
    setActiveProfileId(profileId)
  }

  function openEditor(action: GameAction) {
    setEditingAction(action)
    setIsActionDialogOpen(true)
  }

  function handleActionDialogOpenChange(open: boolean) {
    setIsActionDialogOpen(open)
    if (!open) setEditingAction(undefined)
  }

  async function saveAction(action: GameAction): Promise<void> {
    if (editingAction) await updateAction(action)
    else await addAction(action)
  }

  async function deleteEditingAction(action: GameAction): Promise<void> {
    await deleteAction(action.id)
  }

  function handleActionSelect(event: MouseEvent<HTMLButtonElement>) {
    const actionId = event.currentTarget.dataset.actionId
    const action = actions.find((currentAction) => currentAction.id === actionId)
    if (action) openEditor(action)
  }

  function handleDuplicate(event: MouseEvent<HTMLButtonElement>) {
    const actionId = event.currentTarget.dataset.actionId
    const action = actions.find((currentAction) => currentAction.id === actionId)
    if (action) void duplicateAction(action)
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    const actionId = event.currentTarget.dataset.actionId
    if (actionId) void deleteAction(actionId)
  }

  function handleGenerate(event: MouseEvent<HTMLButtonElement>) {
    const actionId = event.currentTarget.dataset.actionId
    const action = actions.find((currentAction) => currentAction.id === actionId)
    if (!action) return

    const imageSources: string[] = []
    const preview = generateActionPreview(action.template, actionElements).map((segment): GeneratedPreviewSegment => {
      if (segment.type !== 'element') return segment

      let imageSource = segment.element.imageUrl
      if (segment.element.image) {
        imageSource = URL.createObjectURL(segment.element.image)
        imageSources.push(imageSource)
      }

      return {
        emoji: segment.element.emoji,
        imageSource,
        title: segment.element.title,
        type: 'element',
      }
    })

    setGeneratedAction({
      imageSources,
      preview,
      title: action.title || 'Action générée',
    })
    setSelectedGeneratedElement(undefined)
  }

  function handleGeneratedActionOpenChange(open: boolean) {
    if (!open) {
      setGeneratedAction(undefined)
      setSelectedGeneratedElement(undefined)
    }
  }

  function handleGeneratedElementClick(event: MouseEvent<HTMLButtonElement>) {
    const index = Number(event.currentTarget.dataset.previewIndex)
    const segment = generatedAction?.preview[index]
    if (Number.isNaN(index) || segment?.type !== 'element' || !segment.title) return

    setSelectedGeneratedElement({
      emoji: segment.emoji,
      imageSource: segment.imageSource,
      title: segment.title,
    })
  }

  function handleGeneratedElementViewerOpenChange(open: boolean) {
    if (!open) setSelectedGeneratedElement(undefined)
  }

  function closeGeneratedElementViewer() {
    setSelectedGeneratedElement(undefined)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-3xl sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">Actions</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          <ProfileTabs
            activeProfileId={activeProfileId}
            onAdd={openProfileDialog}
            onDelete={deleteActionProfile}
            onSelect={handleProfileSelect}
            profiles={actionProfiles}
          />
          <div className="mt-3 min-w-0 pr-1 sm:inline-block">
            <Button
              className="cartoon-press h-auto w-full max-w-full rounded-xl border-4 border-game-ink bg-game-green px-4 py-3 text-sm font-black text-white hover:bg-game-green sm:w-auto sm:px-5 sm:text-base"
              disabled={!activeProfileId}
              onClick={openCreateDialog}
              type="button"
            >
              <Plus aria-hidden="true" className="size-5" />
              Ajouter une action
            </Button>
          </div>

          {actionsError && <p className="mt-5 font-bold text-red-700">{actionsError}</p>}

          <div className="mt-8 grid gap-4">
            {actions.filter((action) => action.profileId === activeProfileId).map((action) => (
              <article className="rounded-2xl border-4 border-game-ink bg-white p-4 shadow-[0_5px_0_0_#16171d]" key={action.id}>
                <div className="flex min-w-0 items-start gap-2">
                  <button
                    aria-label="Modifier l’action"
                    className="min-w-0 flex-1 break-words text-left text-base font-black leading-tight"
                    data-action-id={action.id}
                    onClick={handleActionSelect}
                    type="button"
                  >
                    {action.title || 'Action sans titre'}
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      aria-label="Dupliquer l’action"
                      className="cartoon-press cartoon-press-sm size-8 rounded-lg border-2 border-game-ink bg-game-green p-0 text-white hover:bg-game-green"
                      data-action-id={action.id}
                      onClick={handleDuplicate}
                      type="button"
                    >
                      <Copy aria-hidden="true" className="size-3.5" />
                    </Button>
                    <Button
                      aria-label="Supprimer l’action"
                      className="cartoon-press cartoon-press-sm size-8 rounded-lg border-2 border-game-ink bg-game-red p-0 text-white hover:bg-game-red"
                      data-action-id={action.id}
                      onClick={handleDelete}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <button
                  aria-label="Modifier l’action"
                  className="mt-3 w-full min-w-0 text-left"
                  data-action-id={action.id}
                  onClick={handleActionSelect}
                  type="button"
                >
                  <ActionTemplatePreview template={action.template} />
                </button>
                <Button
                  className="cartoon-press mt-4 w-full rounded-xl border-3 border-game-ink bg-game-blue px-4 py-2 text-sm font-black text-white hover:bg-game-blue"
                  data-action-id={action.id}
                  onClick={handleGenerate}
                  type="button"
                >
                  <Shuffle aria-hidden="true" className="size-4" />
                  Exemple
                </Button>
              </article>
            ))}
          </div>

          {actions.filter((action) => action.profileId === activeProfileId).length === 0 && !isActionDialogOpen && (
            <p className="mt-12 text-center text-base font-bold text-game-ink/60">Aucune action pour le moment.</p>
          )}
        </div>

        <ActionDialog
          availableTags={getExistingTags(actionElements)}
          action={editingAction}
          onDelete={deleteEditingAction}
          onDuplicate={duplicateAction}
          onOpenChange={handleActionDialogOpenChange}
          onSave={saveAction}
          open={isActionDialogOpen}
          profileId={activeProfileId ?? ''}
        />
        <ProfileDialog onCreate={addActionProfile} onOpenChange={handleProfileDialogOpenChange} open={isProfileDialogOpen} />
        <Dialog onOpenChange={handleGeneratedActionOpenChange} open={Boolean(generatedAction)}>
          <DialogContent className="w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-game-yellow p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg">
            <DialogHeader className="pr-10">
              <DialogTitle className="break-words text-2xl font-black tracking-[-0.04em]">
                {generatedAction?.title}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-5 flex flex-wrap items-center gap-2 break-words text-lg font-bold leading-8">
              {generatedAction?.preview.map((segment, index) => {
                if (segment.type === 'text') return <span key={`${segment.value}-${index}`}>{segment.value}</span>
                if (segment.type === 'unmatched') {
                  return <span className="rounded-lg border-2 border-game-ink bg-game-red px-2 py-1 text-sm text-white" key={`${segment.value}-${index}`}>{segment.value}</span>
                }

                return (
                  <span className="inline-flex shrink-0" key={`${segment.title}-${index}`}>
                    <button
                      aria-label={`Afficher ${segment.title}`}
                      className="inline-flex size-14 overflow-hidden rounded-lg border-3 border-game-ink bg-white"
                      data-preview-index={index}
                      onClick={handleGeneratedElementClick}
                      type="button"
                    >
                      {segment.imageSource ? (
                        <img alt="" className="size-full object-cover" src={segment.imageSource} />
                      ) : (
                        <span aria-hidden="true" className="flex size-full items-center justify-center text-3xl">
                          {segment.emoji || '?'}
                        </span>
                      )}
                    </button>
                  </span>
                )
              })}
            </p>
          </DialogContent>
        </Dialog>
        <Dialog onOpenChange={handleGeneratedElementViewerOpenChange} open={Boolean(selectedGeneratedElement)}>
          <DialogContent className="flex h-svh w-svw max-w-none flex-col items-center justify-center gap-6 rounded-none border-0 bg-game-yellow p-8 text-game-ink shadow-none" onClick={closeGeneratedElementViewer}>
            {selectedGeneratedElement?.imageSource ? (
              <img alt="" className="max-h-[70svh] max-w-full rounded-2xl border-4 border-game-ink object-contain shadow-[0_8px_0_0_#16171d]" src={selectedGeneratedElement.imageSource} />
            ) : (
              <span aria-hidden="true" className="flex size-56 items-center justify-center rounded-2xl border-4 border-game-ink bg-white text-9xl shadow-[0_8px_0_0_#16171d]">
                {selectedGeneratedElement?.emoji || '?'}
              </span>
            )}
            <DialogTitle className="max-w-full break-words text-center text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              {selectedGeneratedElement?.title}
            </DialogTitle>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export { ActionsDialog }
