import { useEffect, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { useGame } from '@/contexts/game-context'
import { GAME_ROLES } from '@/lib/game-session'
import { Minus, Plus, Users } from 'lucide-react'

function TeamSetup() {
  const [innocents, setInnocents] = useState(2)
  const [saboteurs, setSaboteurs] = useState(1)
  const { gameSettings, saveTeamCounts } = useGame()

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

  return (
    <section className="w-full max-w-sm" aria-label="Composition des équipes">
      <div className="rounded-2xl border-4 border-game-ink bg-game-yellow p-4 text-center shadow-[0_5px_0_0_#16171d]">
        <div className="flex items-center justify-center gap-2">
          <Users aria-hidden="true" className="size-5" />
          <p className="text-sm font-black uppercase tracking-wide">{innocents + saboteurs} joueurs</p>
        </div>
        <div className="mt-4 grid gap-3">
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
    </section>
  )
}

export { TeamSetup }
