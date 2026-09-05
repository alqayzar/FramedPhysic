import { useState } from 'react';
import { GeneratedActionElementButton } from '@/components/actions/generated-action-viewer';
import { GeneratedElementViewer } from '@/components/actions/generated-element-viewer';
import { Button } from '@/components/ui/button';
import { type ActionElement } from '@/lib/action-elements';
import { type GameAtoutContext, type GameAtoutDefinition } from '@/lib/game-session';
import icon from '@/assets/atouts/mastermind.svg?url';

const MASTERMIND_SELECTED_ELEMENT_VALUE_KEY = 'mastermind-selected-element';
const SABOTEUR_CORRUPTED_ACTION_VALUE_KEY = 'saboteur-corrupted-action-id';

interface MastermindElementsProps {
  context: GameAtoutContext;
  elements: ActionElement[];
  previousSelectedElements: ActionElement[];
  previousSelectedElementCount: number;
}

function MastermindElements(props: MastermindElementsProps) {
  const [selectedElement, setSelectedElement] = useState<ActionElement>();
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const elements = props.elements.filter((element, index) => props.elements.findIndex((currentElement) => currentElement.id === element.id) === index);

  function handleElementViewerOpenChange(open: boolean) {
    if (!open) setSelectedElement(undefined);
  }

  function toggleSelectedElement() {
    if (!selectedElement) return;

    const nextSelectedElementIds = new Set(selectedElementIds);
    if (nextSelectedElementIds.has(selectedElement.id)) nextSelectedElementIds.delete(selectedElement.id);
    else nextSelectedElementIds.add(selectedElement.id);

    setSelectedElementIds(nextSelectedElementIds);
    props.context.setValue(MASTERMIND_SELECTED_ELEMENT_VALUE_KEY, nextSelectedElementIds.size > 0 ? elements.filter((element) => nextSelectedElementIds.has(element.id)) : null);
    setSelectedElement(undefined);
  }

  const isSelectedElement = Boolean(selectedElement && selectedElementIds.has(selectedElement.id));

  return (
    <>
      {props.previousSelectedElements.length > 0 && (
        <section className="mb-5 rounded-xl border-3 border-game-ink bg-game-yellow/30 p-3">
          <p className="text-sm font-black">Le joueur précédent a :</p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {props.previousSelectedElements.map((element) => (
              <li key={element.id}>
                <GeneratedActionElementButton element={element} onSelect={setSelectedElement} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-bold text-game-ink/65">{props.previousSelectedElementCount} bon{props.previousSelectedElementCount > 1 ? 's' : ''} élément{props.previousSelectedElementCount > 1 ? 's' : ''}</p>
        </section>
      )}
      {elements.length === 0 ? <p>Aucun élément n’est actuellement assigné.</p> : (
        <div className="max-h-[45svh] overflow-y-auto">
          <ul className="flex flex-wrap gap-1">
            {elements.map((element) => (
              <li className={selectedElementIds.has(element.id) ? 'flex rounded-lg ring-8 ring-inset ring-game-green' : 'flex'} key={element.id}>
                <GeneratedActionElementButton element={element} onSelect={setSelectedElement} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <GeneratedElementViewer
        emoji={selectedElement?.emoji}
        image={selectedElement?.image}
        imageSource={selectedElement?.imageUrl}
        onOpenChange={handleElementViewerOpenChange}
        open={Boolean(selectedElement)}
        title={selectedElement?.title}
      >
        {selectedElement && (
          <Button className="cartoon-press cartoon-press-md h-auto rounded-xl border-4 border-game-ink bg-game-purple px-5 py-3 text-lg font-black text-white hover:bg-game-purple" onClick={toggleSelectedElement} type="button">
            {isSelectedElement ? 'Désélectionner' : 'Sélectionner'}
          </Button>
        )}
      </GeneratedElementViewer>
    </>
  );
}

export const mastermindAtout: GameAtoutDefinition = {
  id: 'mastermind',
  name: 'Mastermind',
  icon: icon,
  description: 'Utilisable une fois par tour, affiche les éléments de toutes les actions assignées.',
  appliesToAllPlayers: true,
  onTurnStart: (context) => {
    context.enableAbility([context.playerId, context.atoutId, 'Utiliser'], true);
  },
  abilities: [{
    label: 'Utiliser',
    onClick: (context) => {
      const elements = context.players
        .flatMap((player) => player.actions ?? [])
        .flatMap((action) => action.segments)
        .filter((segment) => segment.type === 'element')
        .map((segment) => segment.element);
      const storedSelectedElements = context.getValue<ActionElement[] | ActionElement | null>(MASTERMIND_SELECTED_ELEMENT_VALUE_KEY, null);
      const previousSelectedElements = Array.isArray(storedSelectedElements) ? storedSelectedElements : storedSelectedElements ? [storedSelectedElements] : [];
      const corruptedActionId = context.getValue<string | null>(SABOTEUR_CORRUPTED_ACTION_VALUE_KEY, null);
      const corruptedAction = context.players.flatMap((player) => player.actions ?? []).find((action) => action.id === corruptedActionId);
      const corruptedActionElementIds = new Set(corruptedAction?.segments.filter((segment) => segment.type === 'element').map((segment) => segment.element.id));
      const previousSelectedElementCount = previousSelectedElements.filter((element) => corruptedActionElementIds.has(element.id)).length;

      context.enableAbility([context.playerId, context.atoutId, 'Utiliser'], false);
      context.openDialog('Mastermind', <MastermindElements context={context} elements={elements} previousSelectedElements={previousSelectedElements} previousSelectedElementCount={previousSelectedElementCount} />);
    },
  }]
};
