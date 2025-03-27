import { Suit } from "@phasor/constants/deck";
import { PileId } from "@phasor/constants/table";
import { CardData } from "@phasor/card/CardData";
import { CardState } from "@phasor/card/state/CardState";

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
