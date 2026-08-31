import { GeneratedActionViewer } from '@/components/actions/generated-action-viewer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GAME_ROLES, type GamePlayer } from '@/lib/game-session'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface GamePlayerActionsDialogProps {
  canCorruptAction: boolean
  corruptedActionId?: string
  onCorruptAction: (actionId: string, isSelected: boolean) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  player: GamePlayer
  players: GamePlayer[]
}

function GamePlayerActionsDialog(props: GamePlayerActionsDialogProps) {
  const isSaboteur = props.player.role.name === GAME_ROLES[1].name
  const selectedActionIds = props.corruptedActionId ? [props.corruptedActionId] : []
  const selectionProps = {
    onSelect: props.canCorruptAction ? props.onCorruptAction : undefined,
    selectedActionClassName: 'ring-8 ring-inset ring-game-red',
    selectedActionIds,
  }

  function hasCorruptedAction(player: GamePlayer): boolean {
    return Boolean(props.corruptedActionId && player.actions?.some((action) => action.id === props.corruptedActionId))
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle className="break-words text-2xl font-black tracking-[-0.06em]">{isSaboteur ? 'Actions' : 'Mes actions'}</DialogTitle>
        </DialogHeader>
        {isSaboteur ? (
          <div className="mt-5 max-h-[65svh] overflow-y-auto pr-1">
            {props.canCorruptAction && <p className="mb-3 font-bold text-game-red">Choisis une action à corrompre.</p>}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className={cn('group flex w-full items-center justify-between py-2 text-left text-lg font-black', hasCorruptedAction(props.player) && 'text-game-red')}>
                <span>Mes actions</span>
                <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="collapsible-panel">
                <div className="py-3">
                  <GeneratedActionViewer actions={props.player.actions ?? []} {...selectionProps} />
                </div>
              </CollapsibleContent>
            </Collapsible>
            {props.players.filter((player) => player.id !== props.player.id && !player.eliminated).map((player) => (
              <Collapsible key={player.id}>
                <CollapsibleTrigger className={cn('group mt-3 flex w-full items-center justify-between py-2 text-left text-sm font-bold', hasCorruptedAction(player) ? 'text-game-red' : 'text-game-ink/55')}>
                  <span className="truncate pr-3">{player.name}</span>
                  <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-panel">
                  <div className="py-3">
                    <GeneratedActionViewer actions={player.actions ?? []} {...selectionProps} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="mt-5 max-h-[55svh] overflow-y-auto overscroll-contain pr-1">
            <GeneratedActionViewer actions={props.player.actions ?? []} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { GamePlayerActionsDialog }
