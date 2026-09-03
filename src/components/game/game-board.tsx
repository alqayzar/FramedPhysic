import { useEffect, useState } from 'react'
import { GeneratedActionViewer } from '@/components/actions/generated-action-viewer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GamePlayerCard } from '@/components/game/game-player-card'
import { GamePlayerEliminationDialog } from '@/components/game/game-player-elimination-dialog'
import { GameQuitDialog } from '@/components/game/game-quit-dialog'
import { GamePlayerSelectionDialog } from '@/components/game/game-player-selection-dialog'
import { GameRoundEndDialog } from '@/components/game/game-round-end-dialog'
import { GameRoleDialog } from '@/components/game/game-role-dialog'
import { GamePlayerActionsDialog } from '@/components/game/game-player-actions-dialog'
import { GameTimer } from '@/components/game/game-timer'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { useGame } from '@/contexts/game-context'
import { GAME_ROLES, getGameRole, ROLE_ABILITY_IDS } from '@/lib/game-session'
import { RefreshCw, Settings, UsersRound } from 'lucide-react'

interface GameBoardProps {
  onOpenSettings: () => void
  onQuit: () => void
}

function GameBoard(props: GameBoardProps) {
  const { activePlayerId, canCorruptGameAction, canUseActiveRoleAbility, corruptedActionId, corruptGameAction, eliminateGamePlayer, endGameRound, finishGameRound, gamePlayers, gameSettings, isVoting, reassignGameRoles, roundEndsAt, selectActivePlayer, selectedVotingActionIds, setVotingActionSelected, startGameRound, turnEndsAt, useActiveRoleAbility, winnerIds, winningMessage } = useGame()
  const [isQuitDialogOpen, setIsQuitDialogOpen] = useState(false)
  const [isRoleSelectionEnabled, setIsRoleSelectionEnabled] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>()
  const [selectedActionPlayerId, setSelectedActionPlayerId] = useState<string>()
  const [pendingPlayerId, setPendingPlayerId] = useState<string>()
  const [isRoundEndDialogOpen, setIsRoundEndDialogOpen] = useState(false)
  const [isVotingActionsOpen, setIsVotingActionsOpen] = useState(false)
  const [isCorruptionInfoOpen, setIsCorruptionInfoOpen] = useState(false)
  const [isActionsInfoOpen, setIsActionsInfoOpen] = useState(false)
  const [isAnalyzingPlayer, setIsAnalyzingPlayer] = useState(false)
  const [analyzedPlayerId, setAnalyzedPlayerId] = useState<string>()
  const [pendingEliminationPlayerId, setPendingEliminationPlayerId] = useState<string>()

  useEffect(() => {
    if (!activePlayerId) return

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`game-player-${activePlayerId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [activePlayerId])

  function openQuitDialog() {
    setIsQuitDialogOpen(true)
  }

  function handleQuitDialogOpenChange(open: boolean) {
    setIsQuitDialogOpen(open)
  }

  function closeQuitDialog() {
    setIsQuitDialogOpen(false)
  }

  async function confirmQuit() {
    if (roundEndsAt || isVoting) {
      await endGameRound()
      closeQuitDialog()
      return
    }

    props.onQuit()
  }

  async function quitVictory() {
    await endGameRound()
  }

  function enableRoleSelection() {
    setIsRoleSelectionEnabled((enabled) => !enabled)
  }

  function startGame() {
    const roundTimeout = gameSettings.roundTimeout
    const roundLossTimeout = gameSettings.roundLossTimeout
    const turnTimeout = gameSettings.turnTimeout
    const roundDuration = (roundTimeout.minutes * 60) + roundTimeout.seconds
    const roundLossDuration = (roundLossTimeout.minutes * 60) + roundLossTimeout.seconds
    setIsRoleSelectionEnabled(false)
    startGameRound(roundDuration, (turnTimeout.minutes * 60) + turnTimeout.seconds, roundLossDuration)
  }

  function handlePlayerSelect(playerId: string) {
    const player = gamePlayers.find((currentPlayer) => currentPlayer.id === playerId)
    if (!player || player.eliminated) return

    if (isAnalyzingPlayer && roundEndsAt) {
      if (useActiveRoleAbility(ROLE_ABILITY_IDS.ANALYZE_PLAYER)) {
        setAnalyzedPlayerId(playerId)
        setIsAnalyzingPlayer(false)
      }
      return
    }

    if (isVoting) {
      setPendingEliminationPlayerId(playerId)
      return
    }

    if (roundEndsAt) {
      if (playerId === activePlayerId) setSelectedActionPlayerId(playerId)
      else setPendingPlayerId(playerId)
      return
    }

    if (!isRoleSelectionEnabled) return
    setSelectedPlayerId(playerId)
    setIsRoleSelectionEnabled(false)
  }

  function closeRoleDialog() {
    setSelectedPlayerId(undefined)
  }

  function handleRoleDialogOpenChange(open: boolean) {
    if (!open) closeRoleDialog()
  }

  function closeActionsDialog() {
    setSelectedActionPlayerId(undefined)
  }

  function startPlayerAnalysis() {
    setIsAnalyzingPlayer(true)
    closeActionsDialog()
  }

  function stopPlayerAnalysis() {
    setIsAnalyzingPlayer(false)
  }

  function handleAnalysisDialogOpenChange(open: boolean) {
    if (!open) setAnalyzedPlayerId(undefined)
  }

  function handlePlayerSelectionDialogOpenChange(open: boolean) {
    if (!open) setPendingPlayerId(undefined)
  }

  function confirmPlayerSelection() {
    if (!pendingPlayerId) return

    const timeout = gameSettings.turnTimeout
    selectActivePlayer(pendingPlayerId, (timeout.minutes * 60) + timeout.seconds)
    setPendingPlayerId(undefined)
  }

  function selectNextPlayer() {
    const eligiblePlayers = gamePlayers.filter((player) => player.id !== activePlayerId && !player.eliminated)
    const nextPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)]
    if (!nextPlayer) return

    const timeout = gameSettings.turnTimeout
    setSelectedActionPlayerId(undefined)
    setIsAnalyzingPlayer(false)
    selectActivePlayer(nextPlayer.id, (timeout.minutes * 60) + timeout.seconds)
  }

  function openRoundEndDialog() {
    setIsRoundEndDialogOpen(true)
  }

  function handleRoundEndDialogOpenChange(open: boolean) {
    setIsRoundEndDialogOpen(open)
  }

  async function confirmRoundEnd() {
    await finishGameRound()
    setIsAnalyzingPlayer(false)
    setIsRoundEndDialogOpen(false)
  }

  async function handleRoundTimerExpiry() {
    await finishGameRound()
    setSelectedActionPlayerId(undefined)
    setIsAnalyzingPlayer(false)
    setIsRoundEndDialogOpen(false)
  }

  function handleVotingActionSelect(actionId: string, isSelected: boolean) {
    setVotingActionSelected(actionId, isSelected)
  }

  function handleVotingActionsOpenChange(open: boolean) {
    setIsVotingActionsOpen(open)
  }

  function handleEliminationDialogOpenChange(open: boolean) {
    if (!open) setPendingEliminationPlayerId(undefined)
  }

  function confirmElimination() {
    if (!pendingEliminationPlayerId) return
    eliminateGamePlayer(pendingEliminationPlayerId)
    setPendingEliminationPlayerId(undefined)
  }

  const selectedPlayer = gamePlayers.find((player) => player.id === selectedPlayerId)
  const selectedActionPlayer = gamePlayers.find((player) => player.id === selectedActionPlayerId)
  const analyzedPlayer = gamePlayers.find((player) => player.id === analyzedPlayerId)
  const totalActions = gamePlayers.reduce((total, player) => total + (player.actions?.length ?? 0), 0)
  const pendingPlayer = gamePlayers.find((player) => player.id === pendingPlayerId)
  const pendingEliminationPlayer = gamePlayers.find((player) => player.id === pendingEliminationPlayerId)
  const votingActions = gamePlayers.filter((player) => !player.eliminated).flatMap((player) => player.actions ?? [])
  const innocentPlayers = gamePlayers.filter((player) => player.role.name !== GAME_ROLES[1].name && !player.eliminated)
  const corruptedPlayerCount = innocentPlayers.filter((player) => player.corrupted).length
  const isVictory = winnerIds.length > 0
  const selectedActionPlayerRole = selectedActionPlayer ? getGameRole(selectedActionPlayer.role.name) : undefined
  const selectedPlayerCanAnalyze = Boolean(selectedActionPlayer?.id === activePlayerId && selectedActionPlayerRole?.abilities.some((ability) => ability.id === ROLE_ABILITY_IDS.ANALYZE_PLAYER))
  const analystRoleAction = selectedPlayerCanAnalyze ? {
    disabled: isAnalyzingPlayer || !canUseActiveRoleAbility(ROLE_ABILITY_IDS.ANALYZE_PLAYER),
    label: 'Analyser un joueur',
    onClick: startPlayerAnalysis,
  } : undefined

  return (
    <section className="mx-auto flex h-full max-w-4xl flex-col">
      <div className="flex flex-row flex-wrap gap-3">
        <Button className="cartoon-press flex-1 rounded-xl border-4 border-game-ink bg-game-red px-5 py-3 font-black text-white hover:bg-game-red" onClick={isVictory ? quitVictory : openQuitDialog} type="button">Quitter</Button>
        {!isVictory && !roundEndsAt && !isVoting && (
          <Button aria-label="Réattribuer les rôles aléatoirement" className="cartoon-press flex-1 rounded-xl border-4 border-game-ink bg-game-blue px-5 py-3 font-black text-white hover:bg-game-blue" onClick={reassignGameRoles} type="button">
            <RefreshCw aria-hidden="true" className="size-5" />
            Réassigner
          </Button>
        )}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <UsersRound aria-hidden="true" className="size-7" />
        {!roundEndsAt && !isVoting && (
          <>
            <h1 className="text-3xl font-black tracking-[-0.06em]">{gamePlayers.length}</h1>
            <span aria-label="Rôles assignés" className="flex -space-x-2">
              {gamePlayers
                .filter((player, index, players) => player.role.name !== GAME_ROLES[0].name || players.findIndex((currentPlayer) => currentPlayer.role.name === GAME_ROLES[0].name) === index)
                .sort((firstPlayer, secondPlayer) => GAME_ROLES.findIndex((role) => role.name === firstPlayer.role.name) - GAME_ROLES.findIndex((role) => role.name === secondPlayer.role.name))
                .map((player) => <GameRoleIcon className="size-8" key={player.id} role={player.role} />)}
            </span>
          </>
        )}
        {(roundEndsAt || isVoting) && (
          <button aria-label="Expliquer les joueurs corrompus" className="cartoon-press rounded-full border-2 border-game-ink bg-game-red px-2.5 py-1 text-sm font-black text-white hover:bg-game-red" onClick={() => setIsCorruptionInfoOpen(true)} type="button">
            {corruptedPlayerCount}/{innocentPlayers.length} corrompus
          </button>
        )}
        {roundEndsAt && (
          <button aria-label="Expliquer le nombre d’actions" className="cartoon-press rounded-full border-2 border-game-ink bg-game-yellow px-2.5 py-1 text-sm font-black hover:bg-game-yellow" onClick={() => setIsActionsInfoOpen(true)} type="button">
            {totalActions} {totalActions === 1 ? 'action' : 'actions'}
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 mt-3 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 pt-3 px-2 pb-96">
        {gamePlayers.map((player) => (
          <GamePlayerCard
            isActive={!isVictory && player.id === activePlayerId}
            isEliminated={Boolean(player.eliminated)}
            isRoundRunning={!isVictory && Boolean(roundEndsAt)}
            isTargetSelectionEnabled={!isVictory && isAnalyzingPlayer}
            isVoting={!isVictory && isVoting}
            isRoleSelectionEnabled={!isVictory && isRoleSelectionEnabled}
            isWinner={winnerIds.includes(player.id)}
            key={player.id}
            onRoleSelect={handlePlayerSelect}
            player={player}
            showRole={isVictory}
            showRoleAfterElimination={gameSettings.showRoleAfterElimination}
          />
        ))}
        </div>
      </div>
      {isVictory && (
        <div className="fixed inset-x-5 bottom-6 z-20 mx-auto max-w-sm -rotate-1 rounded-2xl border-4 border-game-ink bg-game-yellow px-5 py-4 text-center text-2xl font-black shadow-[0_6px_0_0_#16171d] sm:inset-x-8 sm:text-3xl">
          {winningMessage}
        </div>
      )}
      {!isVictory && (roundEndsAt ? (
        <div className="fixed inset-x-5 bottom-6 z-20 mx-auto grid max-w-sm gap-3 sm:inset-x-8">
          {isAnalyzingPlayer && <Button className="cartoon-press h-auto rounded-xl border-4 border-game-ink bg-game-red px-5 py-3 font-black text-white hover:bg-game-red" onClick={stopPlayerAnalysis} type="button">Arrêter l’analyse</Button>}
          {turnEndsAt && <GameTimer endsAt={turnEndsAt} label="Temps par tour" onExpire={selectNextPlayer} />}
          <GameTimer endsAt={roundEndsAt} label="Temps de manche" onClick={openRoundEndDialog} onExpire={handleRoundTimerExpiry} />
        </div>
      ) : isVoting ? (
        <div className="fixed inset-x-5 bottom-6 z-20 mx-auto flex max-w-sm gap-3 sm:inset-x-8">
          <Button className="cartoon-press h-auto flex-1 rounded-xl border-4 border-game-ink bg-game-blue px-5 py-3 font-black text-white hover:bg-game-blue" onClick={() => setIsVotingActionsOpen(true)} type="button">
            Actions • {selectedVotingActionIds.length} / {votingActions.length}
          </Button>
          <Button className="cartoon-press h-auto flex-1 rounded-xl border-4 border-game-ink bg-game-green px-5 py-3 font-black text-white hover:bg-game-green" onClick={startGame} type="button">
            Go
          </Button>
        </div>
      ) : (
        <div className="fixed inset-x-5 bottom-6 z-20 mx-auto flex max-w-sm gap-3 sm:inset-x-8">
          <Button className="cartoon-press h-auto flex-1 rounded-xl border-4 border-game-ink bg-game-purple px-5 py-3 font-black text-white hover:bg-game-purple" onClick={enableRoleSelection} type="button">
            Voir rôle
          </Button>
          <Button aria-label="Ouvrir les paramètres" className="cartoon-press h-auto shrink-0 rounded-xl border-4 border-game-ink bg-slate-400 px-3 py-3 font-black text-white hover:bg-slate-400" onClick={props.onOpenSettings} type="button">
            <Settings aria-hidden="true" className="size-5" />
          </Button>
          <Button className="cartoon-press h-auto flex-1 rounded-xl border-4 border-game-ink bg-game-green px-5 py-3 font-black text-white hover:bg-game-green" onClick={startGame} type="button">
            Go
          </Button>
        </div>
      ))}
      <GameQuitDialog isRoundRunning={Boolean(roundEndsAt) || isVoting} onConfirm={confirmQuit} onOpenChange={handleQuitDialogOpenChange} open={isQuitDialogOpen} />
      {selectedPlayer && (
        <GameRoleDialog onConfirm={closeRoleDialog} onOpenChange={handleRoleDialogOpenChange} open playerName={selectedPlayer.name} role={selectedPlayer.role} />
      )}
      {selectedActionPlayer && (
        <GamePlayerActionsDialog canCorruptAction={canCorruptGameAction} corruptedActionId={corruptedActionId} onCorruptAction={corruptGameAction} onOpenChange={closeActionsDialog} open player={selectedActionPlayer} players={gamePlayers} roleAction={analystRoleAction} />
      )}
      <GamePlayerSelectionDialog onConfirm={confirmPlayerSelection} onOpenChange={handlePlayerSelectionDialogOpenChange} open={Boolean(pendingPlayer)} player={pendingPlayer} />
      <GameRoundEndDialog onConfirm={confirmRoundEnd} onOpenChange={handleRoundEndDialogOpenChange} open={isRoundEndDialogOpen} />
      <GamePlayerEliminationDialog onConfirm={confirmElimination} onOpenChange={handleEliminationDialogOpenChange} open={Boolean(pendingEliminationPlayer)} player={pendingEliminationPlayer} />
      <Dialog onOpenChange={handleAnalysisDialogOpenChange} open={Boolean(analyzedPlayer)}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Analyse</DialogTitle>
            <DialogDescription className="mt-3 font-bold leading-6 text-game-ink/65">
              {analyzedPlayer?.corrupted ? `${analyzedPlayer.name} est corrompu.` : `${analyzedPlayer?.name} n’est pas corrompu.`}
            </DialogDescription>
          </DialogHeader>
          <Button className="cartoon-press h-auto w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-lg font-black text-game-ink hover:bg-game-yellow" onClick={() => setAnalyzedPlayerId(undefined)} type="button">Ok</Button>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setIsCorruptionInfoOpen} open={isCorruptionInfoOpen}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Joueurs corrompus</DialogTitle>
            <DialogDescription className="mt-3 font-bold leading-6 text-game-ink/65">Les Saboteurs gagnent lorsqu’ils ont corrompu tous les Innocents.</DialogDescription>
          </DialogHeader>
          <Button className="cartoon-press h-auto w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-lg font-black text-game-ink hover:bg-game-yellow" onClick={() => setIsCorruptionInfoOpen(false)} type="button">Ok</Button>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setIsActionsInfoOpen} open={isActionsInfoOpen}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Actions de la manche</DialogTitle>
            <DialogDescription className="mt-3 font-bold leading-6 text-game-ink/65">Ce nombre indique le total des actions distribuées aux joueurs pour cette manche.</DialogDescription>
          </DialogHeader>
          <Button className="cartoon-press h-auto w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-lg font-black text-game-ink hover:bg-game-yellow" onClick={() => setIsActionsInfoOpen(false)} type="button">Ok</Button>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={handleVotingActionsOpenChange} open={isVotingActionsOpen}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-lg">
          <DialogHeader className="pr-10">
            <DialogTitle className="break-words text-2xl font-black tracking-[-0.06em]">Actions • {selectedVotingActionIds.length} / {votingActions.length}</DialogTitle>
            <DialogDescription className="mt-2 font-bold leading-6 text-game-ink/65">Veuillez sélectionner les actions correctement réalisées.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55svh] overflow-y-auto overscroll-contain pr-1">
            <GeneratedActionViewer actions={votingActions} onSelect={handleVotingActionSelect} selectedActionClassName="ring-8 ring-inset ring-game-green" selectedActionIds={selectedVotingActionIds} />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { GameBoard }
