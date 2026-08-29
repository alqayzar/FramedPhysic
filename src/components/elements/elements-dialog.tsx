import { useEffect, useState } from 'react'
import { ProfileDialog } from '@/components/profiles/profile-dialog'
import { ProfileTabs } from '@/components/profiles/profile-tabs'
import { ActionElementCard } from '@/components/settings/action-element-card'
import { ActionElementDialog } from '@/components/settings/action-element-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGame } from '@/contexts/game-context'
import { type ActionElement } from '@/lib/action-elements'
import { Plus } from 'lucide-react'

interface ElementsDialogProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

function getExistingTags(elements: ActionElement[]): string[] {
  return [...new Set(elements.flatMap((element) => element.tags))].sort((first, second) =>
    first.localeCompare(second, 'fr'),
  )
}

function ElementsDialog(props: ElementsDialogProps) {
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [editingElement, setEditingElement] = useState<ActionElement>()
  const [activeProfileId, setActiveProfileId] = useState<string>()
  const {
    actionElements,
    actionElementsError,
    addActionElement,
    addElementProfile,
    deleteActionElement,
    duplicateActionElement,
    deleteElementProfile,
    elementProfiles,
    updateActionElement,
  } = useGame()

  useEffect(() => {
    if (!elementProfiles.some((profile) => profile.id === activeProfileId)) setActiveProfileId(elementProfiles[0]?.id)
  }, [activeProfileId, elementProfiles])

  function handleOpenChange(open: boolean) {
    props.onOpenChange(open)
    if (!open) handleElementDialogOpenChange(false)
  }

  function openCreateDialog() {
    if (!activeProfileId) return
    setEditingElement(undefined)
    setIsElementDialogOpen(true)
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

  function openEditor(element: ActionElement) {
    setEditingElement(element)
    setIsElementDialogOpen(true)
  }

  function handleElementDialogOpenChange(open: boolean) {
    setIsElementDialogOpen(open)
    if (!open) setEditingElement(undefined)
  }

  async function saveElement(element: ActionElement): Promise<void> {
    if (editingElement) await updateActionElement(element)
    else await addActionElement(element)
  }

  async function deleteElement(element: ActionElement): Promise<void> {
    await deleteActionElement(element.id)
  }

  async function duplicateElement(element: ActionElement): Promise<void> {
    await duplicateActionElement(element)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-3xl sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            Éléments
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          <ProfileTabs
            activeProfileId={activeProfileId}
            onAdd={openProfileDialog}
            onDelete={deleteElementProfile}
            onSelect={handleProfileSelect}
            profiles={elementProfiles}
          />
          <div className="mt-3 min-w-0 pr-1 sm:inline-block">
            <Button
              className="cartoon-press h-auto w-full max-w-full rounded-xl border-4 border-game-ink bg-game-blue px-4 py-3 text-sm font-black text-white hover:bg-game-blue sm:w-auto sm:px-5 sm:text-base"
              disabled={!activeProfileId}
              onClick={openCreateDialog}
              type="button"
            >
              <Plus aria-hidden="true" className="size-5" />
              Ajouter un élément
            </Button>
          </div>

          {actionElementsError && <p className="mt-5 font-bold text-red-700">{actionElementsError}</p>}

          <div className="mt-8 grid min-w-0 gap-4 pr-1 pb-1 sm:grid-cols-2">
            {actionElements.filter((element) => element.profileId === activeProfileId).map((element) => (
              <ActionElementCard
                element={element}
                key={element.id}
                onDelete={deleteElement}
                onDuplicate={duplicateElement}
                onSelect={openEditor}
              />
            ))}
          </div>

          {actionElements.filter((element) => element.profileId === activeProfileId).length === 0 && !isElementDialogOpen && (
            <p className="mt-12 text-center text-base font-bold text-game-ink/60">
              Aucun élément pour le moment.
            </p>
          )}
        </div>

        <ActionElementDialog
          availableTags={getExistingTags(actionElements)}
          element={editingElement}
          onOpenChange={handleElementDialogOpenChange}
          onSave={saveElement}
          open={isElementDialogOpen}
          profileId={activeProfileId ?? ''}
        />
        <ProfileDialog onCreate={addElementProfile} onOpenChange={handleProfileDialogOpenChange} open={isProfileDialogOpen} />
      </DialogContent>
    </Dialog>
  )
}

export { ElementsDialog }
