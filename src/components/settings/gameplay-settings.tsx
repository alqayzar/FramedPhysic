import { useEffect, useState, type ChangeEvent } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { type ActionCountRange, type GameSettings } from '@/lib/game-settings'
import { ChevronDown } from 'lucide-react'

interface GameplaySettingsProps {
  onSave: (settings: GameSettings) => Promise<void>
  settings: GameSettings
}

function clamp(value: string): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(Math.max(parsed, 0), 99)
}

function GameplaySettings(props: GameplaySettingsProps) {
  const [minimum, setMinimum] = useState(String(props.settings.actionsPerPlayer.min))
  const [maximum, setMaximum] = useState(String(props.settings.actionsPerPlayer.max))
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (hasChanges) return
    setMinimum(String(props.settings.actionsPerPlayer.min))
    setMaximum(String(props.settings.actionsPerPlayer.max))
  }, [hasChanges, props.settings])

  function markChanged() {
    setHasChanges(true)
  }

  function handleMinimumChange(event: ChangeEvent<HTMLInputElement>) {
    setMinimum(event.target.value)
    markChanged()
  }

  function handleMaximumChange(event: ChangeEvent<HTMLInputElement>) {
    setMaximum(event.target.value)
    markChanged()
  }

  async function handleBlur() {
    if (!hasChanges) return
    const range: ActionCountRange = {
      min: Math.min(clamp(minimum), clamp(maximum)),
      max: Math.max(clamp(minimum), clamp(maximum)),
    }
    setMinimum(String(range.min))
    setMaximum(String(range.max))
    setIsSaving(true)
    try {
      await props.onSave({ ...props.settings, actionsPerPlayer: range })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleShowRoleAfterEliminationChange(event: ChangeEvent<HTMLInputElement>) {
    await props.onSave({ ...props.settings, showRoleAfterElimination: event.target.checked })
  }

  return (
    <section className="mt-8" aria-labelledby="gameplay-title">
      <Collapsible defaultOpen>
        <h2 id="gameplay-title">
          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border-4 border-game-ink bg-game-yellow px-4 py-3 text-xl font-black tracking-[-0.06em] text-game-ink shadow-[0_5px_0_0_#16171d] sm:text-2xl">
            Gameplay
            <ChevronDown aria-hidden="true" className="size-6 transition-transform duration-200 group-data-[panel-open]:rotate-180" />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="collapsible-panel">
          <div className="px-1 pb-4">
            <fieldset className="mt-4">
              <legend className="text-base font-black">Actions par joueur</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-bold">Minimum
                  <input className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-blue/30" inputMode="numeric" min="0" onBlur={handleBlur} onChange={handleMinimumChange} type="number" value={minimum} />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">Maximum
                  <input className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-bold shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-blue/30" inputMode="numeric" min="0" onBlur={handleBlur} onChange={handleMaximumChange} type="number" value={maximum} />
                </label>
              </div>
              {isSaving && <p className="mt-4 text-sm font-bold text-game-ink/60">Enregistrement...</p>}
            </fieldset>
            <label className="mt-6 flex items-center justify-between gap-4 rounded-xl border-3 border-game-ink bg-white p-4 shadow-[0_3px_0_0_#16171d]">
              <span className="min-w-0">
                <span className="block text-base font-black">Afficher le rôle après une élimination</span>
                <span className="mt-1 block text-sm font-bold leading-5 text-game-ink/65">Lorsqu’un joueur est éliminé, son rôle doit-il être révélé ?</span>
              </span>
              <input aria-label="Afficher le rôle après une élimination" checked={props.settings.showRoleAfterElimination} className="size-6 shrink-0 accent-game-purple" onChange={handleShowRoleAfterEliminationChange} type="checkbox" />
            </label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

export { GameplaySettings }
