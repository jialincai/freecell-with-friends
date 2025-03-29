import { CardMove } from "@phaser/move/CardMove";

export type CardMoveSequence = {
  steps: CardMove[];
};

export function createCardMoveSequence(steps: CardMove[]): CardMoveSequence {
  return {
    steps,
  };
}
