import { GAME_ROLES, type GameRole } from '@/lib/game-session'
import { cn } from '@/lib/utils'

interface GameRoleIconProps {
  className?: string
  role: GameRole
}

function GameRoleIcon(props: GameRoleIconProps) {
  const source = GAME_ROLES.find((role) => role.name === props.role.name)?.icon

  return <img alt="" aria-hidden="true" className={cn('size-7 shrink-0', props.className)} src={source} />
}

export { GameRoleIcon }
