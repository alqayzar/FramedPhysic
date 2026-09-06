import protectionIcon from '@/assets/atouts/protection.svg?url';
import { type GameAtoutDefinition } from '@/lib/game-session';

export const PROTECTION_ACTION_VALUE_KEY = "protection-player-id";
export const PREVIOUS_PROTECTION_ACTION_VALUE_KEY = "previous-protection-player-id";

export const protectionAtout: GameAtoutDefinition = {
  id: 'protection',
  name: 'Protection',
  description: 'Utilisable une fois par manche, permet de protéger un joueur de la corruption.',
  icon: protectionIcon,
  onRoundStart: (context) => {
    context.enableAbility([context.playerId, context.atoutId, 'Protéger'],
      !context.players.find(p => p.id === context.playerId)?.corrupted
    );
    context.setValue(PREVIOUS_PROTECTION_ACTION_VALUE_KEY, context.getValue<string|null>(PROTECTION_ACTION_VALUE_KEY, null));
    context.setValue(PROTECTION_ACTION_VALUE_KEY, null);
  },
  abilities: [{
    label: 'Protéger',
    onClick: (context) => {
      let removeControlButtons: () => void = () => undefined;
      const stopListeningForPlayer = context.onPlayerPressed((playerId) => {
        const player = context.players.find((currentPlayer) => currentPlayer.id === playerId);
        if (!player) return;

        const previousProtectedPlayerId = context.getValue<string | null>(PREVIOUS_PROTECTION_ACTION_VALUE_KEY, null);
        if (previousProtectedPlayerId === playerId)
        {
          context.openDialog({
            title: "Protection",
            content: "Vous ne pouvez pas choisir le même joueur de la manche précedente"
          });
          return;
        }

        stopListeningForPlayer();
        removeControlButtons();
        context.setValue(PROTECTION_ACTION_VALUE_KEY, playerId);
        context.enableAbility([context.playerId, context.atoutId, 'Protéger'], false);
        context.openDialog({
          title: 'Protection',
          content: `${player.name} est à présent protéger.`,
        });
      });
      removeControlButtons = context.addGroupButton([{
        buttons: [{
          backgroundColor: 'var(--color-game-red)',
          label: 'Ne plus protéger',
          onClick: () => {
            stopListeningForPlayer();
            removeControlButtons();
          },
        }],
        description: 'Choisis un joueur à protéger.',
      }]);
    },
  }],
};
