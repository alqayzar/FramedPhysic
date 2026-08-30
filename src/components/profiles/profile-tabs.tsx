import { Button } from '@/components/ui/button'
import { ProfileEditDialog } from '@/components/profiles/profile-edit-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type GameProfile } from '@/lib/game-profiles'
import { Ellipsis, Plus } from 'lucide-react'
import { useState } from 'react'

interface ProfileTabsProps {
  activeProfileId?: string
  contentLabel: string
  onAdd: () => void
  onClear: (profileId: string) => Promise<void>
  onDelete: (profileId: string) => Promise<void>
  onExport: (profileId: string, title: string) => Promise<void>
  onImport: (profileId: string, file: File) => Promise<void>
  onSelect: (profileId: string) => void
  onRename: (profileId: string, title: string) => Promise<void>
  profiles: GameProfile[]
}

function ProfileTabs(props: ProfileTabsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const activeProfile = props.profiles.find((profile) => profile.id === props.activeProfileId)

  function openEditDialog() {
    if (activeProfile) setIsEditDialogOpen(true)
  }

  function handleEditDialogOpenChange(open: boolean) {
    setIsEditDialogOpen(open)
  }

  return (
    <section className="mt-5">
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-game-ink/50">Profils</p>
        {activeProfile && (
          <Button aria-label={`Modifier ${activeProfile.title}`} className="size-6 rounded-md border-0 bg-transparent p-0 text-game-ink/45 hover:bg-game-pink hover:text-white" onClick={openEditDialog} type="button">
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
      <ProfileEditDialog
        contentLabel={props.contentLabel}
        onClear={props.onClear}
        onDelete={props.onDelete}
        onExport={props.onExport}
        onImport={props.onImport}
        onOpenChange={handleEditDialogOpenChange}
        onRename={props.onRename}
        open={isEditDialogOpen}
        profile={activeProfile}
      />
    </section>
  )
}

export { ProfileTabs }
