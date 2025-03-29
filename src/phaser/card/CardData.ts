import { Suit } from "@phaser/constants/deck";
import { CardId } from "./domain/CardId";

export type CardData = {
  id: CardId;
  suit: Suit;
  rank: number;
};
