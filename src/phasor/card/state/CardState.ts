import { PileId } from "@phasor/constants/table";

export type CardState = {
  pile: PileId;
  position: number;
  flipped: boolean;
};
