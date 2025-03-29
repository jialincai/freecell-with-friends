import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";

export function deriveUndo(cardMoves: CardMoveSequence): CardMoveSequence {
  return createCardMoveSequence(
    [...cardMoves.steps].reverse().map((move) => {
      return {
        card: move.card,
        fromPile: move.toPile,
        fromPosition: move.toPosition,
        toPile: move.fromPile,
        toPosition: move.fromPosition,
      };
    }),
  );
}
