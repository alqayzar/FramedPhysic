import { useState } from 'react';
import { GeneratedActionViewer } from '@/components/actions/generated-action-viewer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type GameAtoutContext, type GameAtoutDefinition, type GamePlayer } from '@/lib/game-session';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import saboteurIcon from '@/assets/roles/saboteur.svg?url';

const SABOTEUR_CORRUPTED_ACTION_VALUE_KEY = 'saboteur-corrupted-action-id';

interface CorruptionDialogProps {
  context: GameAtoutContext;
}

function CorruptionDialog(props: CorruptionDialogProps) {
  const [selectedActionId, setSelectedActionId] = useState<string | undefined>(() => props.context.getValue<string | null>(SABOTEUR_CORRUPTED_ACTION_VALUE_KEY, null) ?? undefined);

  function selectAction(actionId: string, isSelected: boolean) {
    const nextActionId = isSelected ? actionId : undefined;
    setSelectedActionId(nextActionId);
    props.context.setValue(SABOTEUR_CORRUPTED_ACTION_VALUE_KEY, nextActionId ?? null);
  }

  function hasCorruptedAction(player: GamePlayer): boolean {
    return Boolean(selectedActionId && player.actions?.some((action) => action.id === selectedActionId));
  }

  return (
    <div className="max-h-[60svh] overflow-y-auto">
      <p className="mb-3 font-bold text-game-red">Choisis une action à corrompre.</p>
      {props.context.players.filter((player) => !player.eliminated).map((player) => (
        <Collapsible defaultOpen={props.context.playerId === player.id} key={player.id}>
          <CollapsibleTrigger className={cn('group mt-3 flex w-full items-center justify-between py-2 text-left font-bold', hasCorruptedAction(player) ? 'text-game-red' : 'text-game-ink/55')}>
            <span className="truncate pr-3">{props.context.playerId === player.id ? 'Mes actions' : player.name}</span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="collapsible-panel">
            <div className="py-3">
              <GeneratedActionViewer actions={player.actions ?? []} onSelect={selectAction} selectedActionClassName="ring-8 ring-inset ring-game-red" selectedActionIds={selectedActionId ? [selectedActionId] : []} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

export const saboteurAtout: GameAtoutDefinition = {
  abilities: [{
    label: 'Corrompre',
    onClick: (context) => {
      context.openDialog('Corrompre', <CorruptionDialog context={context} />);
    },
  }],
  autoDistribute: 'Saboteur',
  description: 'Atout réservé aux Saboteurs.',
  id: 'saboteur',
  icon: saboteurIcon,
  name: 'Saboteur',
  onRoundStart: (context) => {
    context.setValue(SABOTEUR_CORRUPTED_ACTION_VALUE_KEY, null);
    context.enableAbility([context.playerId, context.atoutId, 'Corrompre'], true);
  },
  onTurnEnd: (context) => {
    if (context.gameState.activePlayerId !== context.playerId) return;

    context.players.forEach((player) => {
      if (player.atouts?.some((atout) => atout.id === context.atoutId)) context.enableAbility([player.id, context.atoutId, 'Corrompre'], false);
    });
  },
  visible: false,
};
