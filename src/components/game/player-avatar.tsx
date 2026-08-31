import { useLayoutEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserRound } from 'lucide-react'

interface PlayerAvatarProps {
  className?: string
  image?: Blob
  name: string
}

function PlayerAvatar(props: PlayerAvatarProps) {
  const [source, setSource] = useState('')

  useLayoutEffect(() => {
    if (!props.image) {
      setSource('')
      return
    }

    const objectUrl = URL.createObjectURL(props.image)
    setSource(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [props.image])

  if (source) {
    return (
      <img
        alt=""
        className={cn('block size-full object-contain object-center', props.className)}
        src={source}
      />
    )
  }
  return (
    <span aria-label={props.name} className="grid size-full place-items-center text-game-ink/55" role="img">
      <UserRound aria-hidden="true" className="size-1/2" />
    </span>
  )
}

export { PlayerAvatar }
