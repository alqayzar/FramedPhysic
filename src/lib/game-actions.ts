import { idbGet, idbSet } from '@/lib/idb-store'

const GAME_ACTIONS_KEY = 'game-actions'

export interface GameAction {
  id: string
  profileId: string
  template: string
  title?: string
}

export function createGameAction(template: string, title: string, profileId: string): GameAction {
  return {
    id: crypto.randomUUID(),
    profileId,
    template: template.trim(),
    title: title.trim() || undefined,
  }
}

export async function getGameActions(): Promise<GameAction[]> {
  return (await idbGet<GameAction[]>(GAME_ACTIONS_KEY)) ?? []
}

export async function setGameActions(actions: GameAction[]): Promise<void> {
  await idbSet(GAME_ACTIONS_KEY, actions)
}
