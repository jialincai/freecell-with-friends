import { Rank, Suit } from "@/phaser/constants/deck";
import { PileId } from "@/phaser/constants/table";
import { CardData } from "@/phaser/card/CardData";
import { CardState } from "@/phaser/card/state/CardState";
import { createCardId } from "../domain/CardId";

export type Card = {
  data: CardData;
  state: CardState;
};

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    data: {
      id: createCardId(suit, rank),
      suit,
      rank,
    },
    state: {
      pile: PileId.None,
      position: -1,
      flipped: false,
    },
  };
}
