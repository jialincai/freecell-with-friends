import { PileId } from "phaser/constants/table";

export type CardState = {
  pile: PileId;
  position: number;
  flipped: boolean;
};
