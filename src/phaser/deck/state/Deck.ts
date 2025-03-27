import { NUM_VALUES } from "phaser/constants/deck";

import { Card, createCard } from "phaser/card/state/Card";
import { Suit } from "phaser/constants/deck";

export type Deck = {
  cards: Card[];
};

export function createDeck(): Deck {
  const cards: Card[] = [];

  for (let value = 1; value <= NUM_VALUES; value++) {
    for (const suit of Object.values(Suit)) {
      cards.push(createCard(suit, value));
    }
  }

  return { cards };
}
