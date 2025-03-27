import { Suit } from "phaser/constants/deck";
import { PileId } from "phaser/constants/table";
import { CardData } from "phaser/card/CardData";
import { CardState } from "phaser/card/state/CardState";

export type Card = {
  data: CardData;
  state: CardState;
};

export function createCard(suit: Suit, value: number): Card {
  return {
    data: {
      id: `${suit}-${value}`, // For now, assume single deck so IDs like heart-1 or spade-12 are unique.
      suit,
      value,
    },
    state: {
      pile: PileId.None,
      position: -1,
      flipped: false,
    },
  };
}
