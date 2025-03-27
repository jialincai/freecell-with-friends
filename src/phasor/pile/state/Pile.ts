import { PileId } from "@phasor/constants/table";
import { PileData } from "@phasor/pile/PileData";

export type Pile = {
  data: PileData;
}

export function createPile(id: PileId): Pile {
  return {
    data: {
      id: id,
    },
  };
}
