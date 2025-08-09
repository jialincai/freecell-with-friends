import { PubSubStack } from "@/utils/Function";
import { FOUNDATION_PILES, PileId } from "@/phaser/constants/table";
import { CardController } from "@/phaser/card/CardController";
import { DeckController } from "@/phaser/deck/DeckController";
import { PileView } from "@/phaser/pile/PileView";
import {
  canMoveCard,
  filterValidDropPiles,
} from "@/phaser/game/domain/FreecellRules";
import { createCardMove } from "@/phaser/move/CardMove";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@/phaser/move/CardMoveSequence";
import { getNextCardPositionsInPile } from "@/phaser/deck/domain/DeckLogic";
import { STACK_DRAG_OFFSET } from "@/phaser/constants/dimensions";
import { expand, withTween } from "@/phaser/move/domain/CardMoveSequenceLogic";

export function setupCardInteraction(
  deckController: DeckController,
  moveHistory: PubSubStack<CardMoveSequence>,
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
        dropCardsInNewPile(deckController, cardController, target, moveHistory);
      },
    );

    cardController.view.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!isMovable()) return;
      if (pointer.getDistance() > 1) return;

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

function dropCardsInNewPile(
  deck: DeckController,
  card: CardController,
  target: PileView,
  moveHistory: PubSubStack<CardMoveSequence>,
): void {
  const pileId = target.name as PileId;
  const dropTarget = filterValidDropPiles(deck.model, card.model, [
    pileId,
  ])?.[0];
  if (!dropTarget) return;

  const dragChildren = deck.getCardsStartingFrom(card);
  const newPilePositions = getNextCardPositionsInPile(
    deck.model,
    pileId,
    dragChildren.length,
  );

  const moveSequence = createCardMoveSequence(
    dragChildren.map((card, i) => {
      return createCardMove(
        card.model.data.id,
        card.model.state.pile,
        card.model.state.position,
        newPilePositions[i].pile,
        newPilePositions[i].position,
      );
    }),
  );

  moveHistory.push(
    dragChildren.length > 1
      ? withTween(expand(deck.model, moveSequence))
      : moveSequence,
  );
}

function snapCardToFoundationPile(
  deck: DeckController,
  card: CardController,
  moveHistory: PubSubStack<CardMoveSequence>,
): void {
  const dragChildren = deck.getCardsStartingFrom(card);
  if (dragChildren.length > 1) return;

  const targetFoundationPile = filterValidDropPiles(
    deck.model,
    card.model,
    FOUNDATION_PILES,
  )[0];
  if (!targetFoundationPile) return;

  const [newPilePosition] = getNextCardPositionsInPile(
    deck.model,
    targetFoundationPile,
    1,
  );

  const moveSequence = createCardMoveSequence([
    createCardMove(
      card.model.data.id,
      card.model.state.pile,
      card.model.state.position,
      newPilePosition.pile,
      newPilePosition.position,
    ),
  ]);
  moveHistory.push(withTween(moveSequence));
}
