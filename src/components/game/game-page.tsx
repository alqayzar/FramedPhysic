import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { GameBoard } from '@/components/game/game-board'
import { PlayerAvatar } from '@/components/game/player-avatar'
import { GameRoleDialog } from '@/components/game/game-role-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmojiPickerDialog } from '@/components/settings/emoji-picker-dialog'
import { useGame } from '@/contexts/game-context'
import { createEmojiImage } from '@/lib/emoji-image'
import { GAME_ROLES, type GameRole } from '@/lib/game-session'
import { createSquareImage } from '@/lib/square-image'
import { cn } from '@/lib/utils'
import { Camera, Smile, Trash2 } from 'lucide-react'

const PORTRAIT_BUTTON_CLASS = 'cartoon-press h-14 w-full rounded-xl border-4 border-game-ink p-0'

interface PlayerDraft {
  image?: Blob
  name: string
}

interface GamePageProps {
  onOpenSettings: () => void
  onQuit: () => void
}

function shuffleRoles(innocents: number, saboteurs: number, enabledRoleNames: string[]): GameRole[] {
  const analystRole = GAME_ROLES[2]
  const roles: GameRole[] = [
    ...Array<GameRole>(innocents).fill(GAME_ROLES[0]),
    ...Array<GameRole>(saboteurs).fill(GAME_ROLES[1]),
  ]

  if (enabledRoleNames.includes(analystRole.name)) roles[0] = analystRole

  for (let index = roles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[roles[index], roles[swapIndex]] = [roles[swapIndex], roles[index]]
  }

  return roles
}

function GamePage(props: GamePageProps) {
  const { addGamePlayer, gamePlayers, gameSettings, isGamePlayersLoaded, isGameRoundLoaded, isGameSettingsLoaded } = useGame()
  const cameraInput = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<PlayerDraft>({ name: '' })
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [registrationIndex, setRegistrationIndex] = useState(0)
  const [roles, setRoles] = useState<GameRole[]>([])
  const [showRole, setShowRole] = useState(false)

  useEffect(() => {
    if (!isGameSettingsLoaded) return
    setRoles(shuffleRoles(gameSettings.teamCounts.innocents, gameSettings.teamCounts.saboteurs, gameSettings.enabledRoleNames))
  }, [gameSettings.enabledRoleNames, gameSettings.teamCounts, isGameSettingsLoaded])

  useEffect(() => {
    if (!isGamePlayersLoaded || showRole || gamePlayers.length < roles.length) return
    setRegistrationIndex(roles.length)
  }, [gamePlayers.length, isGamePlayersLoaded, roles.length, showRole])

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
  }

  function handleEmojiPickerOpenChange(open: boolean) {
    setIsEmojiPickerOpen(open)
  }

  function openCamera() {
    cameraInput.current?.click()
  }

  function openEmojiPicker() {
    setIsEmojiPickerOpen(true)
  }

  async function selectEmoji(emoji: string): Promise<void> {
    const image = await createEmojiImage(emoji)
    setDraft((currentDraft) => ({ ...currentDraft, image }))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0]
    event.target.value = ''
    if (image) {
      setDraft((currentDraft) => ({ ...currentDraft, image }))
      try {
        const squareImage = await createSquareImage(image)
        setDraft((currentDraft) => ({ ...currentDraft, image: squareImage }))
      } catch {
        // Keep the original camera image available if canvas processing fails.
      }
    }
  }

  function removePortrait() {
    setDraft((currentDraft) => ({ ...currentDraft, image: undefined }))
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim() || !roles[registrationIndex]) return

    const player = { ...draft, id: crypto.randomUUID(), name: draft.name.trim(), role: roles[registrationIndex] }
    addGamePlayer(player)
    setShowRole(true)
  }

  function handleRoleConfirmed() {
    setShowRole(false)
    setDraft({ name: '' })
    setRegistrationIndex((index) => index + 1)
  }

  if (!isGameSettingsLoaded || !isGamePlayersLoaded || !isGameRoundLoaded || roles.length === 0) {
    return <main className="game-background grid h-svh place-items-center text-xl font-black text-game-ink">Chargement...</main>
  }

  const isRegistrationComplete = registrationIndex >= roles.length
  const currentRole = roles[registrationIndex]

  return (
    <main className="game-background fixed inset-0 overflow-y-auto px-5 py-6 text-game-ink sm:px-8 sm:py-8">
      {isRegistrationComplete ? (
        <GameBoard onOpenSettings={props.onOpenSettings} onQuit={props.onQuit} />
      ) : (
        <Dialog modal={false} open>
          <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center font-black tracking-[-0.04em]">Nouveau joueur</DialogTitle>
            </DialogHeader>
            <form className="mt-4 flex flex-col gap-6" onSubmit={handleRegister}>
              <input aria-label="Nom du joueur" className=" h-12 w-full rounded-xl border-4 border-game-ink px-3 text-center text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none placeholder:text-game-ink/50 focus:ring-4 focus:ring-game-blue/30" onChange={handleNameChange} placeholder="Nom du joueur" value={draft.name} />
              <div className={cn('grid gap-3', draft.image && 'grid-cols-3', !draft.image && 'grid-cols-2')}>
                <Button aria-label="Prendre une photo" className={`${PORTRAIT_BUTTON_CLASS} bg-game-blue text-white hover:bg-game-blue`} onClick={openCamera} type="button">
                  <Camera aria-hidden="true" className="size-6" />
                </Button>
                <Button aria-label="Choisir un emoji" className={`${PORTRAIT_BUTTON_CLASS} bg-game-purple text-white hover:bg-game-purple`} onClick={openEmojiPicker} type="button">
                  <Smile aria-hidden="true" className="size-6" />
                </Button>
                {draft.image && (
                  <Button aria-label="Supprimer le portrait" className={`${PORTRAIT_BUTTON_CLASS} bg-game-red text-white hover:bg-game-red`} onClick={removePortrait} type="button">
                    <Trash2 aria-hidden="true" className="size-6" />
                  </Button>
                )}
              </div>
              <input accept="image/*" capture="environment" className="sr-only" onChange={handleImageChange} ref={cameraInput} type="file" />
              {draft.image && (
                <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border-4 border-game-ink bg-game-yellow shadow-[0_5px_0_0_#16171d]">
                  <PlayerAvatar className="block size-full object-cover object-center" image={draft.image} name="Portrait du joueur" />
                </div>
              )}
              <Button className="cartoon-press cartoon-press-md h-auto w-full rounded-xl border-4 border-game-ink bg-game-purple px-5 py-3 text-lg font-black text-white hover:bg-game-purple sm:text-xl" disabled={!draft.name.trim()} type="submit">Voir rôle</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <EmojiPickerDialog onOpenChange={handleEmojiPickerOpenChange} onSelect={selectEmoji} open={isEmojiPickerOpen} />

      {showRole && currentRole && (
        <GameRoleDialog onConfirm={handleRoleConfirmed} open role={currentRole} />
      )}
    </main>
  )
}

export { GamePage }
