import { useEffect, useState } from 'react'
import { ActionsDialog } from '@/components/actions/actions-dialog'
import { ElementsDialog } from '@/components/elements/elements-dialog'
import { MainMenu } from '@/components/menu/main-menu'
import { GamePage } from '@/components/game/game-page'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { GameProvider, useGame } from '@/contexts/game-context'
import { createEmojiImage } from '@/lib/emoji-image'
import { GAME_ROLES, type GamePlayer } from '@/lib/game-session'

function GameApp() {
  const { clearGamePlayers, gameSettings, isGamePlayersLoaded, replaceGamePlayers } = useGame()
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isElementsOpen, setIsElementsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (path !== '/game' || !isGamePlayersLoaded || window.history.state?.gameLaunch) return

    window.history.replaceState({}, '', '/')
    setPath('/')
  }, [isGamePlayersLoaded, path])

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
    window.history.pushState({ gameLaunch: true }, '', '/game')
    setPath('/game')
  }

  function quitGame() {
    window.history.pushState({}, '', '/')
    setPath('/')
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
        id: crypto.randomUUID(),
        image: await createEmojiImage(emojis[Math.floor(Math.random() * emojis.length)]),
        name: `${names[Math.floor(Math.random() * names.length)]} ${index + 1}`,
        role,
      })),
    )

    replaceGamePlayers(players)
    window.history.pushState({ gameLaunch: true }, '', '/game')
    setPath('/game')
  }

  if (path === '/game') return <GamePage onQuit={quitGame} />

  return (
    <>
      <MainMenu onDebugStartGame={startDebugGame} onOpenActions={openActions} onOpenElements={openElements} onOpenSettings={openSettings} onStartGame={openGame} />
      <ActionsDialog onOpenChange={setIsActionsOpen} open={isActionsOpen} />
      <ElementsDialog onOpenChange={setIsElementsOpen} open={isElementsOpen} />
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
