import { useEffect, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { GameAtoutIcon } from '@/components/game/game-atout-icon'
import { AtoutsDialog } from '@/components/menu/atouts-dialog'
import { useGame } from '@/contexts/game-context'
import { GAME_ATOUTS, GAME_ROLES } from '@/lib/game-session'
import { Minus, Plus, Users } from 'lucide-react'

function TeamSetup() {
  const [innocents, setInnocents] = useState(2)
  const [saboteurs, setSaboteurs] = useState(1)
  const [isAtoutsDialogOpen, setIsAtoutsDialogOpen] = useState(false)
  const { gameSettings, saveGameSettings, saveTeamCounts } = useGame()

  useEffect(() => {
    setInnocents(gameSettings.teamCounts.innocents)
    setSaboteurs(gameSettings.teamCounts.saboteurs)
  }, [gameSettings.teamCounts])

  function clampPlayers(value: number): number {
    return Math.min(Math.max(value, 0), 99)
  }

  function getMaximumSaboteurs(innocentCount: number): number {
    return innocentCount
  }

  function persistTeamCounts(nextInnocents: number, nextSaboteurs: number) {
    void saveTeamCounts({ innocents: nextInnocents, saboteurs: nextSaboteurs })
  }

  function updateInnocents(value: number) {
    const count = Math.max(clampPlayers(value), 2)
    const nextSaboteurs = Math.max(Math.min(saboteurs, getMaximumSaboteurs(count)), 1)
    setInnocents(count)
    setSaboteurs(nextSaboteurs)
    persistTeamCounts(count, nextSaboteurs)
  }

  function handleInnocentsChange(event: ChangeEvent<HTMLInputElement>) {
    updateInnocents(Number.parseInt(event.target.value, 10) || 0)
  }

  function handleSaboteursChange(event: ChangeEvent<HTMLInputElement>) {
    const count = Math.max(Math.min(clampPlayers(Number.parseInt(event.target.value, 10) || 0), getMaximumSaboteurs(innocents)), 1)
    setSaboteurs(count)
    persistTeamCounts(innocents, count)
  }

  function decreaseInnocents() {
    updateInnocents(innocents - 1)
  }

  function increaseInnocents() {
    updateInnocents(innocents + 1)
  }

  function decreaseSaboteurs() {
    const count = Math.max(saboteurs - 1, 1)
    setSaboteurs(count)
    persistTeamCounts(innocents, count)
  }

  function increaseSaboteurs() {
    const count = Math.min(clampPlayers(saboteurs + 1), getMaximumSaboteurs(innocents))
    setSaboteurs(count)
    persistTeamCounts(innocents, count)
  }

  function handleAtoutsDialogOpenChange(open: boolean) {
    setIsAtoutsDialogOpen(open)
  }

  function handleSelectedAtoutIdsChange(enabledAtoutIds: string[]) {
    void saveGameSettings({ ...gameSettings, enabledAtoutIds })
  }

  return (
    <section className="relative w-full max-w-sm" aria-label="Composition des équipes">
      <div aria-label="Nombre de joueurs" className="absolute -top-5 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border-3 border-game-ink bg-white px-2.5 py-1 text-md font-black shadow-[0_3px_0_0_#16171d]">
        <Users aria-hidden="true" className="size-6" />
        {innocents + saboteurs}
      </div>
      <Button className="cartoon-press absolute -top-5 right-4 z-10 h-auto rounded-full border-3 border-game-ink bg-game-purple px-3 py-1 text-md font-black text-white hover:bg-game-purple" onClick={() => setIsAtoutsDialogOpen(true)} type="button">
        <span>Atouts</span>
        {GAME_ATOUTS.some((atout) => gameSettings.enabledAtoutIds.includes(atout.id)) && (
          <span aria-hidden="true" className="flex -space-x-1">
          {GAME_ATOUTS.filter((atout) => atout.visible !== false && gameSettings.enabledAtoutIds.includes(atout.id)).map((atout) => (
              <GameAtoutIcon atout={atout} className="size-5 rounded-full border-2 border-black bg-white" key={atout.id} />
            ))}
          </span>
        )}
      </Button>
      <div className="rounded-2xl border-4 border-game-ink bg-game-yellow p-4 text-center shadow-[0_5px_0_0_#16171d]">
        <div className="grid gap-3">
          <div>
            <p className="mb-1 flex items-center justify-center gap-2 text-sm font-black"><GameRoleIcon className="size-6" role={GAME_ROLES[0]} />Innocents</p>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3">
              <Button aria-label="Retirer un innocent" className="cartoon-press h-11 rounded-lg border-3 border-game-ink bg-game-red p-2 text-white hover:bg-game-red" disabled={innocents <= 2} onClick={decreaseInnocents} type="button">
                <Minus aria-hidden="true" className="size-5" />
              </Button>
              <input aria-label="Nombre d’innocents" className="h-11 w-full min-w-0 rounded-lg border-3 border-game-ink bg-white text-center text-lg font-black shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-green/30" min="2" onChange={handleInnocentsChange} type="number" value={innocents} />
              <Button aria-label="Ajouter un innocent" className="cartoon-press h-11 rounded-lg border-3 border-game-ink bg-game-green p-2 text-white hover:bg-game-green" onClick={increaseInnocents} type="button">
                <Plus aria-hidden="true" className="size-5" />
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-1 flex items-center justify-center gap-2 text-sm font-black"><GameRoleIcon className="size-6" role={GAME_ROLES[1]} />Saboteurs</p>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3">
              <Button aria-label="Retirer un saboteur" className="cartoon-press h-11 rounded-lg border-3 border-game-ink bg-game-red p-2 text-white hover:bg-game-red" disabled={saboteurs <= 1} onClick={decreaseSaboteurs} type="button">
                <Minus aria-hidden="true" className="size-5" />
              </Button>
              <input aria-label="Nombre de saboteurs" className="h-11 w-full min-w-0 rounded-lg border-3 border-game-ink bg-white text-center text-lg font-black shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-pink/30" max={getMaximumSaboteurs(innocents)} min="1" onChange={handleSaboteursChange} type="number" value={saboteurs} />
              <Button aria-label="Ajouter un saboteur" className="cartoon-press h-11 rounded-lg border-3 border-game-ink bg-game-green p-2 text-white hover:bg-game-green" disabled={saboteurs >= getMaximumSaboteurs(innocents)} onClick={increaseSaboteurs} type="button">
                <Plus aria-hidden="true" className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AtoutsDialog onOpenChange={handleAtoutsDialogOpenChange} onSelectedAtoutIdsChange={handleSelectedAtoutIdsChange} open={isAtoutsDialogOpen} selectedAtoutIds={gameSettings.enabledAtoutIds} />
    </section>
  )
}

export { TeamSetup }
