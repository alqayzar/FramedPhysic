import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type GameProfile } from '@/lib/game-profiles'
import { Ellipsis, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ProfileTabsProps {
  activeProfileId?: string
  onAdd: () => void
  onDelete: (profileId: string) => Promise<void>
  onSelect: (profileId: string) => void
  profiles: GameProfile[]
}

function ProfileTabs(props: ProfileTabsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const activeProfile = props.profiles.find((profile) => profile.id === props.activeProfileId)

  function openDeleteDialog() {
    if (activeProfile) setIsDeleteDialogOpen(true)
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setIsDeleteDialogOpen(open)
  }

  async function handleDelete() {
    if (!activeProfile) return

    setIsDeleting(true)
    try {
      await props.onDelete(activeProfile.id)
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mt-5">
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-game-ink/50">Profils</p>
        {activeProfile && (
          <Button aria-label={`Options pour ${activeProfile.title}`} className="size-6 rounded-md border-0 bg-transparent p-0 text-game-ink/45 hover:bg-game-pink hover:text-white" onClick={openDeleteDialog} type="button">
            <Ellipsis aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
      <Tabs onValueChange={props.onSelect} value={props.activeProfileId}>
        <TabsList aria-label="Profils" className="flex h-12 w-full justify-start overflow-x-auto rounded-xl border-3 border-game-ink bg-game-purple/20 p-0 shadow-[0_4px_0_0_#16171d]">
        {props.profiles.map((profile) => (
        <TabsTrigger
          className="group h-full rounded-none border-r-3 border-game-ink bg-transparent px-4 py-2 font-black text-game-ink data-active:bg-game-yellow data-active:text-game-ink data-active:shadow-none"
          key={profile.id}
          value={profile.id}
        >
          <span className="transition-transform group-active:scale-95">{profile.title}</span>
        </TabsTrigger>
        ))}
        <Button
          aria-label="Ajouter un profil"
          className="group h-full min-w-12 flex-1 rounded-none border-0 bg-game-green px-3 py-2 text-white hover:bg-game-green"
          onClick={props.onAdd}
          type="button"
        >
          <Plus aria-hidden="true" className="size-5 transition-transform group-active:scale-90" />
        </Button>
        </TabsList>
      </Tabs>
      <Dialog onOpenChange={handleDeleteDialogOpenChange} open={isDeleteDialogOpen}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            <DialogTitle className="break-words text-2xl font-black tracking-[-0.04em]">Supprimer {activeProfile?.title} ?</DialogTitle>
          </DialogHeader>
          <p className="mt-3 text-sm font-bold leading-6 text-game-ink/70">Les éléments ou actions associés à ce profil seront aussi supprimés.</p>
          <Button className="cartoon-press mt-5 w-full rounded-xl border-4 border-game-ink bg-game-red px-4 py-3 font-black text-white hover:bg-game-red" disabled={isDeleting} onClick={handleDelete} type="button">
            <Trash2 aria-hidden="true" className="size-4" />
            {isDeleting ? 'Suppression...' : 'Supprimer le profil'}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { ProfileTabs }
