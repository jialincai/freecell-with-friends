import { CardMoveCommand } from "@phasor/Command";
import { CardController } from "@phasor/card/CardController";
import {
  canMoveCard,
  calculateNewPilePosition,
  filterValidDropPiles,
} from "@phasor/game/domain/FreecellRules";
import { STACK_DRAG_OFFSET } from "@phasor/constants/deck";
import { FOUNDATION_PILES, PileId } from "@phasor/constants/table";
import { DeckController } from "@phasor/deck/DeckController";
import Pile from "@phasor/Pile";
import { Command, CompositeCommand, PubSubStack } from "@utils/Function";

export function setupCardInteraction(
  deckController: DeckController,
  commandStack: PubSubStack<Command>,
): void {
  deckController.cardControllers.forEach((cardController) => {
    const isMovable = () =>
      canMoveCard(deckController.model, cardController.model);

    cardController.view.on("dragstart", () => {
      if (!isMovable()) return;
      updateDragCardRenderOrder(deckController, cardController);
    });

    cardController.view.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!isMovable()) return;
        updateDragCardWorldPosition(
          deckController,
          cardController,
          dragX,
          dragY,
        );
      },
    );

    cardController.view.on("dragend", () => {
      if (!isMovable()) return;
      resetDragCardWorldPosition(deckController, cardController);
    });

    cardController.view.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (!isMovable()) return;
        if (!(target instanceof Pile)) return;
        dropCardInNewPile(deckController, cardController, target, commandStack);
      },
    );

    cardController.view.on("pointerdown", () => {
      if (!isMovable()) return;
      snapCardToFoundationPile(deckController, cardController, commandStack);
    });
  });
}

function updateDragCardRenderOrder(
  deck: DeckController,
  card: CardController,
): void {
  deck.getCardsStartingFrom(card).forEach((child, i) => {
    child.view.setDepth(100 + i);
  });
}

function updateDragCardWorldPosition(
  deck: DeckController,
  card: CardController,
  dragX: number,
  dragY: number,
): void {
  deck.getCardsStartingFrom(card).forEach((child, i) => {
    const view = child.view;
    view.x = dragX;
    view.y = dragY + i * STACK_DRAG_OFFSET;
  });
}

function resetDragCardWorldPosition(
  deck: DeckController,
  card: CardController,
): void {
  deck.getCardsStartingFrom(card).forEach((child) => {
    child.setPilePosition(child.model.state.pile, child.model.state.position);
  });
}

function dropCardInNewPile(
  deck: DeckController,
  card: CardController,
  target: Pile,
  commandStack: PubSubStack<Command>,
): void {
  const pileId = target.name as PileId;
  const cardModel = card.model;
  const deckModel = deck.model;

  if (!filterValidDropPiles(deckModel, cardModel, [pileId]).length) return;

  const dragChildren = deck.getCardsStartingFrom(card);
  const updatedPlacements = calculateNewPilePosition(
    deckModel,
    dragChildren.map((c) => c.model),
    pileId,
  );

  commandStack.push(
    new CompositeCommand(
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
    ),
  );
}

function snapCardToFoundationPile(
  deck: DeckController,
  card: CardController,
  commandStack: PubSubStack<Command>,
): void {
  const dragChildren = deck.getCardsStartingFrom(card);
  if (dragChildren.length > 1) return;

  const cardModel = card.model;
  const deckModel = deck.model;

  const targetPile = filterValidDropPiles(
    deckModel,
    cardModel,
    FOUNDATION_PILES,
  )[0];
  if (!targetPile) return;

  const [updatedPlacement] = calculateNewPilePosition(
    deckModel,
    [cardModel],
    targetPile,
  );

  commandStack.push(
    new CardMoveCommand(
      cardModel,
      cardModel.state.pile,
      cardModel.state.position,
      updatedPlacement.pileId,
      updatedPlacement.position,
    ),
  );
}
