import { type GameAtout } from '@/lib/game-session'
import { cn } from '@/lib/utils'

interface GameAtoutIconProps {
  atout: GameAtout
  className?: string
}

function GameAtoutIcon(props: GameAtoutIconProps) {
  return <img alt="" className={cn('object-contain', props.className)} src={props.atout.icon} />
}

export { GameAtoutIcon }
