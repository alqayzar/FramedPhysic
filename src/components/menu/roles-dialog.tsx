import { GameRoleIcon } from '@/components/game/game-role-icon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GAME_ROLES, type GameRole } from '@/lib/game-session'
import { cn } from '@/lib/utils'
import { LockKeyhole } from 'lucide-react'

interface RolesDialogProps {
  onOpenChange: (open: boolean) => void
  onSelectedRoleNamesChange: (roleNames: string[]) => void
  open: boolean
  selectedRoleNames: string[]
}

function RolesDialog(props: RolesDialogProps) {
  function toggleRole(role: GameRole) {
    if (role.locked) return

    const nextRoleNames = new Set(props.selectedRoleNames)
    if (nextRoleNames.has(role.name)) nextRoleNames.delete(role.name)
    else nextRoleNames.add(role.name)
    GAME_ROLES.filter((availableRole) => availableRole.locked).forEach((lockedRole) => nextRoleNames.add(lockedRole.name))
    props.onSelectedRoleNamesChange([...nextRoleNames])
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] overflow-x-hidden overflow-y-auto rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg sm:p-7">
        <DialogHeader className="shrink-0 pb-5 text-center">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">Rôles</DialogTitle>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 pr-1 pb-1">
          {GAME_ROLES.map((role) => {
              const isLocked = role.locked
              const isSelected = role.locked || props.selectedRoleNames.includes(role.name)

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'relative flex min-w-0 w-full items-start gap-4 overflow-hidden rounded-2xl border-4 border-game-ink p-4 text-left shadow-[0_4px_0_0_#16171d]',
                    isSelected ? 'bg-game-yellow/30' : 'bg-white',
                    !isLocked && 'cartoon-press cursor-pointer',
                    isLocked && 'cursor-default',
                  )}
                  disabled={isLocked}
                  key={role.name}
                  onClick={() => toggleRole(role)}
                  type="button"
                >
                  <GameRoleIcon className="size-10" role={role} />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2 text-lg font-black">
                      <span className="min-w-0 break-all">{role.name}</span>
                      {isLocked && <LockKeyhole aria-label="Rôle verrouillé" className="size-4 shrink-0" />}
                    </span>
                    <span className="mt-1 block break-words text-xs font-bold leading-5 text-game-ink/65">{role.description}</span>
                  </span>
                </button>
              )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { RolesDialog }
