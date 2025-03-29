import { PileId } from "@phaser/constants/table";
import { CardId } from "@phaser/card/domain/CardId";

export type CardMove = {
  card: CardId;
  fromPile: PileId;
  fromPosition: number;
  toPile: PileId;
  toPosition: number;
};

export function createCardMove(
  cardId: CardId,
  fromPile: PileId,
  fromPosition: number,
  toPile: PileId,
  toPosition: number,
): CardMove {
  return {
    card: cardId,
    fromPile,
    fromPosition,
    toPile,
    toPosition,
  };
}
