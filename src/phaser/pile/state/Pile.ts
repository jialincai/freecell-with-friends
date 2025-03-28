import { PileId } from "phaser/constants/table";
import { PileData } from "phaser/pile/PileData";

export type Pile = {
  data: PileData;
};

export function createPile(id: PileId): Pile {
  return {
    data: {
      id: id,
    },
  };
}
