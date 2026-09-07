import { useEffect, useState, type MouseEvent } from 'react'
import { ProfileDialog } from '@/components/profiles/profile-dialog'
import { ProfileTabs } from '@/components/profiles/profile-tabs'
import { ActionElementCard } from '@/components/settings/action-element-card'
import { ActionElementDialog } from '@/components/settings/action-element-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGame } from '@/contexts/game-context'
import { type ActionElement } from '@/lib/action-elements'
import { cn } from '@/lib/utils'
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
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const {
    actionElements,
    activeElementProfileId,
    actionElementsError,
    addActionElement,
    addElementProfile,
    clearElementProfile,
    deleteActionElement,
    duplicateActionElement,
    deleteElementProfile,
    elementProfiles,
    exportElementProfile,
    importElementProfile,
    isGameSettingsLoaded,
    updateActionElement,
    updateElementProfile,
    setActiveElementProfileId,
  } = useGame()

  useEffect(() => {
    if (!isGameSettingsLoaded) return
    if (!elementProfiles.some((profile) => profile.id === activeElementProfileId)) setActiveElementProfileId(elementProfiles[0]?.id)
  }, [activeElementProfileId, elementProfiles, isGameSettingsLoaded])

  useEffect(() => {
    setSelectedTags(new Set())
  }, [activeElementProfileId])

  function handleOpenChange(open: boolean) {
    props.onOpenChange(open)
    if (!open) handleElementDialogOpenChange(false)
  }

  function openCreateDialog() {
    if (!activeElementProfileId) return
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
    setActiveElementProfileId(profileId)
  }

  function handleTagFilterClick(event: MouseEvent<HTMLButtonElement>) {
    const tag = event.currentTarget.dataset.tag
    if (!tag) return

    setSelectedTags((currentTags) => {
      const nextTags = new Set(currentTags)
      if (nextTags.has(tag)) nextTags.delete(tag)
      else nextTags.add(tag)
      return nextTags
    })
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

  async function clearFilteredElements(profileId: string): Promise<void> {
    await clearElementProfile(profileId, filteredElements.map((element) => element.id))
    setSelectedTags(new Set())
  }

  const profileElements = actionElements.filter((element) => element.profileId === activeElementProfileId)
  const profileTags = getExistingTags(profileElements)
  const filteredElements = profileElements.filter((element) => [...selectedTags].every((tag) => element.tags.includes(tag)))

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent className="flex h-svh w-svw max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-5 text-game-ink shadow-none sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            Éléments
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 shrink-0">
          <ProfileTabs
            activeProfileId={activeElementProfileId}
            contentLabel="éléments"
            onAdd={openProfileDialog}
            onClear={clearFilteredElements}
            onDelete={deleteElementProfile}
            onExport={exportElementProfile}
            onImport={importElementProfile}
            onRename={updateElementProfile}
            onSelect={handleProfileSelect}
            profiles={elementProfiles}
          />
          <Button
            className="cartoon-press h-auto w-full max-w-none rounded-xl border-4 border-game-ink bg-game-blue px-4 py-3 text-sm font-black text-white hover:bg-game-blue sm:px-5 sm:text-base"
              disabled={!activeElementProfileId}
            onClick={openCreateDialog}
            type="button"
          >
            <Plus aria-hidden="true" className="size-5" />
            Ajouter un élément
          </Button>
          {profileTags.length > 0 && (
            <ul aria-label="Filtrer par tags" className="flex gap-2 overflow-x-auto pb-1">
              {profileTags.map((tag) => (
                <li key={tag}>
                  <button
                    aria-pressed={selectedTags.has(tag)}
                    className={cn(
                      'shrink-0 rounded-full border-2 border-game-ink px-3 font-bold',
                      selectedTags.has(tag) ? 'bg-game-purple text-xs text-white' : 'bg-white text-xs text-game-ink',
                    )}
                    data-tag={tag}
                    onClick={handleTagFilterClick}
                    type="button"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          {actionElementsError && <p className="mt-5 font-bold text-red-700">{actionElementsError}</p>}

          <div className="grid w-full min-w-0 gap-4 pb-1 sm:grid-cols-2">
            {filteredElements.map((element) => (
              <ActionElementCard
                element={element}
                key={element.id}
                onDelete={deleteElement}
                onDuplicate={duplicateElement}
                onSelect={openEditor}
              />
            ))}
          </div>

          {filteredElements.length === 0 && !isElementDialogOpen && (
            <p className="mt-12 text-center text-base font-bold text-game-ink/60">
              {selectedTags.size > 0 ? 'Aucun élément ne correspond aux tags sélectionnés.' : 'Aucun élément pour le moment.'}
            </p>
          )}
        </div>

        <ActionElementDialog
          availableTags={getExistingTags(actionElements)}
          element={editingElement}
          initialTags={[...selectedTags]}
          onOpenChange={handleElementDialogOpenChange}
          onSave={saveElement}
          open={isElementDialogOpen}
          profileId={activeElementProfileId ?? ''}
        />
        <ProfileDialog onCreate={addElementProfile} onOpenChange={handleProfileDialogOpenChange} open={isProfileDialogOpen} />
      </DialogContent>
    </Dialog>
  )
}

export { ElementsDialog }
