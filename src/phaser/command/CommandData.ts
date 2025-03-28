import { PileId } from "@phaser/constants/table";
import { CardController } from "@phaser/card/CardController";

export type cardMoveCommandData = {
  card: CardController;
  fromPile: PileId;
  fromPosition: number;
  toPile: PileId;
  toPosition: number;
};
