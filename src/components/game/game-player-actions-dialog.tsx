import { GeneratedActionViewer } from '@/components/actions/generated-action-viewer'
import { GameAtoutIcon } from '@/components/game/game-atout-icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type GameAtout, type GamePlayer } from '@/lib/game-session'
import { cn } from '@/lib/utils'

interface GamePlayerActionsDialogProps {
  atoutActions: Array<{
    atout: GameAtout
    backgroundColor?: string
    disabled: boolean
    id: string
    label: string
    onClick: () => void
  }>
  onOpenChange: (open: boolean) => void
  open: boolean
  player: GamePlayer
}

function GamePlayerActionsDialog(props: GamePlayerActionsDialogProps) {
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle className="break-words text-2xl font-black tracking-[-0.06em]">Mes actions</DialogTitle>
        </DialogHeader>
        {props.atoutActions.length > 0 && (
          <div className="mt-4 grid gap-3">
            {props.atoutActions.map((action) => (
              <Button
                className={cn('cartoon-press h-auto w-full rounded-xl border-4 border-game-ink px-5 py-3 text-lg font-black text-white', action.disabled && 'bg-slate-400 hover:bg-slate-400')}
                disabled={action.disabled}
                key={action.id}
                onClick={action.onClick}
                style={action.disabled ? undefined : { backgroundColor: action.backgroundColor ?? 'var(--color-game-blue)' }}
                type="button"
              >
                <GameAtoutIcon atout={action.atout} className="size-6" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
        <div className="mt-5 max-h-[55svh] overflow-y-auto overscroll-contain pr-1">
          <GeneratedActionViewer actions={props.player.actions ?? []} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { GamePlayerActionsDialog }
