import { GameAtoutIcon } from '@/components/game/game-atout-icon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GAME_ATOUTS, type GameAtout } from '@/lib/game-session'
import { cn } from '@/lib/utils'

interface AtoutsDialogProps {
  onOpenChange: (open: boolean) => void
  onSelectedAtoutIdsChange: (atoutIds: string[]) => void
  open: boolean
  selectedAtoutIds: string[]
}

function AtoutsDialog(props: AtoutsDialogProps) {
  function toggleAtout(atout: GameAtout) {
    const nextAtoutIds = new Set(props.selectedAtoutIds)
    if (nextAtoutIds.has(atout.id)) nextAtoutIds.delete(atout.id)
    else nextAtoutIds.add(atout.id)
    props.onSelectedAtoutIdsChange([...nextAtoutIds])
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] overflow-x-hidden overflow-y-auto rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg sm:p-7">
        <DialogHeader className="shrink-0 pb-5 text-center">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">Atouts</DialogTitle>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 pr-1 pb-1">
          {GAME_ATOUTS.map((atout) => {
              const isSelected = props.selectedAtoutIds.includes(atout.id)

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'relative flex min-w-0 w-full items-start gap-4 overflow-hidden rounded-2xl border-4 border-game-ink p-4 text-left shadow-[0_4px_0_0_#16171d]',
                    isSelected ? 'bg-game-yellow/30' : 'bg-white',
                    'cartoon-press cursor-pointer',
                  )}
                  key={atout.id}
                  onClick={() => toggleAtout(atout)}
                  type="button"
                >
                  <GameAtoutIcon atout={atout} className="size-10" />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2 text-lg font-black">
                      <span className="min-w-0 break-all">{atout.name}</span>
                    </span>
                    <span className="mt-1 block break-words text-xs font-bold italic leading-5 text-game-ink/65">{atout.description}</span>
                  </span>
                </button>
              )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AtoutsDialog }
