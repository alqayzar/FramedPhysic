import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { ActionsDialog } from '@/components/actions/actions-dialog'
import { ElementsDialog } from '@/components/elements/elements-dialog'
import { MainMenu } from '@/components/menu/main-menu'
import { GamePage } from '@/components/game/game-page'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { GameProvider, useGame } from '@/contexts/game-context'
import { createEmojiImage } from '@/lib/emoji-image'
import { GAME_ATOUTS, GAME_ROLES, type GamePlayer } from '@/lib/game-session'

interface GameRouteProps {
  onOpenSettings: () => void
}

function GameRoute(props: GameRouteProps) {
  const { gamePlayers, isGamePlayersLoaded } = useGame()
  const location = useLocation()
  const navigate = useNavigate()

  function quitGame() {
    navigate('/')
  }

  if (isGamePlayersLoaded && !location.state?.gameLaunch && gamePlayers.length === 0) return <Navigate replace to="/" />
  return <GamePage onOpenSettings={props.onOpenSettings} onQuit={quitGame} />
}

function GameApp() {
  const { clearGamePlayers, gameSettings, replaceGamePlayers } = useGame()
  const navigate = useNavigate()
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isElementsOpen, setIsElementsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  function openActions() {
    setIsActionsOpen(true)
  }

  function openElements() {
    setIsElementsOpen(true)
  }

  function openSettings() {
    setIsSettingsOpen(true)
  }

  async function openGame() {
    await clearGamePlayers()
    navigate('/game', { state: { gameLaunch: true } })
  }

  async function startDebugGame() {
    await clearGamePlayers()
    const roles = [
      ...Array(gameSettings.teamCounts.innocents).fill(GAME_ROLES[0]),
      ...Array(gameSettings.teamCounts.saboteurs).fill(GAME_ROLES[1]),
    ]
    const names = ['Alex', 'Camille', 'Charlie', 'Dorian', 'Élise', 'Franck', 'Gaël', 'Inès', 'Jules', 'Lina', 'Malo', 'Nora']
    const emojis = ['😀', '😎', '🤠', '🥳', '🤖', '🦊', '🐼', '🐸', '🦄', '🍉', '🌈', '⭐']

    for (let index = roles.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[roles[index], roles[swapIndex]] = [roles[swapIndex], roles[index]]
    }

    const players: GamePlayer[] = await Promise.all(
      roles.map(async (role, index) => ({
        atouts: [],
        id: crypto.randomUUID(),
        image: await createEmojiImage(emojis[Math.floor(Math.random() * emojis.length)]),
        name: `${names[Math.floor(Math.random() * names.length)]} ${index + 1}`,
        role,
      })),
    )

    GAME_ATOUTS.filter((atout) => gameSettings.enabledAtoutIds.includes(atout.id)).forEach((atout) => {
      const innocentPlayers = players.filter((player) => player.role.name === GAME_ROLES[0].name)
      const recipient = innocentPlayers[Math.floor(Math.random() * innocentPlayers.length)]
      if (recipient) recipient.atouts?.push(atout)
    })

    replaceGamePlayers(players)
    navigate('/game', { state: { gameLaunch: true } })
  }

  return (
    <>
      <Routes>
        <Route element={<GameRoute onOpenSettings={openSettings} />} path="/game" />
        <Route element={(
          <>
            <MainMenu onDebugStartGame={startDebugGame} onOpenActions={openActions} onOpenElements={openElements} onOpenSettings={openSettings} onStartGame={openGame} />
            <ActionsDialog onOpenChange={setIsActionsOpen} open={isActionsOpen} />
            <ElementsDialog onOpenChange={setIsElementsOpen} open={isElementsOpen} />
          </>
        )} path="/" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
      <SettingsDialog onOpenChange={setIsSettingsOpen} open={isSettingsOpen} />
    </>
  )
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  )
}

export default App
