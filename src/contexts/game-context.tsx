import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getActionElements, setActionElements as persistActionElements, type ActionElement } from '@/lib/action-elements'
import {
  DEFAULT_GAME_SETTINGS,
  getGameSettings,
  setGameSettings as persistGameSettings,
  type GameSettings,
  type TeamCounts,
} from '@/lib/game-settings'
import { getGameActions, setGameActions as persistGameActions, type GameAction } from '@/lib/game-actions'
import { GAME_ROLES, getGameActivePlayerId, getGameCorruptedActionId, getGamePlayers, getGameRoundEndsAt, getGameRoundLossPenalty, getGameRoundNumber, getGameSaboteurHasHadTurn, getGameTurnEndsAt, getGameValues, getGameVoting, getGameVotingActionIds, getGameWinnerIds, getGameWinningMessage, setGameActivePlayerId as persistGameActivePlayerId, setGameCorruptedActionId as persistGameCorruptedActionId, setGamePlayers as persistGamePlayers, setGameRoundEndsAt as persistGameRoundEndsAt, setGameRoundLossPenalty as persistGameRoundLossPenalty, setGameRoundNumber as persistGameRoundNumber, setGameSaboteurHasHadTurn as persistGameSaboteurHasHadTurn, setGameTurnEndsAt as persistGameTurnEndsAt, setGameValues as persistGameValues, setGameVoting as persistGameVoting, setGameVotingActionIds as persistGameVotingActionIds, setGameWinnerIds as persistGameWinnerIds, setGameWinningMessage as persistGameWinningMessage, type GamePlayer, type GamePlayerAction, type GameRole } from '@/lib/game-session'
import { generateActionPreview, getGeneratedActionEqualityKey } from '@/lib/action-template'
import { createActionProfileExport, createElementProfileExport, dataUrlToBlob, downloadProfileExport, parseProfileExport } from '@/lib/profile-transfer'
import {
  createGameProfile,
  getActionProfiles,
  getElementProfiles,
  setActionProfiles as persistActionProfiles,
  setElementProfiles as persistElementProfiles,
  type GameProfile,
} from '@/lib/game-profiles'

interface GameContextValue {
  actionElements: ActionElement[]
  actionProfiles: GameProfile[]
  addActionElement: (element: ActionElement) => Promise<void>
  addGamePlayer: (player: GamePlayer) => void
  actions: GameAction[]
  addAction: (action: GameAction) => Promise<void>
  addActionProfile: (title: string) => Promise<void>
  clearActionProfile: (id: string) => Promise<void>
  actionsError: string
  deleteAction: (id: string) => Promise<void>
  deleteActionProfile: (id: string) => Promise<void>
  exportActionProfile: (id: string, title: string) => Promise<void>
  importActionProfile: (id: string, file: File) => Promise<void>
  duplicateAction: (action: GameAction) => Promise<void>
  updateAction: (action: GameAction) => Promise<void>
  actionElementsError: string
  addElementProfile: (title: string) => Promise<void>
  clearElementProfile: (id: string) => Promise<void>
  deleteActionElement: (id: string) => Promise<void>
  deleteElementProfile: (id: string) => Promise<void>
  exportElementProfile: (id: string, title: string) => Promise<void>
  importElementProfile: (id: string, file: File) => Promise<void>
  duplicateActionElement: (element: ActionElement) => Promise<void>
  eliminateGamePlayer: (playerId: string) => void
  elementProfiles: GameProfile[]
  updateActionElement: (element: ActionElement) => Promise<void>
  updateActionProfile: (id: string, title: string) => Promise<void>
  updateElementProfile: (id: string, title: string) => Promise<void>
  gameSettings: GameSettings
  gamePlayers: GamePlayer[]
  getValue: <Value>(key: string, defaultValue: Value) => Value
  activePlayerId?: string
  canCorruptGameAction: boolean
  corruptedActionId?: string
  corruptGameAction: (actionId: string, isSelected: boolean) => void
  roundEndsAt?: number
  roundNumber: number
  selectActivePlayer: (playerId: string, turnDuration: number) => void
  startGameRound: (roundDuration: number, turnDuration: number, roundLossDuration: number) => void
  turnEndsAt?: number
  winnerIds: string[]
  winningMessage: string
  isGamePlayersLoaded: boolean
  isGameRoundLoaded: boolean
  isVoting: boolean
  selectedVotingActionIds: string[]
  setVotingActionSelected: (actionId: string, isSelected: boolean) => void
  clearGamePlayers: () => Promise<void>
  endGameRound: () => Promise<void>
  finishGameRound: () => Promise<void>
  replaceGamePlayers: (players: GamePlayer[]) => void
  reassignGameRoles: () => void
  isGameSettingsLoaded: boolean
  saveGameSettings: (settings: GameSettings) => Promise<void>
  saveTeamCounts: (counts: TeamCounts) => Promise<void>
  setValue: <Value>(key: string, value: Value) => void
}

interface GameProviderProps {
  children: ReactNode
}

function getProfileFilename(title: string): string {
  return title.trim().replace(/[\\/:*?"<>|]/g, '-') || 'profil'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const GameContext = createContext<GameContextValue | null>(null)

function GameProvider(props: GameProviderProps) {
  const [actionElements, setActionElements] = useState<ActionElement[]>([])
  const [actionElementsError, setActionElementsError] = useState('')
  const [actions, setActions] = useState<GameAction[]>([])
  const [actionProfiles, setActionProfiles] = useState<GameProfile[]>([])
  const [elementProfiles, setElementProfiles] = useState<GameProfile[]>([])
  const [actionsError, setActionsError] = useState('')
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS)
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([])
  const [activePlayerId, setActivePlayerId] = useState<string>()
  const [isGamePlayersLoaded, setIsGamePlayersLoaded] = useState(false)
  const [roundEndsAt, setRoundEndsAt] = useState<number>()
  const [roundNumber, setRoundNumber] = useState(0)
  const [turnEndsAt, setTurnEndsAt] = useState<number>()
  const [isVoting, setIsVoting] = useState(false)
  const [selectedVotingActionIds, setSelectedVotingActionIds] = useState<string[]>([])
  const [corruptedActionId, setCorruptedActionId] = useState<string>()
  const [hasSaboteurHadTurn, setHasSaboteurHadTurn] = useState(false)
  const [winnerIds, setWinnerIds] = useState<string[]>([])
  const [winningMessage, setWinningMessage] = useState('')
  const [roundLossPenalty, setRoundLossPenalty] = useState(0)
  const gameValues = useRef<Record<string, unknown>>({})
  const [isGameRoundLoaded, setIsGameRoundLoaded] = useState(false)
  const [isGameSettingsLoaded, setIsGameSettingsLoaded] = useState(false)
  const activePlayer = gamePlayers.find((player) => player.id === activePlayerId)
  const canCorruptGameAction = Boolean(roundEndsAt && activePlayer?.role.name === GAME_ROLES[1].name && !hasSaboteurHadTurn)

  function getValue<Value>(key: string, defaultValue: Value): Value {
    return Object.prototype.hasOwnProperty.call(gameValues.current, key) ? gameValues.current[key] as Value : defaultValue
  }

  function setValue<Value>(key: string, value: Value) {
    gameValues.current = { ...gameValues.current, [key]: value }
    void persistGameValues(gameValues.current)
  }

  useEffect(() => {
    let isMounted = true

    void getActionElements()
      .then((storedElements) => {
        if (isMounted) setActionElements(storedElements)
      })
      .catch(() => {
        if (isMounted) setActionElementsError('Impossible de charger les éléments enregistrés.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void Promise.all([getGameRoundEndsAt(), getGameTurnEndsAt(), getGameActivePlayerId(), getGameVoting(), getGameVotingActionIds(), getGameCorruptedActionId(), getGameSaboteurHasHadTurn(), getGameWinnerIds(), getGameWinningMessage(), getGameRoundLossPenalty(), getGameValues(), getGameRoundNumber()]).then(([storedRoundEndsAt, storedTurnEndsAt, storedActivePlayerId, storedIsVoting, storedVotingActionIds, storedCorruptedActionId, storedSaboteurHasHadTurn, storedWinnerIds, storedWinningMessage, storedRoundLossPenalty, storedGameValues, storedRoundNumber]) => {
      if (isMounted) {
        setRoundEndsAt(storedRoundEndsAt)
        setRoundNumber(storedRoundNumber || (storedRoundEndsAt || storedIsVoting ? 1 : 0))
        setTurnEndsAt(storedTurnEndsAt)
        setActivePlayerId(storedActivePlayerId)
        setIsVoting(storedIsVoting)
        setSelectedVotingActionIds(storedVotingActionIds)
        setCorruptedActionId(storedCorruptedActionId)
        setHasSaboteurHadTurn(storedSaboteurHasHadTurn)
        setWinnerIds(storedWinnerIds)
        setWinningMessage(storedWinningMessage)
        setRoundLossPenalty(storedRoundLossPenalty)
        gameValues.current = storedGameValues
        setIsGameRoundLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getGamePlayers().then((players) => {
      if (isMounted) {
        setGamePlayers(players)
        setIsGamePlayersLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getActionProfiles().then((profiles) => {
      if (isMounted) setActionProfiles(profiles)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getElementProfiles().then((profiles) => {
      if (isMounted) setElementProfiles(profiles)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getGameActions()
      .then((storedActions) => {
        if (isMounted) setActions(storedActions)
      })
      .catch(() => {
        if (isMounted) setActionsError('Impossible de charger les actions enregistrées.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getGameSettings().then((storedSettings) => {
      if (isMounted) {
        setGameSettings(storedSettings)
        setIsGameSettingsLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  async function addActionElement(element: ActionElement): Promise<void> {
    const nextElements = [...actionElements, element]
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  function addGamePlayer(player: GamePlayer) {
    const nextPlayers = [...gamePlayers, player]
    setGamePlayers(nextPlayers)
    void persistGamePlayers(nextPlayers)
  }

  function generateGameActions(players: GamePlayer[]): GamePlayer[] {
    const minimum = Math.min(gameSettings.actionsPerPlayer.min, gameSettings.actionsPerPlayer.max)
    const maximum = Math.max(gameSettings.actionsPerPlayer.min, gameSettings.actionsPerPlayer.max)
    const assignedActionKeys = new Set<string>()

    return players.map((player) => {
      const count = minimum + Math.floor(Math.random() * (maximum - minimum + 1))
      const playerActions: GamePlayerAction[] = []

      for (let index = 0; index < count; index += 1) {
        let generatedAction: GamePlayerAction | undefined

        for (let attempt = 0; attempt < Math.max(actions.length * 10, 50); attempt += 1) {
          const action = actions[Math.floor(Math.random() * actions.length)]
          if (!action) break

          const segments = generateActionPreview(action.template, actionElements)
          const equalityKey = getGeneratedActionEqualityKey(segments)
          if (assignedActionKeys.has(equalityKey)) continue

          assignedActionKeys.add(equalityKey)
          generatedAction = {
            actionId: action.id,
            id: crypto.randomUUID(),
            segments,
            title: action.title,
          }
          break
        }

        if (!generatedAction) break
        playerActions.push(generatedAction)
      }

      return { ...player, actions: playerActions }
    })
  }

  function eliminateGamePlayer(playerId: string) {
    const nextPlayers = gamePlayers.map((player) => (
      player.id === playerId ? { ...player, eliminated: true } : player
    ))
    const saboteurs = nextPlayers.filter((player) => player.role.name === GAME_ROLES[1].name)

    if (saboteurs.length > 0 && saboteurs.every((player) => player.eliminated)) {
      const innocentWinnerIds = nextPlayers.filter((player) => player.role.name !== GAME_ROLES[1].name).map((player) => player.id)
      setGamePlayers(nextPlayers)
      setActivePlayerId(undefined)
      setRoundEndsAt(undefined)
      setTurnEndsAt(undefined)
      setIsVoting(false)
      setSelectedVotingActionIds([])
      setCorruptedActionId(undefined)
      setHasSaboteurHadTurn(false)
      setWinnerIds(innocentWinnerIds)
      setWinningMessage('Les innocents ont gagnés !')
      setRoundLossPenalty(0)
      void Promise.all([
        persistGamePlayers(nextPlayers),
        persistGameActivePlayerId(undefined),
        persistGameRoundEndsAt(undefined),
        persistGameTurnEndsAt(undefined),
        persistGameVoting(false),
        persistGameVotingActionIds([]),
        persistGameCorruptedActionId(undefined),
        persistGameSaboteurHasHadTurn(false),
        persistGameWinnerIds(innocentWinnerIds),
        persistGameWinningMessage('Les innocents ont gagnés !'),
        persistGameRoundLossPenalty(0),
      ])
      return
    }

    replaceGamePlayers(nextPlayers)
  }

  async function clearGamePlayers(): Promise<void> {
    setGamePlayers([])
    setActivePlayerId(undefined)
    setRoundEndsAt(undefined)
    setRoundNumber(0)
    setTurnEndsAt(undefined)
    setIsVoting(false)
    setSelectedVotingActionIds([])
    setCorruptedActionId(undefined)
    setHasSaboteurHadTurn(false)
    setWinnerIds([])
    setWinningMessage('')
    setRoundLossPenalty(0)
    gameValues.current = {}
    await Promise.all([
      persistGamePlayers([]),
      persistGameActivePlayerId(undefined),
      persistGameRoundEndsAt(undefined),
      persistGameRoundNumber(0),
      persistGameTurnEndsAt(undefined),
      persistGameVoting(false),
      persistGameVotingActionIds([]),
      persistGameCorruptedActionId(undefined),
      persistGameSaboteurHasHadTurn(false),
      persistGameWinnerIds([]),
      persistGameWinningMessage(''),
      persistGameRoundLossPenalty(0),
      persistGameValues({}),
    ])
  }

  async function endGameRound(): Promise<void> {
    const nextPlayers = gamePlayers.map((player) => ({ ...player, actions: undefined, corrupted: false, eliminated: false }))
    setGamePlayers(nextPlayers)
    setActivePlayerId(undefined)
    setRoundEndsAt(undefined)
    setRoundNumber(0)
    setTurnEndsAt(undefined)
    setIsVoting(false)
    setSelectedVotingActionIds([])
    setCorruptedActionId(undefined)
    setHasSaboteurHadTurn(false)
    setWinnerIds([])
    setWinningMessage('')
    setRoundLossPenalty(0)
    gameValues.current = {}
    await Promise.all([
      persistGamePlayers(nextPlayers),
      persistGameActivePlayerId(undefined),
      persistGameRoundEndsAt(undefined),
      persistGameRoundNumber(0),
      persistGameTurnEndsAt(undefined),
      persistGameVoting(false),
      persistGameVotingActionIds([]),
      persistGameCorruptedActionId(undefined),
      persistGameSaboteurHasHadTurn(false),
      persistGameWinnerIds([]),
      persistGameWinningMessage(''),
      persistGameRoundLossPenalty(0),
      persistGameValues({}),
    ])
  }

  async function finishGameRound(): Promise<void> {
    setActivePlayerId(undefined)
    setRoundEndsAt(undefined)
    setTurnEndsAt(undefined)
    setIsVoting(true)
    setSelectedVotingActionIds([])
    await Promise.all([
      persistGameActivePlayerId(undefined),
      persistGameRoundEndsAt(undefined),
      persistGameTurnEndsAt(undefined),
      persistGameVoting(true),
      persistGameVotingActionIds([]),
    ])
  }

  function startGameRound(roundDuration: number, turnDuration: number, roundLossDuration: number) {
    const now = Date.now()
    const totalActionCount = gamePlayers.filter((player) => !player.eliminated).reduce((total, player) => total + (player.actions?.length ?? 0), 0)
    const isRoundWon = isVoting && selectedVotingActionIds.length >= Math.ceil(totalActionCount / 2)
    const hasLostRound = isVoting && !isRoundWon
    const nextRoundLossPenalty = hasLostRound ? roundLossPenalty + roundLossDuration : 0
    const roundEndsAt = now + (Math.max(0, roundDuration - nextRoundLossPenalty) * 1000)
    const turnEndsAt = now + (turnDuration * 1000)
    const playersWithCorruption = isRoundWon && corruptedActionId && selectedVotingActionIds.includes(corruptedActionId)
      ? gamePlayers.map((player) => player.role.name !== GAME_ROLES[1].name && player.actions?.some((action) => action.id === corruptedActionId) ? { ...player, corrupted: true } : player)
      : gamePlayers
    const remainingInnocentPlayers = playersWithCorruption.filter((player) => player.role.name !== GAME_ROLES[1].name && !player.eliminated)
    const nextWinnerIds = remainingInnocentPlayers.every((player) => player.corrupted)
      ? playersWithCorruption.filter((player) => player.role.name === GAME_ROLES[1].name).map((player) => player.id)
      : []

    if (nextWinnerIds.length > 0) {
      setGamePlayers(playersWithCorruption)
      setActivePlayerId(undefined)
      setRoundEndsAt(undefined)
      setTurnEndsAt(undefined)
      setIsVoting(false)
      setSelectedVotingActionIds([])
      setCorruptedActionId(undefined)
      setHasSaboteurHadTurn(false)
      setWinnerIds(nextWinnerIds)
      setWinningMessage('Les saboteurs ont gagnés !')
      setRoundLossPenalty(0)
      void Promise.all([
        persistGamePlayers(playersWithCorruption),
        persistGameActivePlayerId(undefined),
        persistGameRoundEndsAt(undefined),
        persistGameTurnEndsAt(undefined),
        persistGameVoting(false),
        persistGameVotingActionIds([]),
        persistGameCorruptedActionId(undefined),
        persistGameSaboteurHasHadTurn(false),
        persistGameWinnerIds(nextWinnerIds),
        persistGameWinningMessage('Les saboteurs ont gagnés !'),
        persistGameRoundLossPenalty(0),
      ])
      return
    }

    const nextRoundNumber = roundNumber + 1
    const nextPlayers = generateGameActions(playersWithCorruption)
    const eligiblePlayers = nextPlayers.filter((player) => !player.eliminated)
    const playerId = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)]?.id
    setGamePlayers(nextPlayers)
    setActivePlayerId(playerId)
    setRoundEndsAt(roundEndsAt)
    setRoundNumber(nextRoundNumber)
    setTurnEndsAt(turnEndsAt)
    setIsVoting(false)
    setSelectedVotingActionIds([])
    setCorruptedActionId(undefined)
    setHasSaboteurHadTurn(false)
    setWinnerIds([])
    setWinningMessage('')
    setRoundLossPenalty(nextRoundLossPenalty)
    void persistGamePlayers(nextPlayers)
    void persistGameActivePlayerId(playerId)
    void persistGameRoundEndsAt(roundEndsAt)
    void persistGameRoundNumber(nextRoundNumber)
    void persistGameTurnEndsAt(turnEndsAt)
    void persistGameVoting(false)
    void persistGameVotingActionIds([])
    void persistGameCorruptedActionId(undefined)
    void persistGameSaboteurHasHadTurn(false)
    void persistGameWinnerIds([])
    void persistGameWinningMessage('')
    void persistGameRoundLossPenalty(nextRoundLossPenalty)
  }

  function selectActivePlayer(playerId: string, turnDuration: number) {
    if (!gamePlayers.some((player) => player.id === playerId && !player.eliminated)) return

    if (activePlayer?.role.name === GAME_ROLES[1].name && !hasSaboteurHadTurn) {
      setHasSaboteurHadTurn(true)
      void persistGameSaboteurHasHadTurn(true)
    }

    const turnEndsAt = Date.now() + (turnDuration * 1000)
    setActivePlayerId(playerId)
    setTurnEndsAt(turnEndsAt)
    void persistGameActivePlayerId(playerId)
    void persistGameTurnEndsAt(turnEndsAt)
  }

  function setVotingActionSelected(actionId: string, isSelected: boolean) {
    const nextActionIds = isSelected
      ? [...new Set([...selectedVotingActionIds, actionId])]
      : selectedVotingActionIds.filter((id) => id !== actionId)
    setSelectedVotingActionIds(nextActionIds)
    void persistGameVotingActionIds(nextActionIds)
  }

  function corruptGameAction(actionId: string, isSelected: boolean) {
    if (!canCorruptGameAction || !gamePlayers.some((player) => player.actions?.some((action) => action.id === actionId))) return

    const nextCorruptedActionId = isSelected ? actionId : undefined
    setCorruptedActionId(nextCorruptedActionId)
    void persistGameCorruptedActionId(nextCorruptedActionId)
  }

  function replaceGamePlayers(players: GamePlayer[]) {
    setGamePlayers(players)
    void persistGamePlayers(players)
  }

  function reassignGameRoles() {
    const innocentTeamCount = gamePlayers.filter((player) => player.role.name === GAME_ROLES[0].name).length
    const saboteurCount = gamePlayers.length - innocentTeamCount
    const roles: GameRole[] = [
      ...Array<GameRole>(innocentTeamCount).fill(GAME_ROLES[0]),
      ...Array<GameRole>(saboteurCount).fill(GAME_ROLES[1]),
    ]

    for (let index = roles.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[roles[index], roles[swapIndex]] = [roles[swapIndex], roles[index]]
    }

    replaceGamePlayers(gamePlayers.map((player, index) => ({ ...player, actions: undefined, role: roles[index] })))
  }

  async function addAction(action: GameAction): Promise<void> {
    const nextActions = [...actions, action]
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function addActionProfile(title: string): Promise<void> {
    const nextProfiles = [...actionProfiles, createGameProfile(title)]
    await persistActionProfiles(nextProfiles)
    setActionProfiles(nextProfiles)
  }

  async function addElementProfile(title: string): Promise<void> {
    const nextProfiles = [...elementProfiles, createGameProfile(title)]
    await persistElementProfiles(nextProfiles)
    setElementProfiles(nextProfiles)
  }

  async function deleteActionProfile(id: string): Promise<void> {
    const nextProfiles = actionProfiles.filter((profile) => profile.id !== id)
    const nextActions = actions.filter((action) => action.profileId !== id)
    await persistActionProfiles(nextProfiles)
    await persistGameActions(nextActions)
    setActionProfiles(nextProfiles)
    setActions(nextActions)
  }

  async function clearActionProfile(id: string): Promise<void> {
    const nextActions = actions.filter((action) => action.profileId !== id)
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function exportActionProfile(id: string, title: string): Promise<void> {
    await downloadProfileExport(`${getProfileFilename(title)}.actions.json`, createActionProfileExport(actions.filter((action) => action.profileId === id)))
  }

  async function importActionProfile(id: string, file: File): Promise<void> {
    const content = await parseProfileExport(file)
    if (!isRecord(content) || content.kind !== 'actions' || !Array.isArray(content.actions)) {
      throw new Error('Ce fichier ne contient pas un profil d’actions valide.')
    }

    const importedActions = content.actions.flatMap((action) => {
      if (!isRecord(action) || typeof action.template !== 'string') return []
      return [{
        id: crypto.randomUUID(),
        profileId: id,
        template: action.template,
        title: typeof action.title === 'string' ? action.title : undefined,
      }]
    })
    const nextActions = [...actions, ...importedActions]
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function deleteElementProfile(id: string): Promise<void> {
    const nextProfiles = elementProfiles.filter((profile) => profile.id !== id)
    const nextElements = actionElements.filter((element) => element.profileId !== id)
    await persistElementProfiles(nextProfiles)
    await persistActionElements(nextElements)
    setElementProfiles(nextProfiles)
    setActionElements(nextElements)
  }

  async function clearElementProfile(id: string): Promise<void> {
    const nextElements = actionElements.filter((element) => element.profileId !== id)
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  async function exportElementProfile(id: string, title: string): Promise<void> {
    const content = await createElementProfileExport(actionElements.filter((element) => element.profileId === id))
    await downloadProfileExport(`${getProfileFilename(title)}.elements.json`, content)
  }

  async function importElementProfile(id: string, file: File): Promise<void> {
    const content = await parseProfileExport(file)
    if (!isRecord(content) || content.kind !== 'elements' || !Array.isArray(content.elements)) {
      throw new Error('Ce fichier ne contient pas un profil d’éléments valide.')
    }

    const importedElements = await Promise.all(content.elements.flatMap((element) => {
      if (!isRecord(element) || typeof element.title !== 'string' || !Array.isArray(element.tags) || !element.tags.every((tag) => typeof tag === 'string')) return []
      return [element]
    }).map(async (element) => ({
      emoji: typeof element.emoji === 'string' ? element.emoji : undefined,
      id: crypto.randomUUID(),
      image: typeof element.image === 'string' ? await dataUrlToBlob(element.image) : undefined,
      imageUrl: typeof element.imageUrl === 'string' ? element.imageUrl : undefined,
      profileId: id,
      tags: element.tags as string[],
      title: element.title as string,
    })))
    const nextElements = [...actionElements, ...importedElements]
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  async function updateActionProfile(id: string, title: string): Promise<void> {
    const nextProfiles = actionProfiles.map((profile) => (
      profile.id === id ? { ...profile, title: title.trim() } : profile
    ))
    await persistActionProfiles(nextProfiles)
    setActionProfiles(nextProfiles)
  }

  async function updateElementProfile(id: string, title: string): Promise<void> {
    const nextProfiles = elementProfiles.map((profile) => (
      profile.id === id ? { ...profile, title: title.trim() } : profile
    ))
    await persistElementProfiles(nextProfiles)
    setElementProfiles(nextProfiles)
  }

  async function updateAction(action: GameAction): Promise<void> {
    const nextActions = actions.map((currentAction) =>
      currentAction.id === action.id ? action : currentAction,
    )
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function deleteAction(id: string): Promise<void> {
    const nextActions = actions.filter((action) => action.id !== id)
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function duplicateAction(action: GameAction): Promise<void> {
    const nextActions = [...actions, { ...action, id: crypto.randomUUID() }]
    await persistGameActions(nextActions)
    setActions(nextActions)
  }

  async function updateActionElement(element: ActionElement): Promise<void> {
    const nextElements = actionElements.map((currentElement) =>
      currentElement.id === element.id ? element : currentElement,
    )
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  async function deleteActionElement(id: string): Promise<void> {
    const nextElements = actionElements.filter((element) => element.id !== id)
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  async function duplicateActionElement(element: ActionElement): Promise<void> {
    const baseTitle = element.title.replace(/ \(\d+\)$/, '')
    const existingTitles = new Set(actionElements.map((currentElement) => currentElement.title))
    let copyNumber = 1
    let copyTitle = `${baseTitle} (${copyNumber})`

    while (existingTitles.has(copyTitle)) {
      copyNumber += 1
      copyTitle = `${baseTitle} (${copyNumber})`
    }

    const copy = { ...element, id: crypto.randomUUID(), title: copyTitle }
    const nextElements = [...actionElements, copy]
    await persistActionElements(nextElements)
    setActionElements(nextElements)
  }

  async function saveGameSettings(settings: GameSettings): Promise<void> {
    await persistGameSettings(settings)
    setGameSettings(settings)
  }

  async function saveTeamCounts(counts: TeamCounts): Promise<void> {
    await saveGameSettings({ ...gameSettings, teamCounts: counts })
  }

  return (
    <GameContext.Provider
      value={{
        actionElements,
        actionProfiles,
        actionElementsError,
        addActionElement,
        addGamePlayer,
        actions,
        actionsError,
        addAction,
        addActionProfile,
        clearActionProfile,
        deleteAction,
        deleteActionProfile,
        exportActionProfile,
        importActionProfile,
        duplicateAction,
        updateAction,
        deleteActionElement,
        deleteElementProfile,
        exportElementProfile,
        importElementProfile,
        clearElementProfile,
        duplicateActionElement,
        eliminateGamePlayer,
        addElementProfile,
        elementProfiles,
        gameSettings,
        gamePlayers,
        getValue,
        activePlayerId,
        canCorruptGameAction,
        corruptedActionId,
        corruptGameAction,
        roundEndsAt,
        roundNumber,
        turnEndsAt,
        winnerIds,
        winningMessage,
        selectActivePlayer,
        startGameRound,
        isGamePlayersLoaded,
        isGameRoundLoaded,
        isVoting,
        selectedVotingActionIds,
        setVotingActionSelected,
        clearGamePlayers,
        endGameRound,
        finishGameRound,
        replaceGamePlayers,
        reassignGameRoles,
        isGameSettingsLoaded,
        saveGameSettings,
        saveTeamCounts,
        setValue,
        updateActionElement,
        updateActionProfile,
        updateElementProfile,
      }}
    >
      {props.children}
    </GameContext.Provider>
  )
}

function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider.')
  return context
}

export { GameProvider, useGame }
