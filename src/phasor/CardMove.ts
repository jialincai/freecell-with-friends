import { Command } from "@utils/Function";

import Card from "./Card";
import { PileId } from "./constants/table";

type CardMoveCommand = Command & {
  type: "card-move";
  data: {
    card: Card;
    from: { pileId: PileId; position: number };
    to: { pileId: PileId; position: number };
  };
};

export function createCardMoveCommand(
  card: Card,
  from: { pileId: PileId; position: number },
  to: { pileId: PileId; position: number },
): CardMoveCommand {
  return {
    type: "card-move",
    data: { card, from, to },
    do: () => card.reposition(to.pileId, to.position),
    undo: () => card.reposition(from.pileId, from.position),
  };
}
