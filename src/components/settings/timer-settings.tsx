import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { type GameSettings, type TeamCounts } from '@/lib/game-settings'
import { ChevronDown } from 'lucide-react'

interface TimerSettingsProps {
  onSave: (settings: GameSettings) => Promise<void>
  settings: GameSettings
}

function clamp(value: string, maximum: number): number {
  const number = Number.parseInt(value, 10)
  if (Number.isNaN(number)) return 0
  return Math.min(Math.max(number, 0), maximum)
}

function createSettings(
  roundLossMinutes: string,
  roundLossSeconds: string,
  roundMinutes: string,
  roundSeconds: string,
  turnMinutes: string,
  turnSeconds: string,
  teamCounts: TeamCounts,
): GameSettings {
  return {
    roundLossTimeout: {
      minutes: clamp(roundLossMinutes, 999),
      seconds: clamp(roundLossSeconds, 59),
    },
    roundTimeout: {
      minutes: clamp(roundMinutes, 999),
      seconds: clamp(roundSeconds, 59),
    },
    turnTimeout: {
      minutes: clamp(turnMinutes, 999),
      seconds: clamp(turnSeconds, 59),
    },
    teamCounts,
  }
}

function TimerSettings(props: TimerSettingsProps) {
  const [roundLossMinutes, setRoundLossMinutes] = useState(String(props.settings.roundLossTimeout.minutes))
  const [roundLossSeconds, setRoundLossSeconds] = useState(String(props.settings.roundLossTimeout.seconds))
  const [roundMinutes, setRoundMinutes] = useState(String(props.settings.roundTimeout.minutes))
  const [roundSeconds, setRoundSeconds] = useState(String(props.settings.roundTimeout.seconds))
  const [turnMinutes, setTurnMinutes] = useState(String(props.settings.turnTimeout.minutes))
  const [turnSeconds, setTurnSeconds] = useState(String(props.settings.turnTimeout.seconds))
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const changeVersion = useRef(0)

  useEffect(() => {
    if (hasChanges) return
    setRoundLossMinutes(String(props.settings.roundLossTimeout.minutes))
    setRoundLossSeconds(String(props.settings.roundLossTimeout.seconds))
    setRoundMinutes(String(props.settings.roundTimeout.minutes))
    setRoundSeconds(String(props.settings.roundTimeout.seconds))
    setTurnMinutes(String(props.settings.turnTimeout.minutes))
    setTurnSeconds(String(props.settings.turnTimeout.seconds))
  }, [hasChanges, props.settings])

  async function handleBlur() {
    if (!hasChanges) return

    const version = changeVersion.current
    setIsSaving(true)
    setErrorMessage('')

    try {
      await props.onSave(createSettings(roundLossMinutes, roundLossSeconds, roundMinutes, roundSeconds, turnMinutes, turnSeconds, props.settings.teamCounts))
      if (changeVersion.current === version) setHasChanges(false)
    } catch {
      setErrorMessage('Impossible d’enregistrer les chronomètres.')
    } finally {
      setIsSaving(false)
    }
  }

  function markChanged() {
    changeVersion.current += 1
    setHasChanges(true)
  }

  function handleRoundMinutesChange(event: ChangeEvent<HTMLInputElement>) {
    setRoundMinutes(event.target.value)
    markChanged()
  }

  function handleRoundLossMinutesChange(event: ChangeEvent<HTMLInputElement>) {
    setRoundLossMinutes(event.target.value)
    markChanged()
  }

  function handleRoundLossSecondsChange(event: ChangeEvent<HTMLInputElement>) {
    setRoundLossSeconds(event.target.value)
    markChanged()
  }

  function handleRoundSecondsChange(event: ChangeEvent<HTMLInputElement>) {
    setRoundSeconds(event.target.value)
    markChanged()
  }

  function handleTurnMinutesChange(event: ChangeEvent<HTMLInputElement>) {
    setTurnMinutes(event.target.value)
    markChanged()
  }

  function handleTurnSecondsChange(event: ChangeEvent<HTMLInputElement>) {
    setTurnSeconds(event.target.value)
    markChanged()
  }

  return (
    <section className="mt-8" aria-labelledby="timers-title">
      <Collapsible defaultOpen>
        <h2 id="timers-title">
          <CollapsibleTrigger className="group flex w-full items-center justify-between text-xl font-black tracking-[-0.06em] text-game-ink/80 sm:text-2xl">
            Chronomètres
            <ChevronDown aria-hidden="true" className="size-6 transition-transform duration-200 group-data-[panel-open]:rotate-180" />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="collapsible-panel px-1 pb-4">
          <div className="mt-4 grid gap-6">
            <fieldset>
              <legend className="text-base font-black">Pénalité manche perdue</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-bold">
                  Minutes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleRoundLossMinutesChange}
                    type="number"
                    value={roundLossMinutes}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Secondes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    max="59"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleRoundLossSecondsChange}
                    type="number"
                    value={roundLossSeconds}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-base font-black">Temps de manche</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-bold">
                  Minutes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleRoundMinutesChange}
                    type="number"
                    value={roundMinutes}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Secondes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    max="59"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleRoundSecondsChange}
                    type="number"
                    value={roundSeconds}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-base font-black">Temps par tour</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-bold">
                  Minutes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleTurnMinutesChange}
                    type="number"
                    value={turnMinutes}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Secondes
                  <input
                    className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none transition-transform focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                    inputMode="numeric"
                    max="59"
                    min="0"
                    onBlur={handleBlur}
                    onChange={handleTurnSecondsChange}
                    type="number"
                    value={turnSeconds}
                  />
                </label>
              </div>
            </fieldset>
          </div>

          {isSaving && <p className="mt-4 text-sm font-bold text-game-ink/60">Enregistrement...</p>}
          {errorMessage && <p className="mt-4 font-bold text-red-700">{errorMessage}</p>}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

export { TimerSettings }
