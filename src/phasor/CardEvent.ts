import * as Phaser from "phaser";

import { Command, CompositeCommand, PubSubStack } from "@utils/Functions";

import Card from "./Card";
import { CardMoveCommand } from "./Command";
import Deck from "./Deck";
import Pile from "./Pile";
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
  commandsStack: PubSubStack<Command>,
): void {
  const executeIfMovable =
    (fn: Function) =>
    (card: Card, deck: Deck, ...args: any[]) => {
      if (!canMoveCard(card, deck)) return;

      const command = fn(card, deck, ...args);
      if (command) commandsStack.push(command);
    };

  deck.cards.forEach((card) => {
    card.on(
      "dragstart",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) =>
        executeIfMovable(dragStart)(card, deck),
    );
    card.on(
      "dragend",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) =>
        executeIfMovable(dragEnd)(card, deck),
    );
    card.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) =>
        executeIfMovable(drag)(card, deck, dragX, dragY),
    );
    card.on(
      "drop",
      (_pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject) =>
        executeIfMovable(drop)(card, deck, target),
    );
    card.on("pointerdown", (_pointer: Phaser.Input.Pointer) => {
      executeIfMovable(snap)(card, deck);
    });
  });
}

function dragStart(card: Card, deck: Deck): void {
  deck.cardChildren(card).forEach((child, i) => child.setDepth(100 + i));
}

function dragEnd(card: Card, deck: Deck): void {
  deck.cardChildren(card).forEach((child) => {
    child.reposition(child.pile, child.position);
  });
}

function drag(card: Card, deck: Deck, dragX: number, dragY: number): void {
  deck.cardChildren(card).forEach((child, i) => {
    child.x = dragX;
    child.y = dragY + i * STACK_DRAG_OFFSET;
  });
}

function drop(card: Card, deck: Deck, target: Pile): Command | null {
  const pileId = target.name as PileId;
  if (getValidDropPiles(deck, card, [pileId]).length === 0) return null;

  const dragChildren = deck.cardChildren(card);
  const updatedPlacements = getUpdatedCardPlacements(
    deck,
    dragChildren,
    pileId,
  );

  return new CompositeCommand(
    ...dragChildren.map(
      (child, index) =>
        new CardMoveCommand(
          child,
          child.pile,
          child.position,
          updatedPlacements[index].pileId,
          updatedPlacements[index].position,
        ),
    ),
  );
}

function snap(card: Card, deck: Deck): Command | null {
  if (deck.cardChildren(card).length > 1) return null;

  const targetPile = getValidDropPiles(deck, card, FOUNDATION_PILES)?.[0];
  if (!targetPile) return null;

  const [updatedPlacement] = getUpdatedCardPlacements(deck, [card], targetPile);

  return new CardMoveCommand(
    card,
    card.pile,
    card.position,
    updatedPlacement.pileId,
    updatedPlacement.position,
  );
}
