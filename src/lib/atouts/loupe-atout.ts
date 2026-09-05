import loupeIcon from '@/assets/atouts/loupe.svg?url';
import { type GameAtoutDefinition } from '@/lib/game-session';

export const loupeAtout: GameAtoutDefinition = {
  id: 'loupe',
  name: 'Loupe',
  description: 'Utilisable une fois par manche, permet de découvrir si un joueur est corrompu.',
  icon: loupeIcon,
  onRoundStart: (context) => {
    context.enableAbility([context.playerId, context.atoutId, 'Utiliser'], true);
  },
  abilities: [{
    label: 'Utiliser',
    onClick: (context) => {
      let removeControlButtons: () => void = () => undefined;
      const stopListeningForPlayer = context.onPlayerPressed((playerId) => {
        const player = context.players.find((currentPlayer) => currentPlayer.id === playerId);
        if (!player) return;

        stopListeningForPlayer();
        removeControlButtons();
        context.enableAbility([context.playerId, context.atoutId, 'Utiliser'], false);
        context.openDialog('Analyse', player.corrupted ? `${player.name} est corrompu.` : `${player.name} n’est pas corrompu.`);
      });
      removeControlButtons = context.addGroupButton([{
        buttons: [{
          backgroundColor: 'var(--color-game-red)',
          label: 'Arrêter l’analyse',
          onClick: () => {
            stopListeningForPlayer();
            removeControlButtons();
          },
        }],
        description: 'Choisis un joueur à analyser.',
      }]);
    },
  }],
};
