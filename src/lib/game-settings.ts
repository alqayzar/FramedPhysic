import { idbGet, idbSet } from '@/lib/idb-store'

const GAME_SETTINGS_KEY = 'game-settings'

export interface TimeoutSettings {
  minutes: number
  seconds: number
}

export interface TeamCounts {
  innocents: number
  saboteurs: number
}

export interface ActionCountRange {
  min: number
  max: number
}

export interface GameSettings {
  roundLossTimeout: TimeoutSettings
  roundTimeout: TimeoutSettings
  turnTimeout: TimeoutSettings
  teamCounts: TeamCounts
  actionsPerPlayer: ActionCountRange
  enabledRoleNames: string[]
  showRoleAfterElimination: boolean
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  roundLossTimeout: { minutes: 0, seconds: 0 },
  roundTimeout: { minutes: 5, seconds: 0 },
  turnTimeout: { minutes: 1, seconds: 0 },
  teamCounts: { innocents: 2, saboteurs: 1 },
  actionsPerPlayer: { min: 1, max: 3 },
  enabledRoleNames: ['Innocent', 'Saboteur'],
  showRoleAfterElimination: true,
}

export async function getGameSettings(): Promise<GameSettings> {
  const settings = await idbGet<Partial<GameSettings>>(GAME_SETTINGS_KEY)

  return {
    roundLossTimeout: { ...DEFAULT_GAME_SETTINGS.roundLossTimeout, ...settings?.roundLossTimeout },
    roundTimeout: { ...DEFAULT_GAME_SETTINGS.roundTimeout, ...settings?.roundTimeout },
    turnTimeout: { ...DEFAULT_GAME_SETTINGS.turnTimeout, ...settings?.turnTimeout },
    teamCounts: { ...DEFAULT_GAME_SETTINGS.teamCounts, ...settings?.teamCounts },
    actionsPerPlayer: { ...DEFAULT_GAME_SETTINGS.actionsPerPlayer, ...settings?.actionsPerPlayer },
    enabledRoleNames: settings?.enabledRoleNames ?? DEFAULT_GAME_SETTINGS.enabledRoleNames,
    showRoleAfterElimination: settings?.showRoleAfterElimination ?? DEFAULT_GAME_SETTINGS.showRoleAfterElimination,
  }
}

export async function setGameSettings(settings: GameSettings): Promise<void> {
  await idbSet(GAME_SETTINGS_KEY, settings)
}
