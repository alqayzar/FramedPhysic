import { useState } from 'react'
import { ActionsDialog } from '@/components/actions/actions-dialog'
import { ElementsDialog } from '@/components/elements/elements-dialog'
import { MainMenu } from '@/components/menu/main-menu'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { GameProvider } from '@/contexts/game-context'

function GameApp() {
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

  return (
    <>
      <MainMenu onOpenActions={openActions} onOpenElements={openElements} onOpenSettings={openSettings} />
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
