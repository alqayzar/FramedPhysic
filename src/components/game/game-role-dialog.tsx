import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type GameRole } from '@/lib/game-session'

interface GameRoleDialogProps {
  onConfirm: () => void
  open: boolean
  playerName?: string
  role: GameRole
}

function GameRoleDialog(props: GameRoleDialogProps) {
  return (
    <Dialog open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-game-yellow p-6 text-center text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-sm" showCloseButton={false}>
        {props.playerName && (
          <DialogHeader>
            <DialogTitle className="break-words text-2xl font-black tracking-[-0.06em]">{props.playerName}</DialogTitle>
          </DialogHeader>
        )}
        <div className="mt-4 rounded-2xl border-4 border-game-ink bg-white p-6 shadow-[0_6px_0_0_#16171d]">
          <h2 className="text-4xl font-black tracking-[-0.06em]">{props.role.name}</h2>
          <p className="mt-4 text-base font-bold leading-7 text-game-ink/65">{props.role.description}</p>
        </div>
        <Button className="cartoon-press cartoon-press-md mt-8 w-full rounded-xl border-4 border-game-ink bg-game-purple px-5 py-4 text-xl font-black text-white hover:bg-game-purple" onClick={props.onConfirm} type="button">Ok</Button>
      </DialogContent>
    </Dialog>
  )
}

export { GameRoleDialog }
