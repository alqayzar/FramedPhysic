import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TimerSettings } from '@/components/settings/timer-settings'
import { useGame } from '@/contexts/game-context'

interface SettingsDialogProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

function SettingsDialog(props: SettingsDialogProps) {
  const { gameSettings, saveGameSettings } = useGame()

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-3xl sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            Paramètres
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          <TimerSettings onSave={saveGameSettings} settings={gameSettings} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
