import { Rank } from "@phaser/constants/deck";

import { Card, createCard } from "@phaser/card/state/Card";
import { Suit } from "@phaser/constants/deck";

export type Deck = {
  cards: Card[];
};

export function createDeck(): Deck {
  const cards: Card[] = [];

  for (const rank of Object.values(Rank).filter(
    (v): v is Rank => typeof v === "number",
  )) {
    for (const suit of Object.values(Suit)) {
      cards.push(createCard(suit, rank));
    }
  }

  return { cards };
}
