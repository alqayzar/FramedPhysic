import innocentIcon from '../../../innocent.svg?url'
import saboteurIcon from '../../../saboteur.svg?url'
import { GAME_ROLES, type GameRole } from '@/lib/game-session'
import { cn } from '@/lib/utils'

interface GameRoleIconProps {
  className?: string
  role: GameRole
}

function GameRoleIcon(props: GameRoleIconProps) {
  const source = props.role.name === GAME_ROLES[1].name ? saboteurIcon : innocentIcon

  return <img alt="" aria-hidden="true" className={cn('size-7 shrink-0', props.className)} src={source} />
}

export { GameRoleIcon }
