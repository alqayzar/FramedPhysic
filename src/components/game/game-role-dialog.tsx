import { Button } from '@/components/ui/button'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { GameAtoutIcon } from '@/components/game/game-atout-icon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type GameAtout, type GameRole } from '@/lib/game-session'

interface GameRoleDialogProps {
  atouts?: GameAtout[]
  onConfirm: () => void
  onOpenChange?: (open: boolean) => void
  open: boolean
  playerName?: string
  role: GameRole
}

function GameRoleDialog(props: GameRoleDialogProps) {
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] overflow-x-hidden rounded-2xl border-4 border-game-ink bg-game-yellow p-6 text-center text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-sm" showCloseButton={false}>
        {props.playerName && (
          <DialogHeader className="min-w-0">
            <DialogTitle className="max-w-full break-all text-2xl font-black tracking-[-0.06em]">{props.playerName}</DialogTitle>
          </DialogHeader>
        )}
        <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-6 shadow-[0_6px_0_0_#16171d]">
          <h2 className="flex w-full min-w-0 items-center justify-center gap-3 text-2xl font-black tracking-[-0.06em]">
            <GameRoleIcon className="size-8" role={props.role} />
            <span className="min-w-0 break-all">{props.role.name}</span>
            <GameRoleIcon className="size-8" role={props.role} />
          </h2>
          <p className="mt-4 break-words text-base font-bold leading-5 text-game-ink/65">{props.role.description}</p>
          {props.atouts && props.atouts.length > 0 && (
            <div className="mt-6">
              <div className="mt-3 grid gap-3">
                {props.atouts.map((atout) => (
                  <p className="min-w-0 break-words text-left text-sm font-bold leading-5" key={atout.id}>
                    <GameAtoutIcon atout={atout} className="mr-2 inline-block size-6 align-text-bottom" />
                    <span className="font-black text-game-ink">{atout.name}</span>
                    <span className="italic text-game-ink/65"> {atout.description}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button className="cartoon-press cartoon-press-md mt-8 w-full rounded-xl border-4 border-game-ink bg-game-purple px-5 py-4 text-xl font-black text-white hover:bg-game-purple" onClick={props.onConfirm} type="button">Ok</Button>
      </DialogContent>
    </Dialog>
  )
}

export { GameRoleDialog }
