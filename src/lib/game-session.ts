import { type GeneratedActionSegment } from '@/lib/action-template'
import { idbGet, idbSet } from '@/lib/idb-store'

const GAME_PLAYERS_KEY = 'game-players'
const GAME_ACTIVE_PLAYER_KEY = 'game-active-player'
const GAME_ROUND_ENDS_AT_KEY = 'game-round-ends-at'
const GAME_TURN_ENDS_AT_KEY = 'game-turn-ends-at'
const GAME_VOTING_KEY = 'game-voting'
const GAME_VOTING_ACTION_IDS_KEY = 'game-voting-action-ids'
const GAME_CORRUPTED_ACTION_ID_KEY = 'game-corrupted-action-id'
const GAME_SABOTEUR_HAS_HAD_TURN_KEY = 'game-saboteur-has-had-turn'
const GAME_WINNER_IDS_KEY = 'game-winner-ids'
const GAME_WINNING_MESSAGE_KEY = 'game-winning-message'
const GAME_ROUND_LOSS_PENALTY_KEY = 'game-round-loss-penalty'

export const GAME_ROLES = [
  {
    description: 'Trouve les Saboteurs et accomplis les actions avec ton équipe.',
    name: 'Innocent',
  },
  {
    description: 'Reste discret et empêche les Innocents de gagner.',
    name: 'Saboteur',
  },
] as const

export type GameRole = (typeof GAME_ROLES)[number]

export interface GamePlayerAction {
  actionId: string
  id: string
  segments: GeneratedActionSegment[]
  title?: string
}

export interface GamePlayer {
  actions?: GamePlayerAction[]
  corrupted?: boolean
  eliminated?: boolean
  id: string
  image?: Blob
  name: string
  role: GameRole
}

export async function getGamePlayers(): Promise<GamePlayer[]> {
  return (await idbGet<GamePlayer[]>(GAME_PLAYERS_KEY)) ?? []
}

export function setGamePlayers(players: GamePlayer[]): Promise<void> {
  return idbSet(GAME_PLAYERS_KEY, players)
}

export async function getGameRoundEndsAt(): Promise<number | undefined> {
  return (await idbGet<number | null>(GAME_ROUND_ENDS_AT_KEY)) ?? undefined
}

export function setGameRoundEndsAt(endsAt: number | undefined): Promise<void> {
  return idbSet(GAME_ROUND_ENDS_AT_KEY, endsAt ?? null)
}

export async function getGameActivePlayerId(): Promise<string | undefined> {
  return (await idbGet<string | null>(GAME_ACTIVE_PLAYER_KEY)) ?? undefined
}

export function setGameActivePlayerId(playerId: string | undefined): Promise<void> {
  return idbSet(GAME_ACTIVE_PLAYER_KEY, playerId ?? null)
}

export async function getGameTurnEndsAt(): Promise<number | undefined> {
  return (await idbGet<number | null>(GAME_TURN_ENDS_AT_KEY)) ?? undefined
}

export function setGameTurnEndsAt(endsAt: number | undefined): Promise<void> {
  return idbSet(GAME_TURN_ENDS_AT_KEY, endsAt ?? null)
}

export async function getGameVoting(): Promise<boolean> {
  return (await idbGet<boolean>(GAME_VOTING_KEY)) ?? false
}

export function setGameVoting(isVoting: boolean): Promise<void> {
  return idbSet(GAME_VOTING_KEY, isVoting)
}

export async function getGameVotingActionIds(): Promise<string[]> {
  return (await idbGet<string[]>(GAME_VOTING_ACTION_IDS_KEY)) ?? []
}

export function setGameVotingActionIds(actionIds: string[]): Promise<void> {
  return idbSet(GAME_VOTING_ACTION_IDS_KEY, actionIds)
}

export async function getGameCorruptedActionId(): Promise<string | undefined> {
  return (await idbGet<string | null>(GAME_CORRUPTED_ACTION_ID_KEY)) ?? undefined
}

export function setGameCorruptedActionId(actionId: string | undefined): Promise<void> {
  return idbSet(GAME_CORRUPTED_ACTION_ID_KEY, actionId ?? null)
}

export async function getGameSaboteurHasHadTurn(): Promise<boolean> {
  return (await idbGet<boolean>(GAME_SABOTEUR_HAS_HAD_TURN_KEY)) ?? false
}

export function setGameSaboteurHasHadTurn(hasHadTurn: boolean): Promise<void> {
  return idbSet(GAME_SABOTEUR_HAS_HAD_TURN_KEY, hasHadTurn)
}

export async function getGameWinnerIds(): Promise<string[]> {
  return (await idbGet<string[]>(GAME_WINNER_IDS_KEY)) ?? []
}

export function setGameWinnerIds(playerIds: string[]): Promise<void> {
  return idbSet(GAME_WINNER_IDS_KEY, playerIds)
}

export async function getGameWinningMessage(): Promise<string> {
  return (await idbGet<string>(GAME_WINNING_MESSAGE_KEY)) ?? ''
}

export function setGameWinningMessage(message: string): Promise<void> {
  return idbSet(GAME_WINNING_MESSAGE_KEY, message)
}

export async function getGameRoundLossPenalty(): Promise<number> {
  return (await idbGet<number>(GAME_ROUND_LOSS_PENALTY_KEY)) ?? 0
}

export function setGameRoundLossPenalty(penalty: number): Promise<void> {
  return idbSet(GAME_ROUND_LOSS_PENALTY_KEY, penalty)
}
