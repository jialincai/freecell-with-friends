import { CardMove } from "@phaser/move/CardMove";
import { CardMoves, createCardMoves } from "@phaser/move/CardMoves";

export function deriveUndoCardMove(cardMove: CardMove): CardMove {
  return {
    card: cardMove.card,
    fromPile: cardMove.toPile,
    fromPosition: cardMove.toPosition,
    toPile: cardMove.fromPile,
    toPosition: cardMove.fromPosition,
  };
}

export function deriveUndoCardMoves(cardMoves: CardMoves): CardMoves {
  return createCardMoves(
    [...cardMoves.sequence].reverse().map(deriveUndoCardMove),
  );
}
