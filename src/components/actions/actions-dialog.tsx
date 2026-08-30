import { useEffect, useState, type MouseEvent } from 'react'
import { ActionDialog } from '@/components/actions/action-dialog'
import { ActionTemplatePreview } from '@/components/actions/action-template-preview'
import { GeneratedActionViewer, type GeneratedActionViewerAction } from '@/components/actions/generated-action-viewer'
import { ProfileDialog } from '@/components/profiles/profile-dialog'
import { ProfileTabs } from '@/components/profiles/profile-tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGame } from '@/contexts/game-context'
import { type ActionElement } from '@/lib/action-elements'
import { type GameAction } from '@/lib/game-actions'
import { generateActionPreview } from '@/lib/action-template'
import { Copy, Plus, Shuffle, Trash2 } from 'lucide-react'

interface ActionsDialogProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

interface GeneratedAction extends GeneratedActionViewerAction {
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
  const {
    actionElements,
    actions,
    actionProfiles,
    actionsError,
    addAction,
    addActionProfile,
    clearActionProfile,
    deleteAction,
    deleteActionProfile,
    duplicateAction,
    exportActionProfile,
    importActionProfile,
    updateAction,
    updateActionProfile,
  } = useGame()

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

    setGeneratedAction({
      id: crypto.randomUUID(),
      segments: generateActionPreview(action.template, actionElements),
      title: action.title || 'Action générée',
    })
  }

  function handleGeneratedActionOpenChange(open: boolean) {
    if (!open) {
      setGeneratedAction(undefined)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent className="flex h-svh w-svw max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-5 text-game-ink shadow-none sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12 pb-5">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">Actions</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          <ProfileTabs
            activeProfileId={activeProfileId}
            contentLabel="actions"
            onAdd={openProfileDialog}
            onClear={clearActionProfile}
            onDelete={deleteActionProfile}
            onExport={exportActionProfile}
            onImport={importActionProfile}
            onRename={updateActionProfile}
            onSelect={handleProfileSelect}
            profiles={actionProfiles}
          />
          <div className="mt-3 w-full min-w-0">
            <Button
              className="cartoon-press h-auto w-full max-w-none rounded-xl border-4 border-game-ink bg-game-green px-4 py-3 text-sm font-black text-white hover:bg-game-green sm:px-5 sm:text-base"
              disabled={!activeProfileId}
              onClick={openCreateDialog}
              type="button"
            >
              <Plus aria-hidden="true" className="size-5" />
              Ajouter une action
            </Button>
          </div>

          {actionsError && <p className="mt-5 font-bold text-red-700">{actionsError}</p>}

          <div className="mt-8 grid w-full gap-4">
            {actions.filter((action) => action.profileId === activeProfileId).map((action) => (
              <article className="w-full rounded-2xl border-4 border-game-ink bg-white p-4 shadow-[0_5px_0_0_#16171d]" key={action.id}>
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
          <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg">
            <DialogHeader className="pr-10">
              <DialogTitle className="break-words text-2xl font-black tracking-[-0.06em]">{generatedAction?.title}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[55svh] overflow-y-auto overscroll-contain pr-1">
              <GeneratedActionViewer actions={generatedAction ? [generatedAction] : []} />
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export { ActionsDialog }
