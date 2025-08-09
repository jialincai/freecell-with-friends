import { CardMove } from "@/phaser/move/CardMove";

export type CardMoveSequence = {
  steps: CardMove[];
  useTween: boolean;
};

export function createCardMoveSequence(
  steps: CardMove[],
  useTween: boolean = false,
): CardMoveSequence {
  return {
    steps,
    useTween,
  };
}
