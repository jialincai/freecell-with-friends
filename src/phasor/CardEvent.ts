import * as Phaser from "phaser";

import { Command, CompositeCommand, PubSubStack } from "@utils/Functions";

import Card from "./Card";
import { CardMoveCommand } from "./Command";
import Deck from "./Deck";
import {
  canMoveCard,
  getUpdatedCardPlacements,
  getValidDropPiles,
} from "./Rule";

import { STACK_DRAG_OFFSET } from "./constants/deck";
import { FOUNDATION_PILES, PileId } from "./constants/table";

export function registerCardEvents(
  deck: Deck,
  commandsStack: PubSubStack<Command>,
): void {
  const executeIfMovable =
    (fn: Function) =>
    (card: Card, ...args: any[]) => {
      if (!canMoveCard(deck, card)) return;

      const command = fn(deck, card, ...args);
      if (command) commandsStack.push(command);
    };

  deck.cards.forEach((card) => {
    card.on(
      "dragstart",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) =>
        executeIfMovable(dragCardStart)(card),
    );
    card.on(
      "dragend",
      (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) =>
        executeIfMovable(dragCardEnd)(card),
    );
    card.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) =>
        executeIfMovable(dragCard)(card, dragX, dragY),
    );
    card.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        dropZone: Phaser.GameObjects.GameObject,
      ) => executeIfMovable(dropCard)(card, dropZone),
    );
    card.on("pointerdown", (_pointer: Phaser.Input.Pointer) => {
      executeIfMovable(snapCard)(card);
    });
  });
}

function dragCardStart(deck: Deck, card: Card): Command | null {
  deck.cardChildren(card).forEach((child, i) => child.setDepth(100 + i));
  return null;
}

function dragCardEnd(deck: Deck, card: Card): Command | null {
  deck.cardChildren(card).forEach((child) => {
    child.reposition(child.pile, child.position);
  });
  return null;
}

function dragCard(
  deck: Deck,
  card: Card,
  dragX: number,
  dragY: number,
): Command | null {
  deck.cardChildren(card).forEach((child, i) => {
    child.x = dragX;
    child.y = dragY + i * STACK_DRAG_OFFSET;
  });
  return null;
}

function dropCard(
  deck: Deck,
  card: Card,
  dropZone: Phaser.GameObjects.GameObject,
): Command | null {
  const pileId = dropZone.name as PileId;
  if (!getValidDropPiles(deck, card, [pileId]).some(Boolean)) return null;

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

function snapCard(deck: Deck, card: Card): Command | null {
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
