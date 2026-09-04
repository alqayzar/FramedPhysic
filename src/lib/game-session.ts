import { type GeneratedActionSegment } from '@/lib/action-template'
import { idbGet, idbSet } from '@/lib/idb-store'
import { type ReactNode } from 'react'
import loupeIcon from '@/assets/atouts/loupe.svg?url'
import innocentIcon from '@/assets/roles/innocent.svg?url'
import saboteurIcon from '@/assets/roles/saboteur.svg?url'

const GAME_PLAYERS_KEY = 'game-players'
const GAME_ACTIVE_PLAYER_KEY = 'game-active-player'
const GAME_ROUND_ENDS_AT_KEY = 'game-round-ends-at'
const GAME_ROUND_NUMBER_KEY = 'game-round-number'
const GAME_TURN_ENDS_AT_KEY = 'game-turn-ends-at'
const GAME_VOTING_KEY = 'game-voting'
const GAME_VOTING_ACTION_IDS_KEY = 'game-voting-action-ids'
const GAME_CORRUPTED_ACTION_ID_KEY = 'game-corrupted-action-id'
const GAME_SABOTEUR_HAS_HAD_TURN_KEY = 'game-saboteur-has-had-turn'
const GAME_WINNER_IDS_KEY = 'game-winner-ids'
const GAME_WINNING_MESSAGE_KEY = 'game-winning-message'
const GAME_ROUND_LOSS_PENALTY_KEY = 'game-round-loss-penalty'
const GAME_VALUES_KEY = 'game-values'

export const ATOUT_IDS = {
  LOUPE: 'loupe',
} as const

export interface GameAtoutContext {
  addControlButton: (label: string, backgroundColor: string | undefined, onClick: () => void) => () => void
  enableAbility: (label: string, enabled: boolean) => void
  gameState: GameAtoutGameState
  getValue: <Value>(key: string, defaultValue: Value) => Value
  onPlayerPressed: (callback: (playerId: string) => void) => () => void
  openDialog: (title?: ReactNode, content?: ReactNode) => void
  playerId: string
  players: GamePlayer[]
  setValue: <Value>(key: string, value: Value) => void
}

export interface GameAtoutGameState {
  roundEndsAt?: number
  roundNumber: number
  turnEndsAt?: number
}

export interface GameAtoutAbility {
  backgroundColor?: string
  label: string
  onClick: (context: GameAtoutContext) => void
}

export interface GameAtout {
  abilities: GameAtoutAbility[]
  id: string
  icon: string
  name: string
  description: string
  onRoundStart?: (context: GameAtoutContext) => void
}

export interface GameRole {
  description: string
  icon: string
  name: string
}

export const GAME_ROLES: GameRole[] = [
  {
    description: 'Trouve les Saboteurs et accomplis les actions avec ton équipe.',
    icon: innocentIcon,
    name: 'Innocent',
  },
  {
    description: 'Corromps tous les Innocents avant qu’ils n’éliminent les Saboteurs.',
    icon: saboteurIcon,
    name: 'Saboteur',
  },
]

export const GAME_ATOUTS: GameAtout[] = [
  {
    abilities: [{
      label: 'Utiliser',
      onClick: (context) => {
        let removeControlButton: () => void = () => undefined
        const stopListeningForPlayer = context.onPlayerPressed((playerId) => {
          const player = context.players.find((currentPlayer) => currentPlayer.id === playerId)
          if (!player) return
          
          stopListeningForPlayer();
          removeControlButton();
          context.enableAbility('Utiliser', false);
          context.openDialog('Analyse', player.corrupted ? `${player.name} est corrompu.` : `${player.name} n’est pas corrompu.`);
        })
        removeControlButton = context.addControlButton('Arrêter l’analyse', 'var(--color-game-red)', () => {
          stopListeningForPlayer()
          removeControlButton()
        })
      },
    }],
    description: 'Utilisable une fois par manche, permet de découvrir si un joueur est corrompu.',
    icon: loupeIcon,
    id: ATOUT_IDS.LOUPE,
    name: 'Loupe',
    onRoundStart: (context) => {
      context.enableAbility('Utiliser', true);
    },
  },
]

export function getGameRole(name: string): GameRole | undefined {
  return GAME_ROLES.find((role) => role.name === name)
}

export function getGameAtout(id: string): GameAtout | undefined {
  return GAME_ATOUTS.find((atout) => atout.id === id)
}

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
  atouts?: GameAtout[]
  role: GameRole
}

export async function getGamePlayers(): Promise<GamePlayer[]> {
  const players = (await idbGet<Array<Omit<GamePlayer, 'atouts'> & { atouts?: Array<GameAtout | string> }>>(GAME_PLAYERS_KEY)) ?? []

  return players.map((player) => {
    const hasLegacyAnalystRole = player.role.name === 'L’Analyste'
    const atoutIds = [
      ...(player.atouts?.map((atout) => typeof atout === 'string' ? atout : atout.id) ?? []),
      ...(hasLegacyAnalystRole ? [ATOUT_IDS.LOUPE] : []),
    ]

    return {
      ...player,
      atouts: atoutIds.map(getGameAtout).filter((atout): atout is GameAtout => Boolean(atout)),
      role: getGameRole(hasLegacyAnalystRole ? GAME_ROLES[0].name : player.role.name) ?? GAME_ROLES[0],
    }
  })
}

export function setGamePlayers(players: GamePlayer[]): Promise<void> {
  return idbSet(GAME_PLAYERS_KEY, players.map((player) => ({
    ...player,
    atouts: player.atouts?.map((atout) => atout.id),
  })))
}

export async function getGameRoundEndsAt(): Promise<number | undefined> {
  return (await idbGet<number | null>(GAME_ROUND_ENDS_AT_KEY)) ?? undefined
}

export function setGameRoundEndsAt(endsAt: number | undefined): Promise<void> {
  return idbSet(GAME_ROUND_ENDS_AT_KEY, endsAt ?? null)
}

export async function getGameRoundNumber(): Promise<number> {
  return (await idbGet<number>(GAME_ROUND_NUMBER_KEY)) ?? 0
}

export function setGameRoundNumber(roundNumber: number): Promise<void> {
  return idbSet(GAME_ROUND_NUMBER_KEY, roundNumber)
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

export async function getGameValues(): Promise<Record<string, unknown>> {
  return (await idbGet<Record<string, unknown>>(GAME_VALUES_KEY)) ?? {}
}

export function setGameValues(values: Record<string, unknown>): Promise<void> {
  return idbSet(GAME_VALUES_KEY, values)
}
