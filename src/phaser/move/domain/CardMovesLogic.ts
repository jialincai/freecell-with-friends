import { CardMoves, createCardMoves } from "@phaser/move/CardMoves";

export function deriveUndo(cardMoves: CardMoves): CardMoves {
  return createCardMoves(
    [...cardMoves.sequence].reverse().map((move) => {
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
