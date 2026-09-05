import { useEffect, useRef, useState, type ReactNode } from 'react'
import { GeneratedActionViewer } from '@/components/actions/generated-action-viewer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GamePlayerCard } from '@/components/game/game-player-card'
import { GamePlayerEliminationDialog } from '@/components/game/game-player-elimination-dialog'
import { GameQuitDialog } from '@/components/game/game-quit-dialog'
import { GamePlayerSelectionDialog } from '@/components/game/game-player-selection-dialog'
import { GameRoundEndDialog } from '@/components/game/game-round-end-dialog'
import { GameRoleDialog } from '@/components/game/game-role-dialog'
import { GamePlayerPortraitDialog } from '@/components/game/game-player-portrait-dialog'
import { GamePlayerActionsDialog } from '@/components/game/game-player-actions-dialog'
import { GameTimer } from '@/components/game/game-timer'
import { GameRoleIcon } from '@/components/game/game-role-icon'
import { GameAtoutIcon } from '@/components/game/game-atout-icon'
import { useGame } from '@/contexts/game-context'
import { GAME_ROLES, getGameAtout, type AtoutId, type GameAtout, type GameAtoutButtonGroup, type GameAtoutContext } from '@/lib/game-session'
import { RefreshCw, Settings, UsersRound } from 'lucide-react'

const ENABLED_ABILITIES_VALUE_KEY = '__enabled-abilities';

interface GameBoardProps {
  onOpenSettings: () => void
  onQuit: () => void
}

interface AtoutControlButtonGroup extends GameAtoutButtonGroup {
  id: string
}

interface AtoutDialogContent {
  content?: ReactNode
  title?: ReactNode
}

function GameBoard(props: GameBoardProps) {
  const { activePlayerId, eliminateGamePlayer, endGameRound, finishGameRound, gamePlayers, gameSettings, getValue, isVoting, reassignGameRoles, replaceGamePlayers, roundEndsAt, roundNumber, selectActivePlayer, selectedVotingActionIds, setValue, setVotingActionSelected, startGameRound, turnEndsAt, winnerIds, winningMessage } = useGame()
  const [isQuitDialogOpen, setIsQuitDialogOpen] = useState(false)
  const [isRoleSelectionEnabled, setIsRoleSelectionEnabled] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>()
  const [selectedPortraitPlayerId, setSelectedPortraitPlayerId] = useState<string>()
  const [selectedActionPlayerId, setSelectedActionPlayerId] = useState<string>()
  const [pendingPlayerId, setPendingPlayerId] = useState<string>()
  const [isRoundEndDialogOpen, setIsRoundEndDialogOpen] = useState(false)
  const [isVotingActionsOpen, setIsVotingActionsOpen] = useState(false)
  const [isCorruptionInfoOpen, setIsCorruptionInfoOpen] = useState(false)
  const [isActionsInfoOpen, setIsActionsInfoOpen] = useState(false)
  const playerPressHandler = useRef<{ callback: (playerId: string) => void, id: string } | undefined>(undefined)
  const lastStartedRoundNumber = useRef<number | undefined>(undefined)
  const lastStartedTurnEndsAt = useRef<number | undefined>(undefined)
  const assignedItemsRef = useRef<HTMLDivElement>(null)
  const [isAtoutPlayerSelectionEnabled, setIsAtoutPlayerSelectionEnabled] = useState(false)
  const [atoutControlButtonGroups, setAtoutControlButtonGroups] = useState<AtoutControlButtonGroup[]>([])
  const [enabledAbilities, setEnabledAbilities] = useState<Record<string, boolean>>(() => getValue(ENABLED_ABILITIES_VALUE_KEY, {}))
  const [selectedStackItemId, setSelectedStackItemId] = useState<string>()
  const [atoutDialog, setAtoutDialog] = useState<AtoutDialogContent>()
  const [pendingEliminationPlayerId, setPendingEliminationPlayerId] = useState<string>()

  useEffect(() => {
    if (!activePlayerId) return

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`game-player-${activePlayerId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [activePlayerId])

  useEffect(() => {
    function closeStackItemOnOutsidePress(event: PointerEvent) {
      if (!assignedItemsRef.current?.contains(event.target as Node)) setSelectedStackItemId(undefined);
    }

    document.addEventListener('pointerdown', closeStackItemOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeStackItemOnOutsidePress);
  }, [])

  useEffect(() => {
    if (!roundEndsAt) {
      lastStartedRoundNumber.current = undefined;
      return;
    }
    if (roundNumber === 0 || lastStartedRoundNumber.current === roundNumber) return;

    lastStartedRoundNumber.current = roundNumber;
    gamePlayers.forEach((player) => {
      player.atouts?.forEach((assignedAtout) => {
        const atout = getGameAtout(assignedAtout.id);
        if (!atout?.onRoundStart) return;

        const lifecycleKey = `__round-start:${player.id}:${assignedAtout.id}`;
        if (getValue(lifecycleKey, 0) === roundNumber) return;
        setValue(lifecycleKey, roundNumber);
        atout.onRoundStart(createAtoutContext(player.id, assignedAtout.id));
      });
    });
  }, [gamePlayers, roundEndsAt, roundNumber]);

  useEffect(() => {
    if (!turnEndsAt) {
      lastStartedTurnEndsAt.current = undefined;
      return;
    }
    if (lastStartedTurnEndsAt.current === turnEndsAt) return;

    lastStartedTurnEndsAt.current = turnEndsAt;
    gamePlayers.forEach((player) => {
      player.atouts?.forEach((assignedAtout) => {
        const atout = getGameAtout(assignedAtout.id);
        if (!atout?.onTurnStart) return;

        const lifecycleKey = `__turn-start:${player.id}:${assignedAtout.id}`;
        if (getValue(lifecycleKey, 0) === turnEndsAt) return;
        setValue(lifecycleKey, turnEndsAt);
        atout.onTurnStart(createAtoutContext(player.id, assignedAtout.id));
      });
    });
  }, [gamePlayers, turnEndsAt]);

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

  function toggleStackItem(id: string) {
    setSelectedStackItemId((selectedId) => selectedId === id ? undefined : id);
  }

  function startGame() {
    const roundTimeout = gameSettings.roundTimeout
    const roundLossTimeout = gameSettings.roundLossTimeout
    const turnTimeout = gameSettings.turnTimeout
    const roundDuration = (roundTimeout.minutes * 60) + roundTimeout.seconds
    const roundLossDuration = (roundLossTimeout.minutes * 60) + roundLossTimeout.seconds
    clearAtoutControls()
    setIsRoleSelectionEnabled(false)
    startGameRound(roundDuration, (turnTimeout.minutes * 60) + turnTimeout.seconds, roundLossDuration)
  }

  function handlePlayerSelect(playerId: string) {
    const player = gamePlayers.find((currentPlayer) => currentPlayer.id === playerId)
    if (!player || player.eliminated) return

    if (playerPressHandler.current && roundEndsAt) {
      playerPressHandler.current.callback(playerId)
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

    if (isRoleSelectionEnabled) {
      setSelectedPlayerId(playerId)
      setIsRoleSelectionEnabled(false)
      return
    }

    setSelectedPortraitPlayerId(playerId)
  }

  function closeRoleDialog() {
    setSelectedPlayerId(undefined)
  }

  function handleRoleDialogOpenChange(open: boolean) {
    if (!open) closeRoleDialog()
  }

  function closePortraitDialog() {
    setSelectedPortraitPlayerId(undefined)
  }

  function handlePortraitDialogOpenChange(open: boolean) {
    if (!open) closePortraitDialog()
  }

  function updatePortrait(image: Blob | undefined) {
    if (!selectedPortraitPlayerId) return;
    replaceGamePlayers(gamePlayers.map((player) => player.id === selectedPortraitPlayerId ? { ...player, image } : player));
    closePortraitDialog();
  }

  function closeActionsDialog() {
    setSelectedActionPlayerId(undefined)
  }

  function clearAtoutControls() {
    playerPressHandler.current = undefined
    setIsAtoutPlayerSelectionEnabled(false)
    setAtoutControlButtonGroups([])
    setAtoutDialog(undefined)
  }

  function addAtoutGroupButton(groups: GameAtoutButtonGroup[]): () => void {
    const groupsWithIds = groups.map((group) => ({ ...group, id: crypto.randomUUID() }))
    setAtoutControlButtonGroups((currentGroups) => [...currentGroups, ...groupsWithIds])

    return () => setAtoutControlButtonGroups((currentGroups) => currentGroups.filter((group) => !groupsWithIds.some((addedGroup) => addedGroup.id === group.id)))
  }

  function getAtoutAbilityKey(playerId: string, atoutId: string, label: string): string {
    return `${playerId}:${atoutId}:${label}`;
  }

  function enableAtoutAbility([playerId, atoutId, label]: [string, AtoutId, string], enabled: boolean) {
    const key = getAtoutAbilityKey(playerId, atoutId, label);
    setEnabledAbilities((currentAbilities) => {
      const nextAbilities = { ...currentAbilities, [key]: enabled };
      setValue(ENABLED_ABILITIES_VALUE_KEY, nextAbilities);
      return nextAbilities;
    });
  }

  function onAtoutPlayerPressed(callback: (playerId: string) => void): () => void {
    const id = crypto.randomUUID()
    playerPressHandler.current = { callback, id }
    setIsAtoutPlayerSelectionEnabled(true)

    return () => {
      if (playerPressHandler.current?.id !== id) return
      playerPressHandler.current = undefined
      setIsAtoutPlayerSelectionEnabled(false)
    }
  }

  function openAtoutDialog(title?: ReactNode, content?: ReactNode) {
    setAtoutDialog({ content, title })
  }

  function handleAtoutDialogOpenChange(open: boolean) {
    if (!open) setAtoutDialog(undefined)
  }

  function useAtoutAbility(atoutId: string, abilityIndex: number) {
    const playerHasAtout = selectedActionPlayer?.atouts?.some((atout) => atout.id === atoutId)
    const atout = playerHasAtout ? getGameAtout(atoutId) : undefined
    const ability = atout?.abilities[abilityIndex]
    if (!atout || !ability || !selectedActionPlayer) return;

    closeActionsDialog();
    ability.onClick(createAtoutContext(selectedActionPlayer.id, atout.id));
  }

  function createAtoutContext(playerId: string, atoutId: AtoutId): GameAtoutContext {
    return {
      addGroupButton: addAtoutGroupButton,
      atoutId,
      enableAbility: enableAtoutAbility,
      gameState: { activePlayerId, roundEndsAt, roundNumber, turnEndsAt },
      getValue,
      onPlayerPressed: onAtoutPlayerPressed,
      openDialog: openAtoutDialog,
      playerId,
      players: gamePlayers,
      setValue,
    }
  }

  function handlePlayerSelectionDialogOpenChange(open: boolean) {
    if (!open) setPendingPlayerId(undefined)
  }

  function confirmPlayerSelection() {
    if (!pendingPlayerId) return

    const timeout = gameSettings.turnTimeout
    runAtoutTurnEnd()
    clearAtoutControls()
    selectActivePlayer(pendingPlayerId, (timeout.minutes * 60) + timeout.seconds)
    setPendingPlayerId(undefined)
  }

  function runAtoutTurnEnd() {
    if (!turnEndsAt) return

    gamePlayers.forEach((player) => {
      player.atouts?.forEach((assignedAtout) => {
        getGameAtout(assignedAtout.id)?.onTurnEnd?.(createAtoutContext(player.id, assignedAtout.id))
      })
    })
  }

  function selectNextPlayer() {
    const eligiblePlayers = gamePlayers.filter((player) => player.id !== activePlayerId && !player.eliminated)
    const nextPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)]
    if (!nextPlayer) return

    const timeout = gameSettings.turnTimeout
    setSelectedActionPlayerId(undefined)
    clearAtoutControls()
    runAtoutTurnEnd()
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
    clearAtoutControls()
    setIsRoundEndDialogOpen(false)
  }

  async function handleRoundTimerExpiry() {
    await finishGameRound()
    setSelectedActionPlayerId(undefined)
    clearAtoutControls()
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
  const selectedPortraitPlayer = gamePlayers.find((player) => player.id === selectedPortraitPlayerId)
  const selectedActionPlayer = gamePlayers.find((player) => player.id === selectedActionPlayerId)
  const totalActions = gamePlayers.reduce((total, player) => total + (player.actions?.length ?? 0), 0)
  const pendingPlayer = gamePlayers.find((player) => player.id === pendingPlayerId)
  const pendingEliminationPlayer = gamePlayers.find((player) => player.id === pendingEliminationPlayerId)
  const votingActions = gamePlayers.filter((player) => !player.eliminated).flatMap((player) => player.actions ?? [])
  const innocentPlayers = gamePlayers.filter((player) => player.role.name !== GAME_ROLES[1].name && !player.eliminated)
  const corruptedPlayerCount = innocentPlayers.filter((player) => player.corrupted).length
  const isVictory = winnerIds.length > 0
  const assignedRoleSummaries = GAME_ROLES
    .map((role) => ({ count: gamePlayers.filter((player) => player.role.name === role.name).length, role }))
    .filter(({ count }) => count > 0);
  const assignedAtouts = gamePlayers
    .flatMap((player) => player.atouts ?? [])
    .filter((atout) => atout.visible !== false)
    .filter((atout, index, atouts) => atouts.findIndex((currentAtout) => currentAtout.id === atout.id) === index);
  const selectedActionPlayerAtouts = (selectedActionPlayer?.atouts ?? [])
    .map((atout) => getGameAtout(atout.id))
    .filter((atout): atout is GameAtout => Boolean(atout))
  const atoutActions = selectedActionPlayer && selectedActionPlayer.id === activePlayerId
      ? selectedActionPlayerAtouts.flatMap((atout) => atout.abilities.map((ability, abilityIndex) => ({
        atout,
        backgroundColor: ability.backgroundColor,
        disabled: enabledAbilities[getAtoutAbilityKey(selectedActionPlayer.id, atout.id, ability.label)] === false,
        id: `${atout.id}:${abilityIndex}`,
        label: ability.label,
        onClick: () => useAtoutAbility(atout.id, abilityIndex),
      })))
    : []

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
      <div className="mt-8 flex items-center gap-3" ref={assignedItemsRef}>
        <UsersRound aria-hidden="true" className="size-7" />
        {!roundEndsAt && !isVoting && (
          <>
            <h1 className="text-3xl font-black tracking-[-0.06em]">{gamePlayers.length}</h1>
            <span aria-label="Rôles assignés" className="flex -space-x-2">
              {assignedRoleSummaries.map(({ count, role }) => (
                <button aria-label={role.name} aria-pressed={selectedStackItemId === role.name} className="relative flex items-center" key={role.name} onClick={() => toggleStackItem(role.name)} type="button">
                  <GameRoleIcon className="size-8" role={role} />
                  {role.name === GAME_ROLES[1].name && count > 1 && <span className="-ml-1 text-lg leading-none font-black">X{count}</span>}
                  {selectedStackItemId === role.name && <span className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-game-ink bg-white px-2 py-1 text-xs font-black shadow-[0_2px_0_0_#16171d]">{role.name}</span>}
                </button>
              ))}
            </span>
            <span aria-label="Atouts assignés" className="flex -space-x-2">
              {assignedAtouts.map((atout, index) => {
                const itemId = `${atout.id}-${index}`;

                return (
                  <button aria-label={atout.name} aria-pressed={selectedStackItemId === itemId} className="relative" key={itemId} onClick={() => toggleStackItem(itemId)} type="button">
                    <GameAtoutIcon atout={atout} className="size-8" />
                    {selectedStackItemId === itemId && <span className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-game-ink bg-white px-2 py-1 text-xs font-black shadow-[0_2px_0_0_#16171d]">{atout.name}</span>}
                  </button>
                )
              })}
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
            isLobby={!isVictory && !roundEndsAt && !isVoting}
            isRoundRunning={!isVictory && Boolean(roundEndsAt)}
            isTargetSelectionEnabled={!isVictory && isAtoutPlayerSelectionEnabled}
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
          {atoutControlButtonGroups.map((group) => (
            <div className="grid gap-3 rounded-2xl border-4 border-game-ink bg-white/85 p-2 shadow-[0_4px_0_0_#16171d]" key={group.id}>
              <p className="text-center text-xs font-bold text-game-ink/65">{group.description}</p>
              {group.buttons.map((button) => (
                <Button className="cartoon-press h-auto rounded-xl border-4 border-game-ink px-5 py-3 font-black text-white" key={button.label} onClick={button.onClick} style={{ backgroundColor: button.backgroundColor ?? 'var(--color-game-blue)' }} type="button">
                  {button.label}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex gap-3">
            {turnEndsAt && <GameTimer endsAt={turnEndsAt} label="Tour" onExpire={selectNextPlayer} />}
            <GameTimer endsAt={roundEndsAt} label="Manche" onClick={openRoundEndDialog} onExpire={handleRoundTimerExpiry} />
          </div>
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
        <GameRoleDialog atouts={selectedPlayer.atouts} onConfirm={closeRoleDialog} onOpenChange={handleRoleDialogOpenChange} open playerName={selectedPlayer.name} role={selectedPlayer.role} />
      )}
      {selectedPortraitPlayer && <GamePlayerPortraitDialog onImageChange={updatePortrait} onOpenChange={handlePortraitDialogOpenChange} open player={selectedPortraitPlayer} />}
      {selectedActionPlayer && (
        <GamePlayerActionsDialog atoutActions={atoutActions} onOpenChange={closeActionsDialog} open player={selectedActionPlayer} />
      )}
      <GamePlayerSelectionDialog onConfirm={confirmPlayerSelection} onOpenChange={handlePlayerSelectionDialogOpenChange} open={Boolean(pendingPlayer)} player={pendingPlayer} />
      <GameRoundEndDialog onConfirm={confirmRoundEnd} onOpenChange={handleRoundEndDialogOpenChange} open={isRoundEndDialogOpen} />
      <GamePlayerEliminationDialog onConfirm={confirmElimination} onOpenChange={handleEliminationDialogOpenChange} open={Boolean(pendingEliminationPlayer)} player={pendingEliminationPlayer} />
      <Dialog onOpenChange={handleAtoutDialogOpenChange} open={Boolean(atoutDialog)}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            {atoutDialog?.title && <DialogTitle className="text-2xl font-black tracking-[-0.04em]">{atoutDialog.title}</DialogTitle>}
          </DialogHeader>
          {atoutDialog?.content && <div className="mt-3 font-bold leading-6 text-game-ink/65">{atoutDialog.content}</div>}
          <Button className="cartoon-press h-auto w-full rounded-xl border-4 border-game-ink bg-game-yellow px-5 py-3 text-lg font-black text-game-ink hover:bg-game-yellow" onClick={() => setAtoutDialog(undefined)} type="button">Ok</Button>
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
