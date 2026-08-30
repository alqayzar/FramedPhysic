import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TimerSettings } from '@/components/settings/timer-settings'
import { GameplaySettings } from '@/components/settings/gameplay-settings'
import { useGame } from '@/contexts/game-context'

interface SettingsDialogProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

function SettingsDialog(props: SettingsDialogProps) {
  const { gameSettings, saveGameSettings } = useGame()

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="flex h-svh w-svw max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-5 text-game-ink shadow-none sm:p-8">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            Paramètres
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
          <TimerSettings onSave={saveGameSettings} settings={gameSettings} />
          <GameplaySettings onSave={saveGameSettings} settings={gameSettings} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
