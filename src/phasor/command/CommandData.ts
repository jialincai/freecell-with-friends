import { PileId } from "@phasor/constants/table";
import { CardController } from "@phasor/card/CardController";

export type cardMoveCommandData = {
  card: CardController;
  fromPile: PileId;
  fromPosition: number;
  toPile: PileId;
  toPosition: number;
};
