import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface GameTimerProps {
  endsAt: number
  label: string
  onClick?: () => void
  onExpire?: () => void
}

function GameTimer(props: GameTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const hasExpired = useRef(false)

  useEffect(() => {
    hasExpired.current = false

    function updateRemainingTime() {
      const remaining = Math.max(0, Math.ceil((props.endsAt - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining === 0 && !hasExpired.current) {
        hasExpired.current = true
        props.onExpire?.()
      }
    }

    updateRemainingTime()
    const intervalId = window.setInterval(updateRemainingTime, 250)
    return () => window.clearInterval(intervalId)
  }, [props.endsAt])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isUrgent = remainingSeconds > 0 && remainingSeconds < 60

  const content = (
    <>
      <span className="block text-xs uppercase tracking-[0.16em]">{props.label}</span>
      <time className={cn('block text-3xl tracking-[0.08em]', isUrgent && 'animate-pulse text-game-red')} dateTime={`PT${remainingSeconds}S`}>{formattedTime}</time>
    </>
  )

  if (props.onClick) {
    return <button aria-label={`Terminer ${props.label.toLowerCase()}`} className="cartoon-press w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-center font-black text-game-ink shadow-[0_5px_0_0_#16171d]" onClick={props.onClick} type="button">{content}</button>
  }

  return <div aria-live="polite" className="w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-center font-black text-game-ink shadow-[0_5px_0_0_#16171d]">{content}</div>
}

export { GameTimer }
