import { CardMoveCommand } from "@phasor/Command";
import { CardController } from "@phasor/card/CardController";
import {
  canMoveCard,
  getDropPlacements,
  getDroppablePiles,
} from "@phasor/game/domain/FreecellRules";
import { STACK_DRAG_OFFSET } from "@phasor/constants/deck";
import { FOUNDATION_PILES, PileId } from "@phasor/constants/table";
import { DeckController } from "@phasor/deck/DeckController";
import Pile from "@phasor/Pile";
import { Command, CompositeCommand, PubSubStack } from "@utils/Function";

/**
 * Registers event handling for card interactions.
 */
export function setupCardInteraction(
  deckController: DeckController,
  commandStack: PubSubStack<Command>,
): void {
  deckController.cardControllers.forEach((controller) => {
    const view = controller.view;
    const model = controller.model;

    const isMovable = () => canMoveCard(model, deckController.model);

    view.on("dragstart", () => {
      if (!isMovable()) return;
      dragStart(controller, deckController);
    });

    view.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!isMovable()) return;
        drag(controller, deckController, dragX, dragY);
      },
    );

    view.on("dragend", () => {
      if (!isMovable()) return;
      dragEnd(controller, deckController);
    });

    view.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (!isMovable()) return;
        if (!(target instanceof Pile)) return;

        const command = drop(controller, deckController, target);
        if (command) commandStack.push(command);
      },
    );

    view.on("pointerdown", () => {
      if (!isMovable()) return;
      const command = snap(controller, deckController);
      if (command) commandStack.push(command);
    });
  });
}

// Input Handlers
function dragStart(card: CardController, deck: DeckController): void {
  deck.getCardChildren(card).forEach((child, i) => {
    child.view.setDepth(100 + i);
  });
}

function drag(
  card: CardController,
  deck: DeckController,
  dragX: number,
  dragY: number,
): void {
  deck.getCardChildren(card).forEach((child, i) => {
    const view = child.view;
    view.x = dragX;
    view.y = dragY + i * STACK_DRAG_OFFSET;
  });
}

function dragEnd(card: CardController, deck: DeckController): void {
  deck.getCardChildren(card).forEach((child) => {
    child.reposition(child.model.state.pile, child.model.state.position);
  });
}

function drop(
  card: CardController,
  deck: DeckController,
  target: Pile,
): Command | null {
  const pileId = target.name as PileId;

  const cardModel = card.model;
  const deckModel = deck.model;

  if (!getDroppablePiles(deckModel, cardModel, [pileId]).length) return null;

  const dragChildren = deck.getCardChildren(card);
  const updatedPlacements = getDropPlacements(
    deckModel,
    dragChildren.map((c) => c.model),
    pileId,
  );

  return new CompositeCommand(
    ...dragChildren.map(
      (c, i) =>
        new CardMoveCommand(
          c.model,
          c.model.state.pile,
          c.model.state.position,
          updatedPlacements[i].pileId,
          updatedPlacements[i].position,
        ),
    ),
  );
}

function snap(card: CardController, deck: DeckController): Command | null {
  const dragChildren = deck.getCardChildren(card);
  if (dragChildren.length > 1) return null;

  const cardModel = card.model;
  const deckModel = deck.model;

  const targetPile = getDroppablePiles(
    deckModel,
    cardModel,
    FOUNDATION_PILES,
  )[0];
  if (!targetPile) return null;

  const [updatedPlacement] = getDropPlacements(
    deckModel,
    [cardModel],
    targetPile,
  );

  return new CardMoveCommand(
    cardModel,
    cardModel.state.pile,
    cardModel.state.position,
    updatedPlacement.pileId,
    updatedPlacement.position,
  );
}
