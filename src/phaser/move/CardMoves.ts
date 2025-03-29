import { CardMove } from "@phaser/move/CardMove";

export type CardMoves = {
  sequence: CardMove[];
};

export function createCardMoves(sequence: CardMove[]): CardMoves {
  return {
    sequence,
  };
}
