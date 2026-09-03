import { PlayerAvatar } from '@/components/game/player-avatar'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { type GamePlayer } from '@/lib/game-session'
import { cn } from '@/lib/utils'
import { Crown, Eye } from 'lucide-react'

interface GamePlayerCardProps {
  isActive: boolean
  isEliminated: boolean
  isRoundRunning: boolean
  isTargetSelectionEnabled?: boolean
  isVoting: boolean
  isWinner?: boolean
  showRole?: boolean
  showRoleAfterElimination: boolean
  isRoleSelectionEnabled: boolean
  onRoleSelect: (playerId: string) => void
  player: GamePlayer
}

function GamePlayerCard(props: GamePlayerCardProps) {
  function selectRole() {
    props.onRoleSelect(props.player.id)
  }

  const isSelectable = !props.isEliminated && (props.isRoleSelectionEnabled || props.isRoundRunning || props.isTargetSelectionEnabled || props.isVoting)
  const crownRotations = ['-rotate-6', '-rotate-3', 'rotate-3', 'rotate-6']
  const crownRotation = crownRotations[[...props.player.id].reduce((total, character) => total + character.charCodeAt(0), 0) % crownRotations.length]

  return (
    <article className="relative" id={`game-player-${props.player.id}`}>
      <button
        aria-label={isSelectable ? `Sélectionner ${props.player.name}` : props.player.name}
        className={cn(
          'w-full overflow-y-hidden rounded-2xl border-4 border-game-ink bg-white text-game-ink shadow-[0_5px_0_0_#16171d]',
          props.isEliminated && 'bg-game-ink/10 text-game-ink/50',
           props.isRoleSelectionEnabled && !props.isEliminated && 'cartoon-press cursor-pointer ring-4 ring-game-purple/40',
           props.isTargetSelectionEnabled && !props.isEliminated && 'cartoon-press cursor-pointer ring-4 ring-game-blue/50',
          !props.isRoleSelectionEnabled && isSelectable && 'cartoon-press cursor-pointer',
          !isSelectable && 'cursor-default',
          props.isActive && '!ring-4 ring-game-green',
        )}
        disabled={!isSelectable}
        onClick={selectRole}
        type="button"
      >
        <div className="relative aspect-square bg-game-yellow/30">
          <div className={cn('size-full', props.isEliminated && 'grayscale opacity-45')}>
            <PlayerAvatar image={props.player.image} name={props.player.name} />
          </div>
        </div>
        <h2 className="truncate p-2 text-center text-sm font-black" title={props.player.name}>{props.player.name}</h2>
      </button>
      {((props.isEliminated && props.showRoleAfterElimination) || props.showRole) && (
        <span className={cn('absolute z-10 grid size-11 -translate-x-1/2 place-items-center rounded-full border-3 border-game-ink bg-white shadow-[0_3px_0_0_#16171d]', props.isWinner ? '-top-3 left-[calc(50%+1rem)]' : '-top-3 left-1/2')}>
          <GameRoleIcon className="size-8" role={props.player.role} />
        </span>
      )}
      {props.isWinner && (
        <span aria-label={`${props.player.name} a gagné`} className="absolute -top-3 left-[calc(50%-1rem)] z-20 grid size-11 -translate-x-1/2 place-items-center rounded-full border-3 border-game-ink bg-game-yellow shadow-[0_3px_0_0_#16171d]">
          <Crown aria-hidden="true" className={cn('size-7 fill-game-yellow text-game-ink', crownRotation)} />
        </span>
      )}
      {props.isRoleSelectionEnabled && !props.isEliminated && (
        <button
          aria-label={`Voir le rôle de ${props.player.name}`}
          className="absolute -top-3 left-1/2 z-10 grid size-11 -translate-x-1/2 place-items-center rounded-full border-3 border-game-ink bg-game-purple text-white shadow-[0_3px_0_0_#16171d]"
          onClick={selectRole}
          type="button"
        >
          <Eye aria-hidden="true" className="size-6" />
        </button>
      )}
    </article>
  )
}

export { GamePlayerCard }
