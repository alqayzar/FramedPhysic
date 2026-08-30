import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GameQuitDialogProps {
  isRoundRunning: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
}

function GameQuitDialog(props: GameQuitDialogProps) {
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Quitter la partie ?</DialogTitle>
        </DialogHeader>
        <p className="mt-3 text-sm font-bold leading-6 text-game-ink/70">
          {props.isRoundRunning
            ? 'La manche sera terminée. Les joueurs et leurs actions resteront prêts pour la prochaine manche.'
            : 'Cette partie et ses joueurs seront supprimés.'}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button className="cartoon-press cartoon-press-md h-auto rounded-xl border-4 border-game-ink bg-white px-5 py-4 text-base font-black text-game-ink hover:bg-white sm:text-lg" onClick={() => props.onOpenChange(false)} type="button">Annuler</Button>
          <Button className="cartoon-press cartoon-press-md h-auto rounded-xl border-4 border-game-ink bg-game-red px-5 py-4 text-base font-black text-white hover:bg-game-red sm:text-lg" onClick={props.onConfirm} type="button">Quitter</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { GameQuitDialog }
