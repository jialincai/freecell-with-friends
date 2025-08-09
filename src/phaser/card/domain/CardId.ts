import { Rank, Suit } from "@/phaser/constants/deck";

export type CardId = `${Suit}_${Rank}`;

export function createCardId(suit: Suit, rank: Rank): CardId {
  return `${suit}_${rank}` as CardId;
}
