import * as Phaser from "phaser";

import {
  CompositeCommand,
  createCompositeCommand,
  PubSubStack,
} from "@utils/Function";

import Card from "./Card";
import { createCardMoveCommand } from "./CardMove";
import Deck from "./Deck";
import PileView from "./PileView";
import {
  canMoveCard,
  getUpdatedCardPlacements,
  getValidDropPiles,
} from "./Rule";

import { STACK_DRAG_OFFSET } from "./constants/deck";
import { FOUNDATION_PILES, PileId } from "./constants/table";

// Register handlers for various card events.
export function registerCardEvents(
  deck: Deck,
  commandsStack: PubSubStack<CompositeCommand>,
): void {
  deck.cards.forEach((card) => {
    card.on(
      "dragstart",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) => {
        if (!canMoveCard(card, deck)) return;
        dragStart(card, deck);
      },
    );

    card.on(
      "dragend",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) => {
        if (!canMoveCard(card, deck)) return;
        dragEnd(card, deck);
      },
    );

    card.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!canMoveCard(card, deck)) return;
        drag(card, deck, dragX, dragY);
      },
    );

    card.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (!canMoveCard(card, deck)) return;
        const command = drop(card, deck, target as PileView);
        if (command) commandsStack.push(command);
      },
    );

    card.on("pointerdown", (_pointer: Phaser.Input.Pointer) => {
      if (!canMoveCard(card, deck)) return;
      const command = snap(card, deck);
      if (command) commandsStack.push(command);
    });
  });
}

function dragStart(card: Card, deck: Deck): void {
  deck.getCardChildren(card).forEach((child, i) => child.setDepth(100 + i));
}

function dragEnd(card: Card, deck: Deck): void {
  deck.getCardChildren(card).forEach((child) => {
    child.reposition(child.pile, child.position);
  });
}

function drag(card: Card, deck: Deck, dragX: number, dragY: number): void {
  deck.getCardChildren(card).forEach((child, i) => {
    child.x = dragX;
    child.y = dragY + i * STACK_DRAG_OFFSET;
  });
}

function drop(card: Card, deck: Deck, target: PileView): CompositeCommand | null {
  const pileId = target.name as PileId;
  if (getValidDropPiles(deck, card, [pileId]).length === 0) return null;

  const dragChildren = deck.getCardChildren(card);
  const updatedPlacements = getUpdatedCardPlacements(
    deck,
    dragChildren,
    pileId,
  );

  return createCompositeCommand(
    dragChildren.map((card, index) =>
      createCardMoveCommand(
        card,
        { pileId: card.pile, position: card.position },
        updatedPlacements[index],
      ),
    ),
  );
}

function snap(card: Card, deck: Deck): CompositeCommand | null {
  if (deck.getCardChildren(card).length > 1) return null;

  const targetPile = getValidDropPiles(deck, card, FOUNDATION_PILES)?.[0];
  if (!targetPile) return null;

  const [updatedPlacement] = getUpdatedCardPlacements(deck, [card], targetPile);

  return createCompositeCommand([
    createCardMoveCommand(
      card,
      { pileId: card.pile, position: card.position },
      updatedPlacement,
    ),
  ]);
}
