import { CardMoveCommand } from "../state/Command";

export function undo(cardMoves: CardMoveCommand[]): void {
    cardMoves.forEach((move) => {
        move.data.card.setPilePosition(move.data.fromPile, move.data.fromPosition);
    });
}