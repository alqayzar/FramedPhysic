import { Button } from '@/components/ui/button'
import { TeamSetup } from '@/components/menu/team-setup'
import { Boxes, ListChecks, Settings } from 'lucide-react'

interface MainMenuProps {
  onOpenActions: () => void
  onOpenElements: () => void
  onOpenSettings: () => void
}

function MainMenu(props: MainMenuProps) {
  return (
    <main className="game-background flex h-svh flex-col overflow-hidden px-5 py-6 text-game-ink sm:px-8 sm:py-8">
      <header className="shrink-0 text-center">
        <h1 className="font-black text-6xl leading-none tracking-[-0.08em] sm:text-8xl md:text-9xl">
          Framed
        </h1>
        <div className="mx-auto mt-3 h-2 w-24 -rotate-2 rounded-full bg-game-pink sm:w-32" />
      </header>

      <footer className="fixed inset-x-5 bottom-6 z-10 flex flex-col items-center gap-4 text-center sm:inset-x-8 sm:bottom-8">
        <TeamSetup />
        <Button
          className="cartoon-press cartoon-press-md h-auto w-full max-w-sm rounded-xl border-4 border-game-ink bg-game-green px-8 py-3 text-lg font-black text-white hover:bg-game-green sm:text-xl"
          onClick={props.onOpenActions}
          type="button"
        >
          <ListChecks aria-hidden="true" className="size-6" />
          Actions
        </Button>
        <Button
          className="cartoon-press cartoon-press-md h-auto w-full max-w-sm rounded-xl border-4 border-game-ink bg-game-pink px-8 py-3 text-lg font-black text-white hover:bg-game-pink sm:text-xl"
          onClick={props.onOpenElements}
          type="button"
        >
          <Boxes aria-hidden="true" className="size-6" />
          Éléments
        </Button>
        <Button
          className="cartoon-press cartoon-press-md h-auto w-full max-w-sm rounded-xl border-4 border-game-ink bg-game-blue px-8 py-3 text-lg font-black text-white hover:bg-game-blue sm:text-xl"
          onClick={props.onOpenSettings}
          type="button"
        >
          <Settings aria-hidden="true" className="size-6" />
          Paramètres
        </Button>
        <Button
          className="cartoon-press cartoon-press-lg h-auto w-full max-w-sm rounded-xl border-4 border-game-ink bg-game-purple px-8 py-4 text-xl font-black text-white hover:bg-game-purple sm:text-2xl"
          type="button"
        >
          Lancer
        </Button>
      </footer>
    </main>
  )
}

export { MainMenu }
