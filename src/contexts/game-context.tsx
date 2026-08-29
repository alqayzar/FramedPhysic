import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getActionElements, setActionElements as persistActionElements, type ActionElement } from '@/lib/action-elements'
import {
  DEFAULT_GAME_SETTINGS,
  getGameSettings,
  setGameSettings as persistGameSettings,
  type GameSettings,
  type TeamCounts,
} from '@/lib/game-settings'
import { getGameActions, setGameActions as persistGameActions, type GameAction } from '@/lib/game-actions'
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
  actions: GameAction[]
  addAction: (action: GameAction) => Promise<void>
  addActionProfile: (title: string) => Promise<void>
  actionsError: string
  deleteAction: (id: string) => Promise<void>
  deleteActionProfile: (id: string) => Promise<void>
  duplicateAction: (action: GameAction) => Promise<void>
  updateAction: (action: GameAction) => Promise<void>
  actionElementsError: string
  addElementProfile: (title: string) => Promise<void>
  deleteActionElement: (id: string) => Promise<void>
  deleteElementProfile: (id: string) => Promise<void>
  duplicateActionElement: (element: ActionElement) => Promise<void>
  elementProfiles: GameProfile[]
  updateActionElement: (element: ActionElement) => Promise<void>
  gameSettings: GameSettings
  saveGameSettings: (settings: GameSettings) => Promise<void>
  saveTeamCounts: (counts: TeamCounts) => Promise<void>
}

interface GameProviderProps {
  children: ReactNode
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
      if (isMounted) setGameSettings(storedSettings)
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

  async function deleteElementProfile(id: string): Promise<void> {
    const nextProfiles = elementProfiles.filter((profile) => profile.id !== id)
    const nextElements = actionElements.filter((element) => element.profileId !== id)
    await persistElementProfiles(nextProfiles)
    await persistActionElements(nextElements)
    setElementProfiles(nextProfiles)
    setActionElements(nextElements)
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
        actions,
        actionsError,
        addAction,
        addActionProfile,
        deleteAction,
        deleteActionProfile,
        duplicateAction,
        updateAction,
        deleteActionElement,
        deleteElementProfile,
        duplicateActionElement,
        addElementProfile,
        elementProfiles,
        gameSettings,
        saveGameSettings,
        saveTeamCounts,
        updateActionElement,
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
