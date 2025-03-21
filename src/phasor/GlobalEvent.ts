import * as Phaser from "phaser";

import Card from "./Card";
import Pile from "./Pile";
import Deck from "./Deck";
import { getValidDropPiles } from "./Rule";

import { PileId } from "./constants/table";

// Register handlers for various global events.
export function registerGlobalEvents(scene: Phaser.Scene, deck: Deck): void {
  scene.input.on(
    "dragenter",
    (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject,
      target: Phaser.GameObjects.GameObject,
    ) => {
      if (gameObject instanceof Card && target instanceof Pile)
        dragEnter(gameObject, target, deck);
    },
  );

  scene.input.on(
    "dragleave",
    (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject,
      target: Phaser.GameObjects.GameObject,
    ) => {
      if (gameObject instanceof Card && target instanceof Pile)
        reset(scene, deck);
    },
  );

  scene.input.on(
    "pointerup",
    (
      _pointer: Phaser.Input.Pointer,
      _currentlyOver: Phaser.GameObjects.GameObject,
    ) => {
      reset(scene, deck);
    },
  );
}

function dragEnter(card: Card, pile: Pile, deck: Deck): void {
  const pileId = pile.name as PileId;
  if (getValidDropPiles(deck, card, [pileId]).length === 0) return;

  const pileChildren = deck.pileChildren(pileId);
  const highlightObject =
    pileChildren.length !== 0 ? pileChildren[pileChildren.length - 1] : pile;
  highlightObject.setTint(0x4A90E2);
}

function reset(scene: Phaser.Scene, deck: Deck): void {
  const piles = scene.children.list.filter(
    (obj) => obj instanceof Pile,
  ) as Pile[];

  piles.forEach((pile) => {
    pile.clearTint();
  });

  deck.cards.forEach((card) => {
    card.clearTint();
  });
}
