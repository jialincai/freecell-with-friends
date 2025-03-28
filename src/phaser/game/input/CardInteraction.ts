import { Command, PubSubStack } from "@utils/Function";
import { STACK_DRAG_OFFSET } from "phaser/constants/deck";
import { FOUNDATION_PILES, PileId } from "phaser/constants/table";
import { CardMoveCommand, createCardMoveCommand } from "phaser/command/state/Command";
import { CardController } from "phaser/card/CardController";
import { DeckController } from "phaser/deck/DeckController";
import { PileView } from "phaser/pile/PileView";
import {
  canMoveCard,
  calculateNewPilePosition,
  filterValidDropPiles,
} from "phaser/game/domain/FreecellRules";

export function setupCardInteraction(
  deckController: DeckController,
  moveHistory: PubSubStack<CardMoveCommand[]>,
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
        if (!(target instanceof PileView)) return;
        dropCardInNewPile(deckController, cardController, target, moveHistory);
      },
    );

    cardController.view.on("pointerdown", () => {
      if (!isMovable()) return;
      snapCardToFoundationPile(deckController, cardController, moveHistory);
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
  target: PileView,
  _moveHistory: PubSubStack<CardMoveCommand[]>,
): void {
  const pileId = target.name as PileId;
  if (!filterValidDropPiles(deck.model, card.model, [pileId]).length) return;

  const dragChildren = deck.getCardsStartingFrom(card);
  const newPilePositions = calculateNewPilePosition(
    deck.model,
    dragChildren.map((c) => c.model),
    pileId,
  );

  // TODO sync up do and undo...
  const cardMoves = dragChildren.map((card, i) => {
    return createCardMoveCommand(
      card,
      newPilePositions[i].pile,
      newPilePositions[i].position,
    );
  });
  // moveHistory.push(cardMove);

  cardMoves.forEach((cardMove) => {
    cardMove.data.card.setPilePosition(
      cardMove.data.toPile,
      cardMove.data.toPosition,
    );
  });
}

function snapCardToFoundationPile(
  deck: DeckController,
  card: CardController,
  _moveHistory: PubSubStack<CardMoveCommand[]>,
): void {
  const dragChildren = deck.getCardsStartingFrom(card);
  if (dragChildren.length > 1) return;

  const targetFoundationPile = filterValidDropPiles(
    deck.model,
    card.model,
    FOUNDATION_PILES,
  )[0];
  if (!targetFoundationPile) return;

  const [newPilePosition] = calculateNewPilePosition(
    deck.model,
    [card.model],
    targetFoundationPile,
  );

  // TODO sync up do and undo...
  const cardMove = createCardMoveCommand(
    card,
    newPilePosition.pile,
    newPilePosition.position,
  );
  // moveHistory.push(cardMove);

  card.setPilePosition(cardMove.data.toPile, cardMove.data.toPosition);
}
